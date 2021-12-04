import { Observer, AppState, CarState } from '../state';

type CarTime = {
	startTime: number,
	cbTriggered: boolean,
	cooldownTime?: number
}

/**
 * CarTimer is a base class for implementing state watchers that require 
 * timing the length of certain telemetry states.
 *
 * It operates over cars individually, requiring only that implementors 
 * implement [isCarInTargetState]. Various "onX" methods will be fired off
 * when the car enters and exits that state, with timing information provided.
 *
 * In addition to timing the overall duration that a car spends in the target
 * state, [CarTimer] can fire off an event once the car has been in that state
 * for a specified amount of time. This can help deal with spurious event 
 * states, such as going off-track for a brief amount of time, or can be used
 * to ensure that requirements are met, such as stopping in the pits for a 
 * minimum amount of time.
 */
export abstract class CarTimer implements Observer {
	private timesByCarIdx: Map<number, CarTime>;
	
	// this could be a property?
	private timeLimit: number;
	
	// TODO not implemented  yet
	private cooldownTime: number;
	
	constructor(timeLimit?: number, cooldown?: number) {
		this.timeLimit = timeLimit || 0;
		this.cooldownTime = cooldown || 0;
		this.timesByCarIdx = new Map();
	}
	
	getTimeLimit(): number {
		return this.timeLimit;
	}
	
	/**
	 * A method that returns true when the car is in the target state to be 
	 * timed.
	 * 
	 * @param car the current state of the car
	 * @returns true if the car is in the desired state
	 */
	protected abstract isCarInTargetState(car: CarState): boolean;
	
	/** 
	 * Called every time a telemetry update happens and the car is in the 
	 * {@linkplain isCarInTargetState | target state}.
	 *
	 * @param car the current state of the car
	 * @param time the number of seconds the car has been in this state
	 * @param app the current overall state of the Application
	 */
	protected onStateTime(car: CarState, time: number, app: AppState): void {}
	
	/**
	 * Called when a car first enters the {@linkplain isCarInTargetState | target state}.
	 */
	protected onStateEntered(car: CarState, app: AppState): void {}
	
	/**
	 * Called when the amount of time the car has spent in the 
	 * {@linkplain isCarInTargetState | target state} has exceeded this timer's
	 * {@linkplain getTimeLimit | time limit}.
	 * 	 
	 * car: the current state of the car
	 * time: the number of seconds the car has been in this state
	 */
	protected onStateTimeExceeded(car: CarState, time: number, app: AppState): void {}
	 
	/**
	 * Called when the car leaves the {@linkplain isCarInTargetState | target state}.
	 */
	protected onStateExited(car: CarState, time: number, timeExceeded: boolean, app: AppState): void {}
	 
	onUpdate(oldState: AppState, newState: AppState) : void {
		let sessionTime = newState.sessionTime;
		
		newState.cars.forEach((car) => {
			let carIdx = car.index;
			let started = this.timesByCarIdx.has(carIdx);
			
			let targetState = this.isCarInTargetState(car);
			if(targetState) {
				let startTime = 0;
				if(!started) {
					startTime = sessionTime;
					let ct: CarTime = {
						startTime: sessionTime,
						cbTriggered: false
					}
					this.timesByCarIdx.set(carIdx, ct);

					this.onStateEntered(car, newState);
				} else {
				   startTime = this.timesByCarIdx.get(carIdx)!.startTime;
				}
				
				let duration = sessionTime - startTime;
				this.onStateTime(car, duration, newState);
				
				if(duration >= this.timeLimit && !(this.timesByCarIdx.get(carIdx)!.cbTriggered)) {
					this.onStateTimeExceeded(car, duration, newState);
					let ct = this.timesByCarIdx.get(carIdx)!;
					ct.cbTriggered = true;
					this.timesByCarIdx.set(carIdx, ct);
				}
			} else {
				if(started) {
					let ct = this.timesByCarIdx.get(carIdx)!;
					let duration = sessionTime - ct.startTime;
					this.onStateExited(car, duration, ct.cbTriggered, newState);
					this.timesByCarIdx.delete(carIdx);
				}
			}
		});
	}
}