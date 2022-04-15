import { Watcher } from "../streams";
import { AppState } from "../../appState";
import { IncidentData } from "../../../common/incident";

/**
 * creates an "incident" whenever a driver completes a lap. Useful for testing.
 */
const lapCount: Watcher<AppState, IncidentData> = (oldState, newState) => {
    // list of [prev, current] by car number
    const carStates = newState.cars.map(car => [oldState.findCarByIdx(car.idx), car]);

    return carStates
        .filter(([prev, current]) => prev && current!.lap > prev.lap)
        .map(([prev, current]) => {
            const inc: IncidentData = {
                sessionNum: newState.live.session,
                sessionTime: newState.live.time,
                car: {
                    currentLap: current!.lap,
                    currentLapPct: current!.trackPositionPct,
                    incidentCount: current!.teamIncidentCount,
                    index: current!.idx,
                    number: current!.number,
                    teamName: current!.teamName,
                },
                type: "Other",
                description: "Lap " + current!.lap,
            }

            return inc;
        });
}

export default lapCount;