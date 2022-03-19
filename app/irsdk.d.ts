declare module 'node-irsdk-2021' {
  export type SessionFlag = "StartHidden" | string;
  export type CarSessionFlag = "Servicible" | string;
  export type SessionState = "Racing" | string;

  export interface TelemetryData {
    timestamp: Date
    values: {
      SessionNum: number
      SessionTime: number
      ReplaySessionNum: number
      ReplaySessionTime: number
      ReplayPlaySpeed: number
      CamCarIdx: number
      CarIdxLap: number[]
      CarIdxLapDistPct: number[]
      CarIdxOnPitRoad: boolean[]
      CarIdxPaceLine: number[]
      CarIdxPaceRow: number[]
      CarIdxPosition: number[]
      CarIdxClassPosition: number[]
      CarIdxSessionFlags: SessionFlag[][]
      PaceMode: number
      CarIdxTrackSurface: string
    }
  }

  export interface SessionDriver {
    CarIdx: number
    TeamName: string
    UserName: string
    CarNumber: string
    TeamIncidentCount: number
    CarIsAI: number
    CarIsPaceCar: number
    UserID: number
  }

  export interface SessionData {
    SessionType: string
    ResultsFastestLap: {
      CarIdx: number
      FastestLap: number
      FastestTime: number
    }[]
  }

  export interface SessionData {
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

  type RpySrchMode = "ToStart" | "ToEnd" | "PrevSession" | "NextSession" | "PrevLap" | "NextLap" | "PrevFrame" | "NextFrame" | "PrevIncident" | "NextIncident";
  enum ChatCommand {
    Macro = 0,
    BeginChat = 1,
    Reply = 2,
    Cancel = 3,
  }
  export class SDKInstance {
    on(event: string, handler: (data: any) => void)

    camControls: {
      switchToCar(carNumber: string): void
    }

    playbackControls: {
      searchTs(sessionNumber: number, sessionTimeMS: number): void
      search(replaySearchMode: RpySrchMode): void
      //searchFrame(frame: number, replayPositionMode: number): void
      play(): void
      pause(): void
    }

    execChatCmd(command: number, arg?: number)
  }

  export function init({ sessionInfoUpdateInterval: number, telemetryUpdateInterval: number }): SDKInstance
  export function getInstance(): SDKInstance
}