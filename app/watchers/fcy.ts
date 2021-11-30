import { Observer, CarState, AppState, Outbox } from "@app/state";
import { IncidentData } from "@common/index";

type MajorIncident = {
    car: CarState
    sessionTime: number;
    sessionNum: number;

    /**
     * True if this incident triggered a FCY suggestion, or was close enough to a previous incident to be considered
     */
    triggeredFCY: boolean;
}

export class MajorIncidentWatcher implements Observer {

    private outbox: Outbox;

    constructor(outbox: Outbox) {
        this.outbox = outbox;
    }

    /**
     * If true, will consider any time a car goes off track to be a "major incident"
     */
    public testing: boolean = false;

    private carWasInvolvedInMajorIncident(oldCar: CarState, newCar: CarState): boolean {
        if (this.testing) {
            return oldCar.trackSurface != "OffTrack" && newCar.trackSurface == "OffTrack";
        }

        let incidentIncrement = newCar.incidentCount - oldCar.incidentCount;
        return incidentIncrement >= this.minIncidentIncrement;
    }

    onUpdate(prevState: AppState, newState: AppState): void {
        let { sessionNum, sessionTime } = newState;
        if (sessionNum != this.lastSessionNum) {
            this.incidents = [];
        }

        // for replays
        if (sessionTime < this.lastSessionTime) {
            // remove all incidents were recorded after the session time
            this.incidents = this.incidents.filter((inc) => {
                return inc.sessionNum == sessionNum && inc.sessionTime < sessionTime;
            });
        }
        this.lastSessionNum = sessionNum;
        this.lastSessionTime = sessionTime;

        // look for major incidents (where incident points for a driver goes up by more than one)
        newState.cars.forEach((car) => {
            let oldCar = prevState.findCar(car.number);
            if (oldCar) {

                let majorIncident = this.carWasInvolvedInMajorIncident(oldCar, car);

                if (majorIncident) {
                    // major incident detected. look for other recent incidents

                    let recentMajorIncidents = this.incidents.filter((inc) => {
                        return inc.sessionNum == sessionNum &&
                            inc.sessionTime >= (sessionTime - this.timeWindow);
                    });

                    // if any of the previously scanned incidents triggered a FCY, then save this one, but don't trigger another FCY
                    let majorCrashOngoing = recentMajorIncidents.some((inc) => {
                        return inc.triggeredFCY;
                    });

                    // if this incident pushes the number of recent incidents up over the limit, or if it's being tacked on to a previous major crash, a FCY should be active, if not already.
                    let triggeredFCY = (recentMajorIncidents.length >= (this.minCarsInvolved - 1)) || majorCrashOngoing;

                    let incident: MajorIncident = {
                        sessionNum,
                        sessionTime,
                        car,
                        triggeredFCY
                    };

                    this.incidents.push(incident);

                    // if this is the first time we're attempting to activate a FCY, send an incident.
                    if (!majorCrashOngoing && triggeredFCY) {
                        // start a new "major incident"
                        // add the original incident cars to the major incident (the new incident will be added later)
                        this.currentMajorIncidents = recentMajorIncidents;

                        this.outbox.send<IncidentData>('incident', {
                            car,
                            sessionNum,
                            sessionTime,
                            type: "major_crash"
                        });
                    }


                    if (triggeredFCY) {
                        // add this to the list of ongoing incidents
                        this.currentMajorIncidents.push(incident);
                        // extend the "reset" time for the current incident
                        this.currentMajorIncidentEndsAt = sessionTime + this.timeWindow;
                    }
                }
            }
        });

        // see if we can end the current "major incident"
        if (this.currentMajorIncidentEndsAt && this.currentMajorIncidentEndsAt <= sessionTime) {

            // report incidents for everyone involved and end the current "major incident"

            this.currentMajorIncidents.forEach((inc) => {
                this.outbox.send<IncidentData>('incident',{
                    car: inc.car,
                    sessionNum: inc.sessionNum,
                    sessionTime: inc.sessionTime,
                    type: "participant_in_major_crash"
                });
            });

            this.currentMajorIncidents = [];
            this.currentMajorIncidentEndsAt = null;
        }
    }

    /**
     * The minimum number of cars that must be involved in a "major" incident to suggest a FCY
     */
    public minCarsInvolved: number = 3;

    /**
     * the time period (in seconds) that the major incidents must occur within to suggest a FCY
     */
    public timeWindow: number = 5;

    /**
     * the minimum incident increment amount that is considered a "major" incident. This should probably be left alone.
     * 
     * From iRacing:
     * - 0x = light car contact
     * - 1x = off track
     * - 2x = loss of control
     * - 2x = contact with track object
     * - 4x = major car contact (2x on ovals)
     */
    public minIncidentIncrement: number = 2;

    // A list of all "major" incidents
    private incidents: MajorIncident[] = [];

    // a list of all cars involved in the current big pileup, if there is one
    private currentMajorIncidents: MajorIncident[] = [];

    // if a major incident is ongoing, this is the sessionTime at which it we will stop checking for new cars to add to it, and consider any other incidents to be part of a new "major incident"
    private currentMajorIncidentEndsAt: number | null = null;

    private lastSessionNum: number = -1;
    private lastSessionTime: number = -1;
}