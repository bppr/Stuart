import { IncidentDb } from '../incidentdb';
import { Observer, AppState } from '../state';

/**
 * IRacingIncidentCount publishes an Incident whenever a drivers incident count increases.
 */
export class IRacingIncidentCount implements Observer {
  constructor(private incidentDb: IncidentDb) { }

  onUpdate(prevState: AppState, newState: AppState) {
    const { sessionNum, sessionTime, cars } = newState;

    // list of [prev, current] by car number
    const carStates = cars.map(car => [prevState.findCar(car.number), car]);

    carStates
      .filter(([prev, current]) => prev && current!.incidentCount > prev.incidentCount)
      .forEach(([_prev, current]) => {
        const { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct } = current!;
        const car = { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct };

        this.incidentDb.publish({ car, sessionNum, sessionTime, type: "Incident Count" });
      });
  }
}
