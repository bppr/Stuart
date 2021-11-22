export type DriverData = { 
  index: number
  name: string
  team: string
  carNumber: string
  incidents: number
}

export type IncidentData = { 
  timestamp: Date
  sessionTime: number
  sessionNum: number
  driver: DriverData
  lap: number
  lapPct: number
}