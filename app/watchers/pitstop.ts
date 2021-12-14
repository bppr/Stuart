import { CarTimer } from "./cartimer";
import { CarState, AppState, Observer, SessionType } from '../state';
import { Requirement, SessionMarker } from "./requirements";
import { IncidentData } from "@common/incident";

export class PitBoxTimer extends CarTimer implements Requirement {

	constructor(timeLimit?: number) {
		super(timeLimit);
	}

	clear(carIdx?: number): void {
		if (carIdx) {
			this.completedPitstopsByCarIdx.delete(carIdx);
		} else {
			this.completedPitstopsByCarIdx.clear();
		}
	}

	getName(): string {
		return "Minimum Pitstop Time";
	}
	getDescription(): string {
		return "Driver must complete " + this.minPitstops + " pitstop(s) where they spend at least " + Math.ceil(this.getTimeLimit()) + " seconds in their pit stall.";
	}
	whenToValidate(): SessionMarker[] {
		return [SessionMarker.EndOfRace];
	}
	validDuring(): SessionType[] {
		return [SessionType.Race];
	}

	protected getIncidentType(): string {
		return "min_pitstops_box_time";
	}

	verifyRequirement(car: CarState, app: AppState): IncidentData | null {
		const completedPitstops = this.completedPitstopsByCarIdx.get(car.index) ?? 0;
		if (completedPitstops < this.minPitstops) {
			let incident: IncidentData = {
				car,
				sessionNum: app.sessionNum,
				sessionTime: app.sessionTime,
				type: this.getIncidentType(),
			}
			return incident;
		} else {
			return null;
		}
	}

	/**
	 * The minimum number of pitstops a driver must complete, that take the {@linkplain getTimeLimit | minimum amount of time}.
	 */
	minPitstops: number = 0;

	private completedPitstopsByCarIdx = new Map<number, number>();

	protected isCarInTargetState(car: CarState): boolean {
		return car.trackSurface == "InPitStall";
	}

	protected onStateTimeExceeded(car: CarState, time: number, app: AppState): void {
		if (app.sessionType == SessionType.Race) {
			const completedPitstops = this.completedPitstopsByCarIdx.get(car.index) ?? 0;
			this.completedPitstopsByCarIdx.set(car.index, completedPitstops + 1);
			console.log("PT: " + car.driverName + " has completed their " + Math.floor(time) + "s pitstop.");
		}

	}
}

class PitLaneTimer extends PitBoxTimer {
	protected getIncidentType(): string {
		return "min_pitstops_lane_time";
	}	

	protected isCarInTargetState(car: CarState) {
		return car.onPitRoad;
	}

	getDescription(): string {
		return "Driver must complete " + this.minPitstops + " pitstop(s) where they spend at least " + Math.ceil(this.getTimeLimit()) + " seconds in pit lane.";
	}
}