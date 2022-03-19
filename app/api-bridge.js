const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", 
  {
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
    pauseReplay: () => {
      ipcRenderer.send('replay-pause', {});
    },
    playReplay: () => {
      ipcRenderer.send('replay-play', {});
    },
    liveReplay: () => {
      ipcRenderer.send('replay-live', {});
    },
    sendChatMessages: (msgs) => {
      return ipcRenderer.invoke('send-chat-message', msgs);
    }
  }
);
