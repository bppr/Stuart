
import { AppState } from "../../appState";
import { View} from "../streams";
import { ClockState } from "../../../common/ClockState";

/**
 * Clock is a view of the AppState that is concerned with the current timing information for the live session and the 
 */
const clock: View<AppState, ClockState> = (state) => {
    const cCar = state.findCarByIdx(state.camera.carIdx);

    return {
        live: {
            num: state.live.session,
            time: state.live.time,
        },
        replay: {
            num: state.camera.time.session,
            time: state.camera.time.time,
        },
        camSpeed: state.camera.speed,
        camCar: {
            index: cCar?.idx || -1,
            number: cCar?.number || "---",
            driverName: cCar?.teamName || "Unknown",
        },
    }
}

export default clock;