declare module 'node-irsdk-2021' {
  export type SessionFlag = "StartHidden" | "StartGo" | "StartReady" | "OneLapToGreen" | "Caution" | "CautionWaving";
  export type CarSessionFlag = "Servicible" | "Black" | "Repair" | "Disqualify";
  export type SessionState = "GetInCar" | "ParadeLaps" | "Racing" | "CoolDown" ;
  export type SessionType = "Race" | "Qualifying" | "Practice" ;
  export type SessionSubType = "Feature" | "Heat" | null;
  export type TrackSurface = "OnTrack" | "OffTrack" | "NotInWorld" | "AproachingPits" | "InPitStall" ; // sic: "AproachingPits" is spelled wrong in the telemetry data

  export interface TelemetryData {
    timestamp: Date
    values: {
      SessionNum: number
      SessionTime: number
      ReplaySessionNum: number
      ReplaySessionTime: number
      ReplayPlaySpeed: number
      CamCarIdx: number
      CamCameraNumber: number
      CamGroupNumber: number
      CarIdxLap: number[]
      CarIdxLapDistPct: number[]
      CarIdxOnPitRoad: boolean[]
      CarIdxPaceLine: number[]
      CarIdxPaceRow: number[]
      CarIdxPosition: number[]
      CarIdxClassPosition: number[]
      CarIdxSessionFlags: CarSessionFlag[][]
      PaceMode: number
      CarIdxTrackSurface: TrackSurface,
      SessionFlags: SessionFlag[]
    }
  }

  export interface SessionDriver {
    CarIdx: number
    AbbrevName: string,
    CarClassColor: number,
    CarClassID: number,
    CarClassShortName: string,
    CarDesignStr: string,
    CarScreenName: string,
    CarScreenNameShort: string,
    IRating: number,
    UserId: number,
    LicString: string,
    TeamName: string
    UserName: string
    CarNumber: string
    TeamIncidentCount: number
    CarIsAI: number
    CarIsPaceCar: number
    UserID: number
    CurDriverIncidentCount: number
  }

  export interface SessionData {
    SessionType: SessionType,
    SessionSubType: SessionSubType,
    SessionName: string,
    SessionNum: number,
    SessionTime: string,
    SessionLaps: number | "unlimited",

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
      },
      CameraInfo: {
        Groups: {
          GroupName: string,
          GroupNum: number,
          Cameras: {
            CameraName: string,
            CameraNum: number
          }[]
        }[]
      }
    }
  }

  export type RpySrchMode = "ToStart" | "ToEnd" | "PrevSession" | "NextSession" | "PrevLap" | "NextLap" | "PrevFrame" | "NextFrame" | "PrevIncident" | "NextIncident";
  const ChatCommand = {
    Macro: 0,
    BeginChat: 1,
    Reply: 2,
    Cancel: 3,
  }
  export class SDKInstance {
    on(event: string, handler: (data: any) => void)

    camControls: {
      switchToCar(carNumber: string, camGroupNum?: number, camNum?: number): void
    }

    playbackControls: {
      searchTs(sessionNumber: number, sessionTimeMS: number): void
      search(replaySearchMode: RpySrchMode): void
      //searchFrame(frame: number, replayPositionMode: number): void
      play(): void
      pause(): void
      fastForward(speed: number): void,
      rewind(speed: number): void,
    }

    execChatCmd(command: number, arg?: number)
  }

  export function init({ sessionInfoUpdateInterval: number, telemetryUpdateInterval: number }): SDKInstance
  export function getInstance(): SDKInstance
}