import { ipcMain } from 'electron';
import iracing from 'node-irsdk-2021';

type CarNumberParam = { carNumber: string };
type JumpToTimeParam = { sessionNum: number, sessionTime: number};
type ReplayParam = CarNumberParam & JumpToTimeParam;
type IncidentResolution = 'Acknowledged' | 'Dismissed' | 'Penalized';
type IncidentResolvedParam = {
   incidentId: number,
   resolution: IncidentResolution
};

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

ipcMain.on('incident-resolved', (ev, data: IncidentResolvedParam) => {

  //

});