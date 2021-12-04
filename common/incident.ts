// Database for incident creation and resolution

import { Outbox } from "../app/state";

export type Resolution = 'Acknowledged' | 'Dismissed' | 'Penalized';

export type IncidentData = { 
    sessionTime: number
    sessionNum: number
    type?: string
    car: {
        index: number
        number: string
        driverName: string
        teamName: string
        incidentCount: number
        currentLap: number
        currentLapPct: number
    }
};


export type Incident = {
    id: number,
    resolution: Resolution?,
    data: IncidentData
};

/**
 * IncidentDb is an in-memory database of incidents, which keeps track of their resolutions and publishes changes when an incident is created or resolved.
 * 
 * It publishes two kinds of messages to the provided outbox:
 * - 'incident-created': when an incident is first {@linkplain IncidentDb.publish | created}
 * - 'incident-resolved': when an incident is {@linkplain IncidentDb.resolve | resolved}
 * 
 * Both messages use the {@link Incident} type as their data format.
 */
class IncidentDb {
    private idCounter: number = 1;
    private incidents = new Map<number, Incident>();
    private outbox: Outbox;

    public constructor(outbox: Outbox) {
        this.outbox = outbox;
    }

    /**
     * Creates and publishes a new incident with the given data.
     * 
     * @param data the descriptive contents of the new incident.
     */
    public publish(data: IncidentData): Incident {
        let incident: Incident = {
            id: (this.idCounter++),
            resolution: undefined,
            data
        };

        this.incidents.set(incident.id, incident);

        this.outbox.send<Incident>('incident-created', incident);
    }

    /**
     * Resolves an incident with the given ID and publishes the resolution.
     * 
     * @param id the {@linkplain Incident.id | ID} of the incident to be resolved
     * @param resolution the desired resolution for the incident
     * @returns the new resolution of the incident, which may be different from the given resolution, if the incident was already resolved, or may be 'undefined' if no incident with the given ID exists.
     */
    public resolve(id: number, resolution: Resolution): Resolution {
        let incident = this.incidents.get(id);
        if(incident) {
            if(!(incident.resolution)) {
                incident.resolution = resolution;
                this.incidents.set(incident.id, incident);
                this.outbox.send<Incident>('incident-resolved', incident);
            }
        }
        return incident?.resolution;
    }
}