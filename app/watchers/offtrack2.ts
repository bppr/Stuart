import { AppState, CarState } from "../state";
import { CooldownTimer } from "./cooldowntimer";
import { IncidentDb } from "../incidentdb"

/**
 * Detects when a car has gone off track, with a cooldown.
 * 
 * Reports two kinds of incidents: Track limits and Off-tracks
 */
export class OffTrackTimer2 extends CooldownTimer {

    public reportTrackLimits = true;
    public reportOffTracks = true;

    /**
     * 
     * @param trackLimitsTime the minimum amount of time a car must spend off the racing surface to have "exceeded track limits"
     * @param offTrackTime the minimum amount of time a car must spend off the racing to be considered "off track". Must be longer than the track limits time
     * @param cooldownTime the amount of time to wait for a car to finish its off track adventures before reporting an incident
     */
    constructor(private incidentDb: IncidentDb, private trackLimitsTime = 0, private offTrackTime = 2, cooldownTime = 10) {
        super(cooldownTime);
        if (this.trackLimitsTime >= this.offTrackTime) throw "Track Limits time must be less than OffTrack time";
    }

    protected isCarInTargetState(car: CarState): boolean {
        return car.trackSurface == "OffTrack";
    }

    protected onTimingFinished(car: CarState, app: AppState, startedAt: number, maximumTime: number, cumulativeTime: number) {
        // look at the minimum time to see how severe the off track was
        if (maximumTime <= this.trackLimitsTime) {
            // do nothing
        } else if (maximumTime <= this.offTrackTime) {
            // report a track limits violation
            if (this.reportTrackLimits) {
                this.incidentDb.publish({
                    car: car,
                    sessionNum: app.sessionNum,
                    sessionTime: startedAt,
                    type: "Track Limits"
                });
            }
        } else {
            if (this.reportOffTracks) {
                this.incidentDb.publish({
                    car: car,
                    sessionNum: app.sessionNum,
                    sessionTime: startedAt,
                    type: "Off-Track"
                });
            }
        }
    }

}