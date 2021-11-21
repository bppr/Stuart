const { BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');
const iracing = require('node-irsdk-2021');
const { handleSessionUpdate, handleTelemetryUpdate } = require('./state.js');

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
    telemetryUpdateInterval: 500
  });

  sdk.on('Connected', () => console.log('connected to iRacing!'));
  sdk.on('SessionInfo', handleSessionUpdate(win.webContents));
  sdk.on('Telemetry', handleTelemetryUpdate);
}

module.exports = { start };