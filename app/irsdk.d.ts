declare module 'node-irsdk-2021' {
  interface TelemetryData {
    timestamp: Date
    values: {
      SessionNum: number
      SessionTime: number
      ReplaySessionNum: number
      ReplaySessionTime: number
      CamCarIdx: number
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

  export class ReplaySearchMode {
    static readonly ToStart = 0;
    static readonly ToEnd = 1;
    static readonly PrevSession = 2;
    static readonly NextSession = 3;
    static readonly PrevLap = 4;
    static readonly NextLap = 5;
    static readonly PrevFrame = 6;
    static readonly NextFrame = 7;
    static readonly PrevIncident = 8;
    static readonly NextIncident = 9;

    private constructor() { }
  }

  export class SDKInstance {
    on(event: string, handler: (data: any) => void)

    camControls: {
      switchToCar(carNumber: string): void
    }

    playbackControls: {
      searchTs(sessionNumber: number, sessionTimeMS: number): void
      search(replaySearchMode: number): void
    }
  }

  export function init({ sessionInfoUpdateInterval: number, telemetryUpdateInterval: number }): SDKInstance
  export function getInstance(): SDKInstance
}