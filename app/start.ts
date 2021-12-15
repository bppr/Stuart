import { join } from 'path'
import fs from 'fs';

import { BrowserWindow } from 'electron'
import iracing from 'node-irsdk-2021';

import Watcher, { Outbox } from './state';
import { NotifyOfSessionChanged } from "./watchers/NotifyOfSessionChanged";
import { IRacingIncidentCount } from "./watchers/NotifyOfIncident";
import { OffTrackTimer } from './watchers/offtrack';
import { OffTrackTimer2 } from './watchers/offtrack2';
import { MajorIncidentWatcher } from './watchers/fcy';
import { Clock } from "./watchers/clock";
import Application from './application';

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
    sessionInfoUpdateInterval: 100 /* ms */,
    telemetryUpdateInterval: 50
  });


  let consoleOutbox: Outbox = {
    send: (channel, data) => {
      console.log('O (' + channel + '): ' + JSON.stringify(data));
    }
  }

  //Application.getInstance().addOutbox(consoleOutbox);

  const incidentDb = Application.getInstance().incidents;
  const outbox = Application.getInstance().getOutbox();

  sdk.on('Connected', () => console.log('connected to iRacing!'));

  const offTrack = new OffTrackTimer(incidentDb, 10, 2.0);
  offTrack.reportOffTracks = false;
  offTrack.reportTrackLimits = false;

  const offTrack2 = new OffTrackTimer2(incidentDb);

  const config = {
    observers: [
      new IRacingIncidentCount(incidentDb),
      new NotifyOfSessionChanged(outbox),
      offTrack,
      offTrack2,
      new MajorIncidentWatcher(outbox, incidentDb),
      new Clock(outbox)
    ]
  }

  const watcher = new Watcher(config);

  sdk.on('Telemetry', watcher.onTelemetryUpdate.bind(watcher));
  sdk.on('SessionInfo', watcher.onSessionUpdate.bind(watcher));
}
