import { Observer, AppState } from '../state';
import { ReplayTime } from '../../common/index';
import { ReplayOutbox } from '@app/replay_outbox';


/**
 * Clock is a watcher that keeps track of the current race time and 
 * camera state and reports them to the UI.
 */
export class Clock implements Observer {

    private lastReportTime = 0;

    constructor(private outbox: ReplayOutbox, private reportIntervalMs = 125) {
        if (this.reportIntervalMs < 0) {
            this.reportIntervalMs = 0;
        }
    }
    onUpdate(prevState: AppState, newState: AppState): void {

        let now = (new Date()).getTime();
        let interval = now - this.lastReportTime;
        if (interval >= this.reportIntervalMs) {
            this.lastReportTime = now;

            let cameraCar = newState.cars[newState.camCarIdx];

            this.outbox.sendTransient<ReplayTime>("clock-update", {
                liveSessionNum: newState.sessionNum,
                liveSessionTime: newState.sessionTime,
                camSessionNum: newState.replaySessionNum,
                camSessionTime: newState.replaySessionTime,
                camCarNumber: cameraCar?.number,
                camDriverName: cameraCar?.driverName,
                camPaused: newState.camPaused
            });

        }

    }

}