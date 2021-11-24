// override / extend default window object

import { IncidentData } from "@common/index";

// see ui/types/api.d.ts
declare var window: WindowWithSDK

const sdk = window.api;
export default sdk;

function toMS(seconds: number): number {
  return (seconds * 1000) | 0
}

export function replay({ car, sessionNum, sessionTime }: IncidentData) {

  // we should rewind a bit
  let stRewind = Math.max(sessionTime - 2.0, 0);

  console.log('requesting replay of car', car, 'at', toMS(stRewind));
  window.api.replay(car.number, sessionNum, toMS(stRewind));
}