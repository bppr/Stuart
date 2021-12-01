
/**
 * Requirements is a system for keeping track of things that a team or driver 
 * must do during the course of a session.
 */

import { AppState, CarState, Observer, Outbox, SessionType } from "../state";
import { IncidentData } from "../../common/index";



export enum SessionMarker {
    StartOfRace,
    EndOfRace,
    StartOfQualifying,
    EndOfQualifing,
    StartOfPractice,
    EndOfPractice
}



// TODO we will have to be very careful about which states we send to these 
// checkers, if we're doing so when the session changes. We will have to be
// careful about syncing up the SessionInfo and TelemetryInfo updates so that
// we call "EndOfX" when SessionInfo changes, but with telemetry from the 
// previous session, and likewise, we shouldn't call "StartOfX" with Telemetry
// state from the previous session. 

/**
 * Requirement defines a certain car state that must be fulfilled by a specific time in the race.
 */
export interface Requirement {
    /**
     * A short, unique name for this requirement.
     */
    getName(): string;
    /**
     * A more detailed, human-readable name for this requirement, suitable for display in a tooltip.
     */
    getDescription(): string;

    /**
     * The points at which this requirement should be verified. If the requirement is not met at the points in time specified by these markers, the incident returned by {@link verifyRequirement} will be raised.
     */
    whenToValidate(): SessionMarker[];

    /**
     * The session types that this requirement applies to. The requirement may be {@linkplain verifyRequirement | checked} during this time, but the returned incident will not be raised.
     */
    validDuring(): SessionType[];

    /**
     * Called when a completely new race session begins, or if an admin requests that requirements are cleared. If a car index is provided, only reset the requirements for that driver
     */
    clear(carIdx?: number): void;

    /**
     * Verifies that this requirement has been met. Will be called based on the timings specified in {@link whenToCheck}.
     * 
     * This method may be called multiple times during the appropriate session, to see if the requirement has been fulfilled, but the returned incident will only be raised when it is called at the appropriate time.
     * 
     * @param car the car in question
     * @param app the overall state of the app at the point the requirement is to be checked
     * 
     * @returns an IncidentData if the requirement has not been met, with the suggested description and penalties, or null if the requirement has been fulfilled
     */
    verifyRequirement(car: CarState, app: AppState): IncidentData | null;
}

/**
 * Requirements is an Observer that validates the state of the race against a set of child {@link Requirement} instances. If the requirements are not satisfied by specific points in the session, an incident will be published to the outbox. 
 */
export class Requirements implements Observer {

    // TODO add checking and reporting of in-progress requirements
    outbox: Outbox;

    constructor(outbox: Outbox) {
        this.outbox = outbox;
    }

    onUpdate(prevState: AppState, newState: AppState): void {
        
        // TODO figure these out from the app state
        let oldSessionType: SessionType | null;
        let newSessionType: SessionType | null;

        oldSessionType = null;
        newSessionType = null;

        // TODO determine whether the race check has occurred.
        // We need to synchronize sessionInfo updates with telemetryInfo updates when a session change happens.
        // TelemetryInfo has "sessionNum", so we can check for that to change
        // SessionInfo... actually might not change when the session does.

        let oldStateMarkers: SessionMarker[] = [];
        let newStateMarkers: SessionMarker[] = [];

        if(oldSessionType != SessionType.Practice && newSessionType == SessionType.Practice) {
            newStateMarkers.push(SessionMarker.StartOfPractice);
        }
        if(oldSessionType == SessionType.Practice && newSessionType != SessionType.Practice) {
            oldStateMarkers.push(SessionMarker.EndOfPractice);
        }
        if(oldSessionType != SessionType.Qualifying && newSessionType == SessionType.Qualifying) {
            newStateMarkers.push(SessionMarker.StartOfQualifying);
        }
        if(oldSessionType == SessionType.Qualifying && newSessionType != SessionType.Qualifying) {
            oldStateMarkers.push(SessionMarker.EndOfQualifing);
        }
        if(oldSessionType != SessionType.Race && newSessionType == SessionType.Race) {
            newStateMarkers.push(SessionMarker.StartOfRace);
        }
        if(oldSessionType == SessionType.Race && newSessionType != SessionType.Race) {
            oldStateMarkers.push(SessionMarker.EndOfRace);
        }

        this.validateRequirements(prevState, oldStateMarkers);
        this.validateRequirements(newState, newStateMarkers);

    }

    requirements: Requirement[] = [];

    addRequirement(req: Requirement) {
        this.requirements.push(req);
    }

    private validateRequirements(app: AppState, markers: SessionMarker[]) {
        if(markers.length == 0) return;

        this.requirements.forEach((req) => {
            if(markers.some((m) => req.whenToValidate().includes(m))) {
                app.cars.forEach((car) => {
                    let incident = req.verifyRequirement(car, app);
                    if(incident) {
                        this.outbox.send('incident', incident);
                    }
                });
            }
        });
    }
}