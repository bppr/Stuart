import { CarState, AppState, Observer, Outbox } from '@app/state';
import { CarTimer } from './cartimer';
import { IncidentData } from '@common/index';

/**
 * OffTrackTimer is a {@link CarTimer} that publishes an incident if the car has been off track for more than a short period of time.
 *
 * The {@linkplain setTimeLimit | time limit} of this timer determines the length of time the car must be off track before it's considered an incident.
 *
 * Additionally, dangerous rejoins can be reported by setting {@link reportDangerousRejoins}.
 */
export class OffTrackTimer extends CarTimer {
	
	/**
	 * The distance (in meters) to search forward and backward for other cars
	 * when a car rejoins the track to flag it as a possibly dangerous rejoin.
	 * 
	 * Must not be negative
	 */
	private dangerousRejoinDistance: number;
	
	constructor(outbox :Outbox, dangerousRejoinDistance?: number) {
		super();
		this.outbox = outbox;
		this.dangerousRejoinDistance = dangerousRejoinDistance || 25;
	}

	private outbox: Outbox;

	isCarInTargetState(car: CarState): boolean {
		return car.trackSurface == "OffTrack";
	}

	onStateTimeExceeded(car: CarState, time: number, app: AppState): void {
		console.log("OT: " + car.driverName + " has gone off track.");	
		const { sessionNum, sessionTime } = app;
		this.outbox.send<IncidentData>('incident', { car, sessionNum, sessionTime, type: 'off_track' })
	}
	
	onStateExited(car: CarState, time: number, timeExceeded: boolean, app: AppState): void {

		//console.log("DOT: " + timeExceeded);

		// no need to check if it was a small off-track
		if(!timeExceeded) return;

		// if car was reset or disappeared, no worries
		if(car.trackSurface != "OnTrack") return;

		// search forward for other cars
		let searchDistancePct = this.dangerousRejoinDistance / app.trackLength;
		let carIdx = car.index;

		let carsNearby = app.cars.filter((c) => {
			return c.index != carIdx &&
				this.insideTrackRange(c.currentLapPct, 
					car.currentLapPct - searchDistancePct, 
					car.currentLapPct + searchDistancePct);
		}, this);
		
		if(carsNearby.length > 0) {
			let carNames = carsNearby.map((car) => car.driverName);
			let carList = carNames.join(", ");

			console.log("OT: " + car.driverName + " rejoined the track within " + 
			    this.dangerousRejoinDistance + " meters of " + carList + ".");
				
			const { sessionNum, sessionTime } = app;
			this.outbox.send<IncidentData>('incident', 
			{ car, sessionNum, sessionTime, type: 'dangerous_rejoin' });

		}
	}

	/**
	 * Returns true if the value is between the two positions on track, where
	 * all values are modulo'd properly to deal with the track being a circuit.
	 *
	 * Examples:
	 * - insideTrackRange(0.5, 0.4, 0.6) : true
	 * - insideTrackRange(0.0, 0.9, 1.1) : true
	 * - insideTrackRange(0.0, 0.9, 0.1) : true
	 * - insideTrackRange(1.6, 0.7, 0.2) : false
	 */
	private insideTrackRange(value: number, min: number, max: number): boolean {
	
		// modulo all values to get them between 0 and 1
		value -= Math.floor(value);
		min -= Math.floor(min);
		max -= Math.floor(max);
		
		// adjust min and max so that they're in the proper order
		if(max < min) {
			max += 1.0;
		}
		
		return (value >= min && value <= max) ||
			((value+1) >= min && (value+1) <= max);
	}

}