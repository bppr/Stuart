import { join } from 'path'
import fs from 'fs';

import { app, BrowserWindow, ipcMain } from 'electron'
import iracing from 'node-irsdk-2021';

import { IRSDKObserver } from './state/streams';
import incidentCount from './state/watchers/incident-count'
import clock from './state/views/clock';
import offTrack from './state/watchers/offtrack';
import pacing from './state/views/pacing';
import drivers from './state/views/drivers';
import camera from './state/views/camera';


import './ipc-inbox';
import { throttleTime } from 'rxjs';

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
    minWidth: 960,
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
  let readFromFilePath = process.env["STUART_READ_LOG"];
  let writeToFilePath = process.env["STUART_WRITE_LOG"];

  console.log("Arguments: ", process.argv);

  let observer: IRSDKObserver;
  if (readFromFilePath) {
    observer = IRSDKObserver.fromFile(readFromFilePath);
  } else {
    const sdk = iracing.init({
      sessionInfoUpdateInterval: 1000 /* ms */,
      telemetryUpdateInterval: 250
    });

    sdk.on('Connected', () => console.log('connected to iRacing!'));

    observer = IRSDKObserver.fromIRSDK(sdk);
  }

  win.once("ready-to-show", () => {
    // create and publish the incident feed
    let incSub = observer.getEventFeed([
      incidentCount,
      // lapCount, // for testing
    ], [
      offTrack
    ]).subscribe(incData =>
      win.webContents.send('incident-data', incData)
    );

    // create and publish the various state observer feeds
    observer.createViewFeed(clock).subscribe(clockState => win.webContents.send('clock-update', clockState));
    observer.createViewFeed(drivers).subscribe(driverStates => win.webContents.send('drivers', driverStates));
    observer.createViewFeed(pacing).subscribe(paceState => win.webContents.send('pace-state', paceState));
    observer.createViewFeed(camera).subscribe(cameraState => win.webContents.send('camera', cameraState));

    // create a telemetry feed for just the data
    observer.getRawTelemetryFeed().pipe(throttleTime(2000))
      .subscribe(data => win.webContents.send("telemetry-json", data));
  });

  if (writeToFilePath) {
    console.log("Logging telemetry data to: " + writeToFilePath);
    observer.toFile(writeToFilePath);
  }
}
