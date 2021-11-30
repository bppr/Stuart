import _ from 'lodash';
import { SessionData, TelemetryData, SessionDriver } from 'node-irsdk-2021';

export type Outbox = { send<T>(channel: string, data: T): void }
export type Session = { type: SessionType }

export interface Observer {
  onUpdate(prevState: AppState, newState: AppState): void
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
}

export enum SessionType {
  Race = 'Race',
  Qualifying = 'Qualifying',
  Practice = 'Practice',
  Unknown = 'Unknown'
}

export type AppState = {
  sessionNum: number
  sessionTime: number         // seconds
  sessions: Session[]
  trackLength: number         // meters
  trackLengthDisplay: string  // '0.9 mi' or '1.7 km'
  cars: CarState[]
  findCar(num: string): CarState | undefined
  sessionType: SessionType
}

export default class Watcher {
  constructor(private config: { observers: Observer[]}) { }

  prevState: AppState = {
    sessionNum: 0,
    sessionTime: 0,
    sessions: [],
    trackLength: 1000,
    trackLengthDisplay: '1.0 km',
    cars: [],
    findCar: (_) => undefined,
    sessionType: SessionType.Unknown
  }

  setState(newState: AppState) {
    this.config.observers.forEach(obs => obs.onUpdate(this.prevState, newState));
    this.prevState = { ...newState, findCar: lookup(newState.cars) };
  }

  onTelemetryUpdate({ values }: TelemetryData) {
    const sessionNum = values.SessionNum,
      sessionTime = values.SessionTime;

    // use last tick's driver info
    // we can wait to observe any new drivers until after sessionInfo updates
    const cars = this.prevState.cars.map(d => {
      const prevCar = this.prevState.findCar(d.number)! // never undefined here

      return {
        ...prevCar,
        currentLap: values.CarIdxLap[prevCar.index] ?? -1,
        currentLapPct: values.CarIdxLapDistPct[prevCar.index] ?? -1,
        onPitRoad: values.CarIdxOnPitRoad[prevCar.index] ?? false,
        trackSurface: values.CarIdxTrackSurface[prevCar.index] ?? 'NotInWorld',
      }
    })

    this.setState({ ...this.prevState, cars, sessionNum, sessionTime });
  }

  onSessionUpdate(update: SessionData) {
    const { DriverInfo, SessionInfo, WeekendInfo } = update.data;

    const cars = DriverInfo.Drivers.map(dInfo => toCar(this.prevState, dInfo));
    const sessions = SessionInfo.Sessions.map(toSession);
    
    const trackLengthDisplay = WeekendInfo.TrackLength;
    const trackLength = this.prevState.trackLengthDisplay === trackLengthDisplay
      ? this.prevState.trackLength
      : getTrackLength(update);

    this.setState({ 
      ...this.prevState,
      trackLength,
      trackLengthDisplay,
      cars, 
      sessions,
      sessionType: sessions[this.prevState.sessionNum]?.type 
    })
  }
}

function lookup(list: CarState[]): (key: string) => CarState | undefined {
  const table = _.groupBy(list, 'number');
  return (key: string) => (table[key] ?? [])[0]
}

function getTrackLength(update: SessionData): number {
  const trackLengthStr = update.data.WeekendInfo.TrackLength;
  const trackLengthRegex = new RegExp("^(\\d+(\\.\\d+)?) (\\w+)$");
  const match = trackLengthRegex.exec(trackLengthStr);

  if (match) {
    const trackLength = +(match[1]);
    const distanceUnit = match[3];

    return trackLength * (distanceUnit == "km" ? 1000 : 1609.344)
  }

  return 0
}

function toSession(session: SessionData): Session {
  const type = {
    'Race': SessionType.Race,
    'Qualifying': SessionType.Qualifying,
    'Practice': SessionType.Practice
  }[session.SessionType] ?? SessionType.Unknown

  return { type }
}

const DEFAULT_CAR_FIELDS = { currentLap: -1, currentLapPct: -1, onPitRoad: false, trackSurface: 'NotInWorld' }

function toCar(state: AppState, dInfo: SessionDriver) {
  const prevCar = state.findCar(dInfo.CarNumber);

  return {
    ...prevCar ?? DEFAULT_CAR_FIELDS,
    index: dInfo.CarIdx,
    number: dInfo.CarNumber,
    teamName: dInfo.TeamName,
    driverName: dInfo.UserName,
    incidentCount: dInfo.TeamIncidentCount
  }
}