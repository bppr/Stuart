import { CarState, AppState, } from '../state';
import { CarTimer } from './cartimer';
import { IncidentDb } from '@app/incidentdb';
import { insideTrackRange } from "@app/util";

/**
 * OffTrackTimer is a {@link CarTimer} that publishes an incident if the car has been off track for more than a short period of time.
 *
 * The {@linkplain setTimeLimit | time limit} of this timer determines the length of time the car must be off track before it's considered an incident.
 *
 * Additionally, dangerous rejoins can be reported by setting {@link reportDangerousRejoins}.
 */
export class OffTrackTimer extends CarTimer {

	public reportOffTracks: boolean = true;
	public reportUnsafeRejoins: boolean = true;
	public reportTrackLimits = true;

	/**
	 * The distance (in meters) to search forward and backward for other cars
	 * when a car rejoins the track to flag it as a possibly dangerous rejoin.
	 * 
	 * Must not be negative
	 */
	private dangerousRejoinDistance: number;

	constructor(private incidentDb: IncidentDb, dangerousRejoinDistance?: number, timeLimit?: number) {
		super(timeLimit);
		this.dangerousRejoinDistance = dangerousRejoinDistance || 10;
	}

	isCarInTargetState(car: CarState): boolean {
		return car.trackSurface == "OffTrack";
	}

	onStateTimeExceeded(car: CarState, time: number, app: AppState): void {
		//console.log("OT: " + car.driverName + " has gone off track.");	
		const { sessionNum, sessionTime } = app;
		if (this.reportOffTracks) {
			// Report the incident from when they actually went off track, not when we declared it an off track
			let otTime = Math.max(0, sessionTime - this.getTimeLimit());

			this.incidentDb.publish({ car, sessionNum, sessionTime: otTime, type: 'Off-Track' });
		}
	}

	onStateExited(car: CarState, time: number, timeExceeded: boolean, app: AppState): void {

		//console.log("DOT: " + timeExceeded);
		// if car was reset or disappeared, no worries
		if (car.trackSurface != "OnTrack") return;

		const { sessionNum, sessionTime } = app;

		// no need to check for rejoins if it was a small off-track
		if (!timeExceeded && this.reportTrackLimits) {
			let otTime = Math.max(0, sessionTime - this.getTimeLimit());
			this.incidentDb.publish({
				car,
				sessionNum,
				sessionTime: otTime,
				type: 'Track Limits'
			});
		};

		// search forward for other cars
		let searchDistancePct = this.dangerousRejoinDistance / app.trackLength;
		let carIdx = car.index;

		let carsNearby = app.cars.filter((c) => {
			return c.index != carIdx &&
				insideTrackRange(c.currentLapPct,
					car.currentLapPct - searchDistancePct,
					car.currentLapPct + searchDistancePct);
		}, this);

		if (carsNearby.length > 0 && this.reportUnsafeRejoins) {
			let carNames = carsNearby.map((car) => car.driverName);
			let carList = carNames.join(", ");

			//console.log("OT: " + car.driverName + " rejoined the track within " + 
			//    this.dangerousRejoinDistance + " meters of " + carList + ".");

			this.incidentDb.publish({ car, sessionNum, sessionTime, type: 'Unsafe Rejoin' });
		}
	}



}