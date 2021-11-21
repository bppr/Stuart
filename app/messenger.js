const { contextBridge, ipcRenderer, ipcMain } = require("electron");
const iracing = require('node-irsdk-2021');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
    receive: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    replay: (data) => {
      ipcRenderer.send('replay', data)
    },
    focusCamera: (data) => {
      ipcRenderer.send('focus-camera', data);
    },
    jumpToTime: (data) => {
      ipcRenderer.send('jump-to-time', data);
    }
  }
);


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