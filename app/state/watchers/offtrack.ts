import { IncidentData } from "../../../common/incident";
import { AppState, CarState, findCarByIdx } from "../../state";
import { StatefulWatcher } from "../streams";

type ReplayTime = {
    sessionNum: number,
    sessionTime: number,
}

type CarTime = {
    // the very first start time that the car was in the target state
    firstStartTime: ReplayTime,
    // the timestamp that the car most recently entered the target state
    startTime: number,
    // the timestamp that the car most recently left the target state
    stopTime?: number,
}

// sparse array?
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
    // short for "cars by index"
    let cbIDX = carTimesByIdx ? [...carTimesByIdx] : [];

    // only look at "newState" for now
    for(let car of newState.cars) {

        let carTimer: CarTime | undefined = cbIDX[car.index];
        const carInState = inTargetState(car);

        if(carInState) {
            // if no timer has been started, car must have just entered the target state
            if(!carTimer) {
                // start the timer
                carTimer = {
                    startTime: now,
                    firstStartTime: {
                        sessionNum: newState.sessionNum,
                        sessionTime: newState.sessionTime,
                    },
                }
                //console.log(`car ${car.number} is off track, starting timer`);
            // if a timer has been started, then the timer is either running, or is in cooldown mode
            } else {
                // if the timer is running and the car is in the state, don't do anything

                // timer was previously stopped (i.e., is currently in cooldown indicated by the presence of a stopTime)
                if(carTimer.stopTime !== undefined) {
                    // restart the timer
                    carTimer.startTime = now;
                    carTimer.stopTime = undefined;
                    //console.log(`car ${car.number} is off track again, restarting timer`);
                }
            }
        } else {
            // if the car is not currently in the state and we have a timer running
            if(carTimer) {
                // if the car just exited the target state, there will be no stop time recorded yet, so stop the timer
                if(!carTimer.stopTime) {
                    // car just now exited the state
                    let duration = now - carTimer.startTime;

                    if(duration < minimumOffTrackTime) {
                        // ignore this blip and delete the timer
                        carTimer = undefined;
                        //console.log(`car ${car.number} was off track for ${duration} seconds, ignoring...`);
                    } else {
                        // save the stop time
                        carTimer = {...carTimer, stopTime: now};
                        //console.log(`car ${car.number} was off track for ${duration} seconds, entering cooldown...`);
                    }
                } else {
                    // if the timer exists and the stop time exists, then we are in the "cool down" phase

                    let durationInCooldownTime = carTimer.stopTime;
                    if(durationInCooldownTime > cooldownTime) {
                        // emit an event and delete the timer
                        incidents.push({
                            car,
                            sessionNum: carTimer.firstStartTime.sessionNum,
                            sessionTime: carTimer.firstStartTime.sessionTime,
                            type: "Off-Track",
                        });
                        carTimer = undefined;
                        //console.log(`car ${car.number} was off track, reporting an incident.`);
                    }
                }
            }
        }

        if(carTimer === undefined) {
            delete cbIDX[car.index];
        } else {
            cbIDX[car.index] = carTimer;
        }
    }

    return [incidents, cbIDX];
}

export default offTrackTimer;