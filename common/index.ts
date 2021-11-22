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
}