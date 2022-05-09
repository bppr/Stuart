const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", 
  {
    // returns a function that can be used to "unsubscribe" from this event
    receive: (channel, func) => {

      function listener(event, ...args) {
        func(...args);
      }

      ipcRenderer.on(channel, listener);

      return () => { ipcRenderer.removeListener(listener);}
    },
    replay: (carNumber, sessionNum, sessionTime) => {
      ipcRenderer.send('replay', { carNumber, sessionNum, sessionTime })
    },
    focusCamera: (carNumber, cameraGroup) => {
      ipcRenderer.send('focus-camera', { carNumber, cameraGroup });
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
    },
    replaySpeed: (speed) => {
      ipcRenderer.send('replay-speed', speed);
    },
    replaySearch: (searchMode) => {
      ipcRenderer.send('replay-search', searchMode);
    }
  }
);
