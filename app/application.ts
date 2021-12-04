
import iracing from 'node-irsdk-2021';
import { IncidentDb } from '../common/incidentdb';
import { Outbox } from './state';

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


