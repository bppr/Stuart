import _ from 'lodash';

/**
 * AppState is a more convenient view of the iRacing game state
 * that combines information from the Session data feed and the
 * Telemetry data feed.
 * 
 * To make use of a property from iRacing, first add an appropriate
 * definition for it to irsdk.d.ts and here. Then update "toAppState"
 * in app/state/streams.ts to copy the values from the game state.
 */

export type Session = { type: SessionType }

export type Driver = {
  carIndex: number
  name: string
  userId: number
  teamId: number
  teamName: string
  incidentCount: number
  teamIncidentCount: number
  isAi: boolean
  isPaceCar: boolean
}

export type CarState = {
  index: number
  number: string
  teamName: string
  driverName: string
  incidentCount: number
  currentLap: number
  currentLapPct: number
  onPitRoad: boolean
  trackSurface: string
  paceRow: number
  paceLine: number
  position: number
  classPosition: number
}

export enum SessionType {
  Race = 'Race',
  Qualifying = 'Qualifying',
  Practice = 'Practice',
  Unknown = 'Unknown'
}

export type SessionFlag = 
"OneLapToGreen" | 
"StartReady" | 
"StartGo" | 
"StartHidden" |
"Caution" | 
"CautionWaving";

export type AppState = {
  sessionNum: number
  sessionTime: number         // seconds
  sessionFlags: SessionFlag[]
  replaySessionNum: number
  replaySessionTime: number
  camCarIdx: number
  camPaused: boolean
  sessions: Session[]
  trackLength: number         // meters
  trackLengthDisplay: string  // '0.9 mi' or '1.7 km'
  cars: CarState[]
  findCar: (_: string) => CarState | undefined,
  sessionType: SessionType,
}

export function findCarByIdx(state: AppState, index:number): CarState | undefined {
  return state.cars.find((car) => car.index === index);
}

