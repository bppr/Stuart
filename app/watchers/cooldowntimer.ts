import { Observer, AppState, CarState } from '../state';

type CarTime = {
    /**
     * the total amount of time the car has spent in the target state during a single timing period
     */
    cumulative: number
    /**
     * the maximum amount of continuous time the car has spent in the target state
     */
    maximum: number

    /**
     * the timestamp that the car first entered the target state
     */
    created: number

    /** 
     * the timestamp (in seconds) that the car most recently entered the target state 
     */
    started: number

    /**
     * the timestamp (in seconds) that the car most recently exited the target state
     */
    ended: number | undefined
}

/**
 * CooldownTimer is a timing watcher that records how long a car is in a desired state.
 * 
 * In comparison to CarTimer, CooldownTimer waits until the car has *not* been in the target state for a "cooldown" time before executing any callbacks. This can help ward off any spurious state changes.
 */
export abstract class CooldownTimer implements Observer {
    private timesByCarIdx: Map<number, CarTime> = new Map();
    private statesByCarIdx: Map<number, boolean> = new Map();

    constructor(private cooldownTime = 0) { }

    onUpdate(prevApp: AppState, newApp: AppState): void {
        newApp.cars.forEach((car) => {

            let oldState = this.statesByCarIdx.get(car.index) || false;
            let newState = this.isCarInTargetState(car);

            let carTime = this.timesByCarIdx.get(car.index);

            if (!oldState && newState) {
                // car entered target state

                // start or restart timer in cooldown
                if (carTime == undefined) {
                    // start it
                    carTime = {
                        cumulative: 0,
                        maximum: 0,
                        created: newApp.sessionTime,
                        started: newApp.sessionTime,
                        ended: undefined
                    };
                    console.log("CT3: start");
                } else {
                    // restart it
                    carTime.started = newApp.sessionTime;
                    console.log("CT3: re-start");
                }
                this.timesByCarIdx.set(car.index, carTime);
            }

            if (oldState && !newState) {
                // car exited target state
                carTime = carTime!;

                // stop the timer and tally up its times
                let duration = newApp.sessionTime - carTime.started;
                carTime!.maximum = Math.max(carTime.maximum, duration);
                carTime!.cumulative += duration;
                carTime!.ended = newApp.sessionTime;

                this.timesByCarIdx.set(car.index, carTime);
                console.log("CT3: stop");
            }

            // check to see if cooldown is up
            if (!newState && carTime) {
                if (newApp.sessionTime >= (carTime.ended! + this.cooldownTime)) {
                    this.onTimingFinished(car, newApp,
                        carTime.created,
                        carTime.maximum,
                        carTime.cumulative);
                    this.timesByCarIdx.delete(car.index);
                    console.log("CT3: done");
                }
            }

            this.statesByCarIdx.set(car.index, newState);
        });
    }

    protected abstract isCarInTargetState(car: CarState): boolean;

    protected onTimingFinished(car: CarState, app: AppState, startedAt: number, maximumTime: number, cumulativeTime: number) { }


}