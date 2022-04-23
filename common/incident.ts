
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

import { DriverCar } from "./DriverState";
import { SessionTime } from "./ClockState";

export type Incident = {
    car: DriverCar,
    lap: number,
    trackPositionPct: number,
    time: SessionTime,
    type: IncidentClass,
    description?: string,
    penalty?: 'd' | number,
}

export type IncidentClass = 'Track Limits' | 'Off-Track' | 'Unsafe Rejoin' | 'Involved in Major Incident' | 'Incident Count' | 'Other' | 'Failed Requirement';

