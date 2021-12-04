// Database for incident creation and resolution
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
    resolution?: Resolution,
    data: IncidentData
};

