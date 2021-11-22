export type TelemetryData = {
  timestamp: Date
  values: {
    SessionNum: number
    SessionTime: number
    CarIdxLap: number[]
    CarIdxLapDistPct: number[]
    CarIdxOnPitRoad: boolean[]
    CarIdxTrackSurface: string
  }
}

export type SessionData = {
  timestamp: Date
  data: {
    DriverInfo: {
      Drivers: {
        CarIdx: number
        TeamName: string
        UserName: string
        CarNumber: string
        TeamIncidentCount: number
      }[]
    }
  }
}