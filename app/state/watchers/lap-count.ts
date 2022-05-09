import { Watcher } from "../streams";
import { AppState, toDriverCar } from "../../appState";
import { Incident } from "../../../common/incident";

/**
 * creates an "incident" whenever a driver completes a lap. Useful for testing.
 */
const lapCount: Watcher<AppState, Incident> = (oldState, newState) => {
    // list of [prev, current] by car number
    const carStates = newState.cars.map(car => [oldState.findCarByIdx(car.idx), car]);

    return carStates
        .filter(([prev, current]) => prev && current!.lap > prev.lap)
        .map(([prev, current]) => {
            const inc: Incident = {
                car: toDriverCar(current!),
                lap: current!.lap,
                time: {
                    num: newState.live.session,
                    time: newState.live.time,
                },
                trackPositionPct: current!.trackPositionPct,
                type: "Other",
                description: "Lap " + current!.lap,
            }

            return inc;
        });
}

export default lapCount;