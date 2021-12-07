import { IncidentDb } from './incidentdb';
import { Outbox } from './state';

/**
 * Application contains certain global variables and state that may be initialized and accessed out of order
 */
export default class Application {

    public readonly incidents: IncidentDb;

    constructor(private outbox: Outbox) {
        this.incidents = new IncidentDb(outbox);
    }

    static instance: Application;

    public static initialize(outbox: Outbox) {
        if(Application.instance) {
            throw "Application already initialized";
        } else {
            Application.instance = new Application(outbox);
        }
    }
    
    public static getInstance(): Application {
        if(Application.instance) {
            return Application.instance;
        } else {
            throw "Application not initialized"
        }
    }
}


