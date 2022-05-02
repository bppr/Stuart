import { CameraState } from "../../../common/CameraState";
import { AppState, toDriverCar } from "../../appState";

export default function camera(state: AppState) : CameraState {
    return {
        current: {
            carIdx: state.replay.carIdx,
            cameraGroupNum: state.replay.cameraGroupNum,
            cameraNum: state.replay.cameraNum,
            speed: state.replay.speed,
        },
        cars: state.cars.map(toDriverCar),
        cameraGroups: state.cameraInfo.cameraGroups,
        sessions: state.sessions.map(sess => ({
            name: sess.name,
            num: sess.num,
            lapLimit: -1,
            timeLimt: -1,
            type: sess.type,
        }))
    }
}
