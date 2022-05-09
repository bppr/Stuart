import { Watcher } from "../streams";
import { AppState, CarState } from "../../appState";
import { Incident } from "../../../common/incident";

/**
 * incidentCount creates an "Incident Count" incident whenever a drivers incident count increases.
 */
const incidentCount: Watcher<AppState, Incident> = (oldState, newState) => {
    // list of [prev, current] by car number

    let oldCarsByIdx: CarState[] = [];
    oldState.cars.forEach(car => {
        oldCarsByIdx[car.idx] = car;
    })

    const carStates = newState.cars.map(car => [oldCarsByIdx[car.idx], car]);

    return carStates
        .filter(([prev, current]) => prev && (current.teamIncidentCount > prev.teamIncidentCount) && (current.teamIncidentCount > 0))
        .map(([prev, current]) => {
            const inc: Incident = {
                car: {
                    class: {
                        color: current.classColor,
                        name: current.className,
                    },
                    color: current.carColors,
                    driverName: current.drivers[0].name,
                    idx: current.idx,
                    number: current.number,
                    teamName: current.teamName,
                },
                lap: current.lap,
                time: {
                    num: newState.live.session,
                    time: newState.live.time,
                },
                trackPositionPct: current.trackPositionPct,

                type: "Incident Count",
                description: current.teamIncidentCount + "x",
            }

            return inc;
        });
}

export default incidentCount;