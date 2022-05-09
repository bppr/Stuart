export type SearchMode = "ToStart" | "ToEnd" | "PrevSession" | "NextSession" | "PrevLap" | "NextLap" | "PrevFrame" | "NextFrame" | "PrevIncident" | "NextIncident";

interface APIBridge {
  receive(msgName: string, handler: (any) => void);
  replay(carNumber: string, sessionNum: number, sessionTime: number);
  focusCamera(carNumber: string, cameraGroup?: number);
  jumpToTime(sessionNum: number, sessionTime: number);
  acknowledgeIncident(incidentId: number);
  dismissIncident(incidentId: number);
  unresolveIncident(incidentId: number);
  clearIncidents();
  connect();
  pauseReplay();
  playReplay();
  liveReplay();
  replaySearch(mode: SearchMode);
  replaySpeed(speed: number);
  sendChatMessages(messages: string[]) : Promise<void>;
}

interface WindowWithSDK extends Window {
  api: APIBridge
}