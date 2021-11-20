const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const iracing = require('node-irsdk-2021');

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

  win.loadFile(join(__dirname, 'main.html'));

  startSDK(win);
}

function startSDK(win) {
  const sdk = iracing.init({ 
    sessionInfoUpdateInterval: 100 /* ms */, 
    telemetryUpdateInterval: 500
  });

  sdk.on('Connected', () => console.log('connected to iRacing!'));

  sdk.on('SessionInfo', (info) => {
    console.log('got sessionInfo', info.timestamp);
    win.webContents.send('session-info', info);
  });

  // sdk.on('Telemetry', (data) => {
  //   console.log('got telemetry', data.timestamp);
  //   win.webContents.send('telemetry', data);
  // });
}

app.on('ready', start)