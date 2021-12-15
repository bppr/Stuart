import { Outbox } from "./state";
import { Incident, IncidentData, Resolution } from "../common/incident";

/**
 * IncidentDb is an in-memory database of incidents, which keeps track of their resolutions and publishes changes when an incident is created or resolved.
 * 
 * It publishes two kinds of messages to the provided outbox:
 * - 'incident-created': when an incident is first {@linkplain IncidentDb.publish | created}
 * - 'incident-resolved': when an incident is {@linkplain IncidentDb.resolve | resolved}
 * 
 * Both messages use the {@link Incident} type as their data format.
 */
export class IncidentDb {
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
            resolution: 'Unresolved',
            data
        };

        this.incidents.set(incident.id, incident);

        this.outbox.send<Incident>('incident-created', incident);

        return incident;
    }

    /**
     * Resolves an incident with the given ID and publishes the resolution.
     * 
     * @param id the {@linkplain Incident.id | ID} of the incident to be resolved
     * @param resolution the desired resolution for the incident
     * @returns the new resolution of the incident, which may be different from the given resolution, if the incident was already resolved, or may be 'undefined' if no incident with the given ID exists.
     */
    public resolve(id: number, resolution: Resolution): Resolution | undefined {
        return this.changeResolution(id, resolution);
    }

    public clearAll(): void {
        this.incidents.forEach((inc, id) => {
            if (inc.resolution != "Deleted") {
                this.changeResolution(inc.id, "Deleted");
            }
        })
    }

    private changeResolution(id: number, resolution: Resolution): Resolution | undefined {
        let incident = this.incidents.get(id);
        if (incident) {
            incident.resolution = resolution;
            this.incidents.set(incident.id, incident);
            this.outbox.send<Incident>('incident-resolved', incident);
            //console.log('IN: resolving incident ' + incident.id + " = " + resolution);
        }
        return incident?.resolution;
    }

    public getIncidentData(id: number): IncidentData | undefined {
        let inc = this.incidents.get(id);
        if (inc) {
            return { ...inc.data };
        } else {
            return undefined;
        }
    }

    public getIncidentResolutions(includeDeleted = false): Map<number, Resolution> {
        let resolutions = new Map<number, Resolution>();
        this.incidents.forEach((inc, id) => {
            if (inc.resolution != "Deleted" || includeDeleted) {
                resolutions.set(id, inc.resolution);
            }
        });
        return resolutions;
    }
}