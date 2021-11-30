import { BrowserWindow } from 'electron'
import { join } from 'path'
import iracing from 'node-irsdk-2021';

import Watcher from '@app/state';
import { NotifyOfSessionChanged } from "@app/watchers/NotifyOfSessionChanged";
import { NotifyOfIncident } from "@app/watchers/NotifyOfIncident";
import { OffTrackTimer } from '@app/watchers/offtrack';
import '@app/ipc-inbox';

import { PitBoxTimer } from '@app/watchers/pitstop';
import { MajorIncidentWatcher } from './watchers/fcy';

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

  win.loadFile(join(__dirname, '..', 'ui', 'main.html'));
  win.webContents.openDevTools();

  startSDK(win);
}

function startSDK(win: BrowserWindow) {
  const sdk = iracing.init({ 
    sessionInfoUpdateInterval: 100 /* ms */, 
    telemetryUpdateInterval: 50
  });

  const outbox = win.webContents;

  sdk.on('Connected', () => console.log('connected to iRacing!'));

  const config = {
    observers: [ 
      new NotifyOfIncident(outbox), 
      new NotifyOfSessionChanged(outbox), 
      new OffTrackTimer(outbox, 10, 2.0),
      new PitBoxTimer(30), 
      new MajorIncidentWatcher(outbox)
    ]
  }

  const watcher = new Watcher(config);

  sdk.on('Telemetry', watcher.onTelemetryUpdate.bind(watcher));
  sdk.on('SessionInfo', watcher.onSessionUpdate.bind(watcher));
}