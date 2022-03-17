import { Watcher } from "../streams";
import { AppState, findCarByIdx } from "../../state";
import { IncidentData } from "../../../common/incident";

/**
 * creates an "incident" whenever a driver completes a lap. Useful for testing.
 */
const lapCount: Watcher<AppState, IncidentData> = (oldState, newState) => {
    // list of [prev, current] by car number
    const carStates = newState.cars.map(car => [findCarByIdx(oldState, car.index), car]);

    return carStates
        .filter(([prev, current]) => prev && current!.currentLap > prev.currentLap)
        .map(([prev, current]) => {
            const { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct } = current!;
            const car = { index, number, teamName, driverName, incidentCount, currentLap, currentLapPct };

            const inc: IncidentData = {
                sessionNum: newState.sessionNum,
                sessionTime: newState.sessionTime,
                car,
                type: "Other",
                description: "Lap " + car.currentLap,
            }

            return inc;
        });
}

export default lapCount;