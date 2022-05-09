import { Incident } from "../common/incident";
import { SearchMode, WindowWithSDK} from "./types/api";

// see ui/types/api.d.ts
declare var window: WindowWithSDK

const sdk = window.api;
export default sdk;

// from irsdk.d.ts

function toMS(seconds: number): number {
  return (seconds * 1000) | 0
}

export function replay(incident: Incident) {
  const ms = toMS(Math.max(incident.time.time - 2.0, 0));
  window.api.replay(incident.car.number, incident.time.num, ms);
}

export function replaySearch(mode: SearchMode) {
  window.api.replaySearch(mode);
}

export function replaySpeed(speed: number) {
  window.api.replaySpeed(speed);
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

export function sendChatMessages(messages: string[]) : Promise<void> {
  return window.api.sendChatMessages(messages);
}