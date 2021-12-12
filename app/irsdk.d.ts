declare module 'node-irsdk-2021' {
  interface TelemetryData {
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

  interface SessionDriver {
    CarIdx: number
    TeamName: string
    UserName: string
    CarNumber: string
    TeamIncidentCount: number
    CarIsAI: number
    CarIsPaceCar: number
    UserID: number
  }

  interface SessionData {
    SessionType: string
    ResultsFastestLap: {
      CarIdx: number
      FastestLap: number
      FastestTime: number
    }[]
  }

  interface SessionData {
    timestamp: Date
    data: {
      DriverInfo: {
        Drivers: SessionDriver[]
      }
      WeekendInfo: {
        TrackName: string
        TrackLength: string
        TrackID: number
        TrackDisplayName: string
        TrackDisplayShortName: string
        TrackConfigName: string
      }
      SessionInfo: {
        Sessions: SessionData[]
      }
    }
  }

  export class SDKInstance {
    on(event: string, handler: (data: any) => void)

    camControls: {
      switchToCar(carNumber: string): void
    }

    playbackControls: {
      searchTs(sessionNumber: number, sessionTimeMS: number): void
    }
  }

  export function init({ sessionInfoUpdateInterval: number, telemetryUpdateInterval: number }): SDKInstance
  export function getInstance(): SDKInstance
}