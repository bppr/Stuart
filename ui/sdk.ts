// override / extend default window object

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

export function acknowledgeIncident(id: number) {
  window.api.acknowledgeIncident(id);
}

export function dismissIncident(id: number) {
  window.api.dismissIncident(id);
}

export function unresolveIncident(id: number) {
  window.api.unresolveIncident(id);
}

export function clearIncidents() {
  window.api.clearIncidents();
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