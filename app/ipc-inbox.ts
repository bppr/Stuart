import { ipcMain } from 'electron';
import iracing from 'node-irsdk-2021';
import { Resolution } from "../common/incident";

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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMessages(messages: string[]) {
  // simulate sending them for now
  for(const msg of messages) {
    console.log("CHAT:", msg);
    await sleep(100);
  }
}

ipcMain.handle('send-chat-message', async (ev, data: string[]) => {

//  console.log(data);
  await sendMessages(data);
});