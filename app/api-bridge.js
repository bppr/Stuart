const { contextBridge, ipcRenderer } = require('electron');

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
  focusCamera: (carNumber) => {
    ipcRenderer.send('focus-camera', { carNumber });
  },
  jumpToTime: (sessionNum, sessionTime) => {
    ipcRenderer.send('jump-to-time', { sessionNum, sessionTime });
  },
  acknowledgeIncident: (incidentId) => {
    ipcRenderer.send('acknowledge-incident', { incidentId });
  },
  dismissIncident: (incidentId) => {
    ipcRenderer.send('dismiss-incident', { incidentId });
  },
  unresolveIncident: (incidentId) => {
    ipcRenderer.send('unresolve-incident', { incidentId });
  },
  connect: () => {
    ipcRenderer.send('connect-window', {});
  },
  clearIncidents: () => {
    ipcRenderer.send('clear-incidents', {});
  },
  pauseReplay: () => {
    ipcRenderer.send('replay-pause', {});
  },
  playReplay: () => {
    ipcRenderer.send('replay-play', {});
  },
  liveReplay: () => {
    ipcRenderer.send('replay-live', {});
  }



}
);
