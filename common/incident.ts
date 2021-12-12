/**
 * After being created, incidents will have a null resolution. They can be resolved with the following meanings:
 * - Acknowledged: the incident has been reviewed and will be recorded against the driver
 * - Dismissed: the incident was spurious, or otherwise will not go on the driver's record
 * - Penalized: the incident was acknowledged and the driver was penalized for it
 * - Deleted: the incident was cleared as part of a session change. It still exists in the database, but should not be shown in the UI
 */
export type Resolution = 'Unresolved' | 'Acknowledged' | 'Dismissed' | 'Penalized' | 'Deleted';

/**
 * The known possible incident types. See app/watchers for implementations
 * - Track Limits: driver went off track for a short amount of time
 * - Off-Track: driver was off track for an extended period of time
 * - Unsafe Rejoin: driver may have rejoined the racing surface very close to another driver
 * - Involved in Major Incident: driver was part of a big crash that caused a FCY
 * - Incident Count: the driver's iRacing incident count increased
 * - Other: unknown type, see 'description' for more details
 * - Failed Requirement: driver did not satisfy a requirement before a session change. see 'description' for details
 */
export type IncidentCar = {
    index: number
    number: string
    driverName: string
    teamName: string
    incidentCount: number
    currentLap: number
    currentLapPct: number
};
export type IncidentClass = 'Track Limits' | 'Off-Track' | 'Unsafe Rejoin' | 'Involved in Major Incident' | 'Incident Count' | 'Other' | 'Failed Requirement';
export type IncidentData = {
    sessionTime: number
    sessionNum: number
    type: IncidentClass
    description?: string
    penalty?: 'd' | number
    car: IncidentCar
};

export type Incident = {
    id: number,
    resolution: Resolution,
    data: IncidentData
};

