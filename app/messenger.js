const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
    receive: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    replay: (carNumber, sessionNum, sessionTime) => {
      ipcRenderer.send('replay', { carNumber, sessionNum, sessionTime })
    },
    focusCamera: (data) => {
      ipcRenderer.send('focus-camera', data);
    },
    jumpToTime: (data) => {
      ipcRenderer.send('jump-to-time', data);
    }
  }
);
