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

  interface SessionData  {
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