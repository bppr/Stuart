import { Watcher } from "../streams";
import { AppState, findCarByIdx } from "../../state";
import { IncidentData } from "../../../common/incident";

/**
 * incidentCount creates an "Incident Count" incident whenever a drivers incident count increases.
 */
const incidentCount: Watcher<AppState, IncidentData> = (oldState, newState) => {
    // list of [prev, current] by car number
    const carStates = newState.cars.map(car => [findCarByIdx(oldState, car.index), car]);

    return carStates
        .filter(([prev, current]) => prev && current!.incidentCount > prev.incidentCount)
        .map(([prev, current]) => {
            const { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct } = current!;
            const car = { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct };

            const inc: IncidentData = {
                sessionNum: newState.sessionNum,
                sessionTime: newState.sessionTime,
                car,
                type: "Incident Count"
            }

            return inc;
        });
}

export default incidentCount;