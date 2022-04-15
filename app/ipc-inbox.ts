import { ipcMain } from 'electron';
import iracing, { SDKInstance } from 'node-irsdk-2021';
import { focusIRacingWindow, typeMessage, sleep } from "./irobot";



type CarNumberParam = { carNumber: string };
type JumpToTimeParam = { sessionNum: number, sessionTime: number };
type ReplayParam = CarNumberParam & JumpToTimeParam;

ipcMain.on('replay', (ev, data: ReplayParam) => {
  const sdk = iracing.getInstance();
  sdk.playbackControls.searchTs(data.sessionNum, data.sessionTime);
  sdk.camControls.switchToCar(data.carNumber)
});

ipcMain.on('focus-camera', (ev, data: CarNumberParam) => {
  const sdk = iracing.getInstance();
  sdk.camControls.switchToCar(data.carNumber);
});

ipcMain.on('jump-to-time', (ev, data: JumpToTimeParam) => {
  const sdk = iracing.getInstance();
  sdk.playbackControls.searchTs(data.sessionNum, data.sessionTime);
});

ipcMain.on('replay-pause', (ev, data: any) => {
  console.log("INBOX: replay-pause");
  const sdk = iracing.getInstance();
  sdk.playbackControls.pause();
});

ipcMain.on('replay-play', (ev, data: any) => {
  console.log("INBOX: replay-play");
  const sdk = iracing.getInstance();
  sdk.playbackControls.play();
});

ipcMain.on('replay-live', (ev, data: any) => {
  console.log("INBOX: replay-live");
  const sdk = iracing.getInstance();
  sdk.playbackControls.search("ToEnd");
});

ipcMain.handle('send-chat-message', async (ev, data: string[]) => {
  // focus iracing window
  const sdk = iracing.getInstance();

  await focusIRacingWindow();
  await sleep(100);

  // send messages one by one
  for (const msg of data) {
    sdk.execChatCmd(1);
    await typeMessage(msg, true);
    console.log("CHAT:", msg);
    await sleep(1);
  }
  
  // re-focus stuart
  ev.sender.focus();
});