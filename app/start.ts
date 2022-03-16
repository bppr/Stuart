import { join } from 'path'
import fs from 'fs';

import { BrowserWindow, ipcMain } from 'electron'
import iracing from 'node-irsdk-2021';
import {IRSDKObserver} from './state/streams';
import incidentCount from './state/watchers/incident-count'
import clock from './state/views/clock';

import './ipc-inbox';

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
    sessionInfoUpdateInterval: 2000 /* ms */,
    telemetryUpdateInterval: 2000
  });

  sdk.on('Connected', () => console.log('connected to iRacing!'));

  const observer = new IRSDKObserver(sdk);

  let incidents = observer.createEventFeed([
    incidentCount
  ]);
  incidents.subscribe(incData => {
    win.webContents.send('incident-data', incData);
  });
  observer.getViewFeed(clock).subscribe(clockState => win.webContents.send('clock-update', clockState));
}
