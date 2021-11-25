import { IncidentData } from '@common/index';
import { Observer, Outbox, AppState } from '../state';

export class NotifyOfIncident implements Observer {
  constructor(private outbox: Outbox) { }

  onUpdate(prevState: AppState, newState: AppState) {
    const { sessionNum, sessionTime, cars } = newState;

    // list of [prev, current] by car number
    const carStates = cars.map(car => [prevState.findCar(car.number), car]);

    carStates
      .filter(([prev, current]) => prev && current!.incidentCount > prev.incidentCount)
      .forEach(([_prev, current]) => {
        const { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct } = current!;
        const car = { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct };
        this.outbox.send<IncidentData>('incident', { car, sessionNum, sessionTime, type: 'incident_counter' });
      });
  }
}
