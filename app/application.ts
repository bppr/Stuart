import { IncidentDb } from './incidentdb';
import { ReplayOutbox } from './replay_outbox';
import { Outbox } from './state';

/**
 * Application contains certain global variables and state that may be initialized and accessed out of order
 */
export default class Application {

    public readonly incidents: IncidentDb;

    private readonly outbox: ReplayOutbox;

    constructor() {
        this.outbox = new ReplayOutbox();
        this.incidents = new IncidentDb(this.outbox);
    }

    static instance: Application;

    public addOutbox(outbox: Outbox, replayEvents = true) {
        this.outbox.addOutbox(outbox, replayEvents);
    }

    public getOutbox(): ReplayOutbox {
        return this.outbox;
    }

    public static getInstance(): Application {
        if (Application.instance) {
            return Application.instance;
        } else {
            Application.instance = new Application();
            return Application.instance;
        }
    }
}


