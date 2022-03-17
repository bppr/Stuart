import { join } from 'path'
import fs from 'fs';

import { BrowserWindow, ipcMain } from 'electron'
import iracing from 'node-irsdk-2021';
import { IRSDKObserver } from './state/streams';
import incidentCount from './state/watchers/incident-count'
import lapCount from './state/watchers/lap-count'
import clock from './state/views/clock';
import offTrack from './state/watchers/offtrack';

import './ipc-inbox';
import { combineLatest, map, Observable, throttleTime } from 'rxjs';

function getMainFile(): string {
  const root = join(__dirname, '..');
  const devPath = join(root, 'build', 'ui', 'html', 'main.html');
  const builtPath = join(root, 'ui', 'html', 'main.html');

  return fs.existsSync(devPath) ? devPath : builtPath
}

export function start() {
  console.log('creating window');

  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      sandbox: true,
      preload: join(__dirname, 'api-bridge.js')
    }
  });


  win.loadFile(getMainFile());
  // win.webContents.openDevTools();

  startSDK(win);
}

function startSDK(win: BrowserWindow) {
  const sdk = iracing.init({
    sessionInfoUpdateInterval: 1000 /* ms */,
    telemetryUpdateInterval: 250
  });

  sdk.on('Connected', () => console.log('connected to iRacing!'));

  const observer = new IRSDKObserver(sdk);

  // create and publish the incident feed
  let incSub = observer.createEventFeed([
    incidentCount,
   // lapCount, // for testing
  ], [
    offTrack
  ]).subscribe(incData =>
    win.webContents.send('incident-data', incData)
  );

  // create and publish the various state observer feeds
  let clockSub = observer.createViewFeed(clock).subscribe(clockState =>
    win.webContents.send('clock-update', clockState)
  );

  // create a telemetry feed for just the data
  let telemetrySource = new Observable<iracing.TelemetryData>(o => sdk.on("Telemetry", (data: iracing.TelemetryData) => o.next(data)));
  let sessionSource = new Observable<iracing.SessionData>(o => sdk.on("SessionInfo", (data: iracing.SessionData) => o.next(data)));

  let combinedSource = combineLatest([telemetrySource, sessionSource]);
  let telemSub = combinedSource.pipe(throttleTime(1000))
    .subscribe(data => win.webContents.send("telemetry-json", data));

  // telemetry feed of AppState
  //observer.createViewFeed((_) => _).pipe(throttleTime(1000)).subscribe(appState => win.webContents.send("telemetry-json", JSON.parse(JSON.stringify(appState))));

  /* maybe not necessary?
  win.on("close", (_) => {
    incSub.unsubscribe();
    clockSub.unsubscribe();
    telemSub.unsubscribe();
  })
  */

}
