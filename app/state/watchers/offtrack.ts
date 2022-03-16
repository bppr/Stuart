import { IncidentData } from "../../../common/incident";
import { AppState, CarState, findCarByIdx } from "../../state";
import { StatefulWatcher } from "../streams";

type CarTime = {
    // the very first start time that the car was in the target state
    firstStartTime: number,
    // the timestamp that the car most recently entered the target state
    startTime: number,
    // the timestamp that the car most recently left the target state
    stopTime?: number,
}

type CarTimesByIdx = CarTime[];

const offTrackTimer: StatefulWatcher<AppState, CarTimesByIdx, IncidentData> = (oldState, newState, carTimesByIdx) => {

    // genericize it here eventually
    const inTargetState = (car: CarState) => {
        return car.trackSurface == "OffTrack";
    }
    const minimumOffTrackTime = 2.0;
    const cooldownTime = 10.0;

    const now = newState.sessionTime;

    let incidents: IncidentData[] = [];
    let cbIDX = carTimesByIdx ? [...carTimesByIdx] : [];

    // only look at "newState" for now
    for(let car of newState.cars) {

        let carTimer = cbIDX[car.index];

        const carInState = inTargetState(car);

        if(carInState) {
            if(!carTimer) {
                // start the timer
                carTimer = {
                    startTime: now,
                    firstStartTime: now,
                }
            } else {
                // restart the timer
                carTimer.startTime = now;
            }
        } else {
            if(carTimer) {
                if(!carTimer.stopTime) {
                    // car just now exited the state
                    let duration = now - carTimer.startTime;

                    if(duration < minimumOffTrackTime) {
                        // ignore this blip and delete the timer
                        carTimer = undefined;
                    } else {
                        // save the stop time
                        carTimer = {...carTimer, stopTime: now};
                    }
                } else {
                    let durationInCooldownTime = carTimer.stopTime;
                    if(durationInCooldownTime > cooldownTime) {
                        // emit an event and delete the timer
                        carTimer = undefined;
                        incidents.push({
                            car,
                            sessionNum: newState.sessionNum,
                            sessionTime: newState.sessionTime,
                            type: "Off-Track",
                        });
                    }
                }
            }
        }

        cbIDX[car.index] = carTimer;
    }

    return [incidents, cbIDX];
}