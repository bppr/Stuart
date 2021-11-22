const { BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');
const iracing = require('node-irsdk-2021');
const { handleSessionUpdate, handleTelemetryUpdate } = require('./state.js');
const StateWatcher = require('./statewatcher.js');

function start() {
  console.log('creating window');

  const win = new BrowserWindow({ 
    width: 1024, 
    height: 768, 
    webPreferences: {
      sandbox: true,
      preload: join(__dirname, 'messenger.js')
    }
  });

  win.loadFile(join(__dirname, '..', 'ui', 'main.html'));

  startSDK(win);
}

function startSDK(win) {
  const sdk = iracing.init({ 
    sessionInfoUpdateInterval: 100 /* ms */, 
    telemetryUpdateInterval: 50
  });

  sdk.on('Connected', () => console.log('connected to iRacing!'));
  sdk.on('SessionInfo', handleSessionUpdate(win.webContents));
  sdk.on('Telemetry', handleTelemetryUpdate(win.webContents));
  
 // sdk.on('SessionInfo', (sess) => console.log("S:" + JSON.stringify(sess.data)))
 // sdk.on('Telemetry', (t) => console.log("T:" + JSON.stringify(t.values)));
  
  var sw = new StateWatcher(win.webContents);
  sw.bindToIRSDK(sdk);
  
}

ipcMain.on('replay', (ev, data) => {
  const sdk = iracing.getInstance();
  sdk.playbackControls.searchTs(data.sessionNum, data.sessionTime);
  sdk.camControls.switchToCar(data.carNumber)
});

ipcMain.on('focus-camera', (ev, data) => {
  const sdk = iracing.getInstance();
  sdk.camControls.switchToCar(data.carNumber);
});

ipcMain.on('jump-to-time', (ev, data) => {
  const sdk = iracing.getInstance();
  sdk.playbackControls.searchTs(data.sessionNum, data.sessionTime);
});

module.exports = { start };