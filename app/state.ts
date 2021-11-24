import { IncidentData } from '@common/index';
import _ from 'lodash';
import { SessionData, TelemetryData } from 'node-irsdk-2021';

export type Outbox = { send<T>(channel: string, data: T): void }

export interface Observer {
  onUpdate(prevState: AppState, newState: AppState): void
}

export enum SessionType {
  Race,
  Qualifying,
  Practice,
  // This doesn't mean "null", as in, "there is no session", but rather "iRacing added a session type we're unaware of".
  Unknown
}

type Config = {
  minPitStopTime: number
  observers: Observer[]
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

export type Session = {
  type: SessionType;
}

export type AppState = {
  sessionNum: number
  sessionTime: number
  sessions: Session[]
  /**
   * Overall length of the track, in meters
   */
  trackLength: number
  cars: CarState[]
  findCar(num: string): CarState | undefined
  sessionType: SessionType | null
}

export default class Watcher {
  constructor(private outbox: Outbox, private config: Config) { }

  prevState: AppState = {
    sessionNum: 0,
    sessionTime: 0,
    sessions: [],
    trackLength: 1000,
    cars: [],
    findCar: (_) => undefined,
    sessionType: null
  }

  setState(newState: AppState, notify: 'notify' | undefined = undefined) {
    if (notify)
      this.config.observers.forEach(obs => obs.onUpdate(this.prevState, newState));

    this.prevState = { ...newState, 
      findCar: lookup(newState.cars),
      sessionType: newState.sessions[newState.sessionNum]?.type };
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
        currentLap: values.CarIdxLap[prevCar.index] || -1,
        currentLapPct: values.CarIdxLapDistPct[prevCar.index] || -1,
        onPitRoad: values.CarIdxOnPitRoad[prevCar.index] || false,
        trackSurface: values.CarIdxTrackSurface[prevCar.index] || 'NotInWorld',
      }
    })

    this.setState({ ...this.prevState, cars, sessionNum, sessionTime }, 'notify');
  }

  onSessionUpdate(update: SessionData) {
    const trackLengthStr = update.data.WeekendInfo.TrackLength;
    const trackLengthRegex = new RegExp("^(\\d+(\\.\\d+)?) (\\w+)$");
    const match = trackLengthRegex.exec(trackLengthStr);

    let trackLength = this.prevState.trackLength;
    if (match) {
      trackLength = +(match[1]);
      let distanceUnit = match[3];
      if (distanceUnit == "km") {
        trackLength *= 1000;
      } else if (distanceUnit = "mi") {
        trackLength *= 1609.344;
      } else {
        // furlongs?
      }
    }

    const cars = update.data.DriverInfo.Drivers.map(dInfo => {
      const prevCar = this.prevState.findCar(dInfo.CarNumber);

      return {
        ...prevCar || { currentLap: -1, currentLapPct: -1, onPitRoad: false, trackSurface: 'NotInWorld' },
        index: dInfo.CarIdx,
        number: dInfo.CarNumber,
        teamName: dInfo.TeamName,
        driverName: dInfo.UserName,
        incidentCount: dInfo.TeamIncidentCount
      }
    });

    const sessions = update.data.SessionInfo.Sessions.map((session) => {
      let st = SessionType.Unknown;
      switch(session.SessionType) {
        case "Race":
          st = SessionType.Race;
          break;
        case "Qualifying":
          st = SessionType.Qualifying;
          break;
        case "Practice":
          st = SessionType.Practice;
          break;
      }
      let s: Session = {type: st};
      return s;
    });

    this.setState({ ...this.prevState, trackLength, cars, sessions,
      sessionType: sessions[this.prevState.sessionNum]?.type })
  }
}

function lookup(list: CarState[]): (key: string) => CarState | undefined {
  const table = _.groupBy(list, 'number');
  return (key: string) => (table[key] || [])[0]
}

export class NotifyOfIncident implements Observer {
  constructor(private outbox: Outbox) { }

  onUpdate(prevState: AppState, newState: AppState) {
    const { sessionNum, sessionTime, cars } = newState;

    // list of [prev, current] by car number
    const carStates = cars.map(car => [prevState.findCar(car.number), car])

    carStates
      .filter(([prev, current]) => prev && current!.incidentCount > prev.incidentCount)
      .forEach(([_prev, current]) => {
        const { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct } = current!;
        const car = { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct };
        this.outbox.send<IncidentData>('incident', { car, sessionNum, sessionTime, type: 'incident_counter' })
      })
  }
}

export class NotifyOfSessionChanged implements Observer {
  constructor(private outbox: Outbox) { }

  onUpdate(prevState: AppState, newState: AppState) {
    if (prevState.sessionNum < newState.sessionNum) {
      // TODO: we can look up the session types here so the UI can be smorter about practice, etc
      this.outbox.send('session-changed', {
        previous: prevState.sessionNum,
        current: newState.sessionNum
      })
    }
  }
}