import { Watcher } from "../streams";
import { AppState, CarState } from "../../appState";
import { IncidentData } from "../../../common/incident";

/**
 * incidentCount creates an "Incident Count" incident whenever a drivers incident count increases.
 */
const incidentCount: Watcher<AppState, IncidentData> = (oldState, newState) => {
    // list of [prev, current] by car number

    let oldCarsByIdx: CarState[] = [];
    oldState.cars.forEach(car => {
        oldCarsByIdx[car.idx] = car;
    })

    const carStates = newState.cars.map(car => [oldCarsByIdx[car.idx], car]);

    return carStates
        .filter(([prev, current]) => prev && current!.teamIncidentCount > prev.teamIncidentCount)
        .map(([prev, current]) => {
            const inc: IncidentData = {
                sessionNum: newState.live.session,
                sessionTime: newState.live.time,
                car: {
                    currentLap: current.lap,
                    currentLapPct: current.trackPositionPct,
                    incidentCount: current.teamIncidentCount,
                    index: current.idx,
                    number: current.number,
                    teamName: current.teamName,
                },
                type: "Incident Count"
            }

            return inc;
        });
}

export default incidentCount;