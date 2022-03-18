interface APIBridge {
  receive(msgName: string, handler: (any) => void);
  replay(carNumber: string, sessionNum: number, sessionTime: number);
  focusCamera(carNumber: string);
  jumpToTime(sessionNum: number, sessionTime: number);
  acknowledgeIncident(incidentId: number);
  dismissIncident(incidentId: number);
  unresolveIncident(incidentId: number);
  clearIncidents();
  connect();
  pauseReplay();
  playReplay();
  liveReplay();
  sendChatMessage(msg: string);
}

interface WindowWithSDK extends Window {
  api: APIBridge
}