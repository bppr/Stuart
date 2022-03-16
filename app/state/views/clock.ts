
import { AppState, findCarByIdx } from "../../state";
import { View} from "../streams";
import { ClockState } from "../../../common/ClockState";

/**
 * Clock is a view of the AppState that is concerned with the current timing information for the live session and the 
 */
const clock: View<AppState, ClockState> = (state) => {
    const cCar = findCarByIdx(state, state.camCarIdx);

    return {
        live: {
            num: state.sessionNum,
            time: state.sessionTime,
        },
        replay: {
            num: state.replaySessionNum,
            time: state.replaySessionTime,
        },
        camSpeed: state.camPaused ? 0 : 1, // TODO fix this in AppState
        camCar: {
            index: cCar?.index || -1,
            number: cCar?.number || "---",
            driverName: cCar?.driverName || "Unknown",
        },
    }
}

export default clock;