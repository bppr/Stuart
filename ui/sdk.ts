import { IncidentData } from "../common/incident";

// see ui/types/api.d.ts
declare var window: WindowWithSDK

const sdk = window.api;
export default sdk;

function toMS(seconds: number): number {
  return (seconds * 1000) | 0
}

export function replay({ car, sessionNum, sessionTime }: IncidentData) {
  const ms = toMS(Math.max(sessionTime - 2.0, 0));
  window.api.replay(car.number, sessionNum, ms);
}

export function pauseReplay() {
  window.api.pauseReplay();
}

export function playReplay() {
  window.api.playReplay();
}

export function liveReplay() {
  window.api.liveReplay();
}

export function sendChatMessage(msg: string) {
  window.api.sendChatMessage(msg);
}