import { IncidentData } from '@common/index';
import _ from 'lodash';
import { SessionData, TelemetryData } from 'node-irsdk-2021';

type Outbox = { send<T>(channel: string, data: T): void }

type Observer = (prev: AppState, current: AppState, outbox: Outbox) => void

type Config = {
  minPitStopTime: number
  observers: Observer[]
}

type CarState = {
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

type AppState = {
  sessionNum: number
  sessionTime: number
  cars: CarState[]
  findCar(num: string): CarState | undefined
}

export default function watch(outbox: Outbox, config: Config) {
  let prevState: AppState = {
    sessionNum: 0,
    sessionTime: 0,
    cars: [],
    findCar: (_) => undefined
  }

  function setState(newState: AppState, notify: 'notify' | undefined = undefined) {
    if(notify)
      config.observers.forEach(obs => obs(prevState, newState, outbox));

    prevState = { ...newState, findCar: lookup(newState.cars) };
  }

  function onTelemetryUpdate({ values }: TelemetryData) {
    const sessionNum = values.SessionNum,
      sessionTime = values.SessionTime;

    // use last tick's driver info
    // we can wait to observe any new drivers until after sessionInfo updates
    const cars = prevState.cars.map(d => {      
      const prevCar = prevState.findCar(d.number)! // never undefined here

      return {
        ...prevCar,
        currentLap: values.CarIdxLap[prevCar.index] || -1,
        currentLapPct: values.CarIdxLapDistPct[prevCar.index] || -1,
        onPitRoad: values.CarIdxOnPitRoad[prevCar.index] || false,
        trackSurface: values.CarIdxTrackSurface[prevCar.index] || 'NotInWorld',
      }
    })

    setState({ ...prevState, cars, sessionNum, sessionTime }, 'notify');
  }

  function onSessionUpdate(update: SessionData) {
    const cars = update.data.DriverInfo.Drivers.map(dInfo => {
      const prevCar = prevState.findCar(dInfo.CarNumber);

      return {
        ...prevCar || { currentLap: -1, currentLapPct: -1, onPitRoad: false, trackSurface: 'NotInWorld' },
        index: dInfo.CarIdx,
        number: dInfo.CarNumber,
        teamName: dInfo.TeamName,
        driverName: dInfo.UserName,
        incidentCount: dInfo.TeamIncidentCount
      }
    })

    setState({ ...prevState, cars })
  }

  return [onTelemetryUpdate, onSessionUpdate];
}

function lookup(list: CarState[]): (key: string) => CarState | undefined {
  const table = _.groupBy(list, 'number');
  return (key: string) => (table[key] || [])[0]
}

export function notifyOfIncident(prevState: AppState, newState: AppState, outbox: Outbox) {
  const { sessionNum, sessionTime, cars } = newState;

  // list of [prev, current] by car number
  const carStates = cars.map(car => [prevState.findCar(car.number), car])

  carStates
    .filter(([prev, current]) => prev && current!.incidentCount > prev.incidentCount)
    .forEach(([_prev, current]) => {
      const { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct } = current!;
      const car = { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct };
      outbox.send<IncidentData>('incident', { car, sessionNum, sessionTime, type: 'incident_counter' })
    })
}

export function notifyOfSessionChanged(prevState: AppState, newState: AppState, outbox: Outbox) {
  if(prevState.sessionNum < newState.sessionNum) {
    // TODO: we can look up the session types here so the UI can be smorter about practice, etc
    outbox.send('session-changed', { 
      previous: prevState.sessionNum, 
      current: newState.sessionNum 
    })
  }
}