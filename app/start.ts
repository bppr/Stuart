import { join } from 'path'
import fs from 'fs';

import { BrowserWindow } from 'electron'
import iracing from 'node-irsdk-2021';

import Watcher from './state';
import { NotifyOfSessionChanged } from "./watchers/NotifyOfSessionChanged";
import { IRacingIncidentCount } from "./watchers/NotifyOfIncident";
import { OffTrackTimer } from './watchers/offtrack';
import { PitBoxTimer } from './watchers/pitstop';
import { MajorIncidentWatcher } from './watchers/fcy';
import { IncidentDb } from '@common/incidentdb';
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

  const outbox = win.webContents;
  Application.initialize(outbox);

  const incidentDb = Application.getInstance().incidents;

  sdk.on('Connected', () => console.log('connected to iRacing!'));

  const config = {
    observers: [ 
      new IRacingIncidentCount(incidentDb), 
      new NotifyOfSessionChanged(outbox), 
      new OffTrackTimer(incidentDb, 10, 2.0),
      new PitBoxTimer(30), 
      new MajorIncidentWatcher(outbox, incidentDb)
    ]
  }

  const watcher = new Watcher(config);

  sdk.on('Telemetry', watcher.onTelemetryUpdate.bind(watcher));
  sdk.on('SessionInfo', watcher.onSessionUpdate.bind(watcher));
}