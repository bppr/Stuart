import { BrowserWindow, ipcMain } from 'electron';
import iracing, { SDKInstance } from 'node-irsdk-2021';
import { focusIRacingWindow, typeMessage, sleep } from "./irobot";

type CarNumberParam = { carNumber: string };
type JumpToTimeParam = { sessionNum: number, sessionTime: number };
type ReplayParam = CarNumberParam & JumpToTimeParam;
type SwitchCameraParam = CarNumberParam & { cameraGroup: number};

ipcMain.on('replay', (ev, data: ReplayParam) => {
  const sdk = iracing.getInstance();
  sdk.playbackControls.searchTs(data.sessionNum, data.sessionTime);
  sdk.camControls.switchToCar(data.carNumber)
});

ipcMain.on('focus-camera', (ev, data: SwitchCameraParam) => {
  const sdk = iracing.getInstance();
  sdk.camControls.switchToCar(data.carNumber, data.cameraGroup);
});

ipcMain.on('jump-to-time', (ev, data: JumpToTimeParam) => {
  const sdk = iracing.getInstance();
  sdk.playbackControls.searchTs(data.sessionNum, data.sessionTime);
});

ipcMain.on('replay-search', (ev, data: iracing.RpySrchMode) => {
  const sdk = iracing.getInstance();
  sdk.playbackControls.search(data)
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
  BrowserWindow.fromWebContents(ev.sender)?.focus();
});

ipcMain.on('replay-speed', (ev, speed: number) => {
  // no slow motion for now;
  speed = speed | 0;
  if(speed > 16) speed = 16;
  if(speed < -16) speed = -16;

  const sdk = iracing.getInstance();
  if(speed == 0) {
    sdk.playbackControls.pause();
  } else if (speed == 1) {
    sdk.playbackControls.play();
  } else if(speed > 1) {
    sdk.playbackControls.fastForward(speed);
  } else if(speed <= -1) {
    sdk.playbackControls.rewind(speed * -1);
  }
});
