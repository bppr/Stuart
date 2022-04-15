
import _ from 'lodash';
import iracing from 'node-irsdk-2021';
import { HexColor, CarColors } from '../common/util'

export type CarSessionFlag = "Servicible" | "Black" | "Repair"
export type TrackSurface ="OnTrack" | "OffTrack" | "NotInWorld" | "AproachingPits" | "InPitStall" ; // sic: "AproachingPits" is spelled wrong in the telemetry data
export type SessionFlag = "StartHidden" | "StartGo" | "StartReady" | "OneLapToGreen" | "Caution" | "CautionWaving";
/**
 * AppState is a more convenient view of the iRacing game state
 * that combines information from the Session data feed and the
 * Telemetry data feed.
 * 
 * To make use of a property from iRacing, first add an appropriate
 * definition for it to irsdk.d.ts and here. Then update "toAppState"
 * in app/state/streams.ts to copy the values from the game state.
 */

export function getTrackLength(sesh: iracing.SessionData): number {
  const trackLengthStr = sesh.data.WeekendInfo.TrackLength;
  const trackLengthRegex = new RegExp("^(\\d+(\\.\\d+)?) (\\w+)$");
  const match = trackLengthRegex.exec(trackLengthStr);

  if (match) {
    const trackLength = +(match[1]);
    const distanceUnit = match[3];

    return trackLength * (distanceUnit == "km" ? 1000 : 1609.344)
  }

  return 0;
}

export type TimeStamp = {
  session: number,
  time: number,
}

export type AppState = {
  /**
   * The current live time in sim.
   */
  live: TimeStamp,
  sessionFlags: SessionFlag[],
  camera: {
    carIdx: number,
    speed: number,
    time: TimeStamp,
  },
  weekend: {
    /** A human-readable display name for the current track */
    trackName: string,
    /** a machine-readable track ID */
    trackId: string,
    /** the overall length of the track in meters */
    trackLength: number,
    /** e.g., '0.9 mi' or '1.7 km' */
    trackDisplayLength: string,
  },
  cars: CarState[],
  findCarByIdx: (_:number) => CarState | undefined,
  findCarByNumber: (_:string) => CarState | undefined,
}

export type CarState = {
  // session

  idx: number,
  number: string,
  /**
   * Human-readable class name
   */
  className: string,
  /**
   * Machine readable class ID
   */
  classId: number,
  classColor: HexColor,
  carName: string,
  carNameShort: string,
  carColors: CarColors,
  teamName: string,
  drivers: {
    customerId: number,
    name: string,
    shortName: string,
    incidentCount: number,
  }[],
  teamIncidentCount: number,

  // telemetry

  lap: number,
  trackPositionPct: number,
  officialPosition: number,
  officialClassPosition: number,
  trackSurface: TrackSurface,
  isAI: boolean,
  isPaceCar: boolean,
  paceRow: number,
  paceLine: number,
  flags: CarSessionFlag[]
}

function fromInt(hexColor: number) : HexColor {
  return "#" + hexColor.toString(16).padStart(6, '0');
}

function fromDesignString(designStr: string) : CarColors {
  // TODO regex this string in the form "12,111111,222222,333333"
  return {
    primary: "#000000",
    secondary: "#000000",
    tertiary: "#000000",
  }
}

function createLookupFunction<K,V>(values: V[], getKey:(_:V) => K): (_:K) => V | undefined {
  const lookupTable: Map<K, V> = new Map();
  values.forEach(value => {
    lookupTable.set(getKey(value), value);
  });
  return lookupTable.get.bind(lookupTable);
}

/**
 * Generates a new AppState based on the latest session and telemetry data
 */
export function toAppState(session: iracing.SessionData, telemetry: iracing.TelemetryData): AppState {

  // Iterate over drivers to start building up car array as new cars are discovered
  let cars: Map<number, CarState> = new Map();

  for(let driver of session.data.DriverInfo.Drivers) {
    const idx = driver.CarIdx;

    let car = cars.get(idx);
    if(!car) {
      car = {
        carName: driver.CarScreenName,
        carNameShort: driver.CarScreenNameShort,
        classColor: fromInt(driver.CarClassColor),
        classId: driver.CarClassID,
        className: driver.CarClassShortName,
        drivers: [],
        idx: idx,
        carColors: fromDesignString(driver.CarDesignStr),
        isAI: driver.CarIsAI != 0,
        isPaceCar: driver.CarIsPaceCar != 0,
        number: driver.CarNumber,
        teamName: driver.TeamName,
        teamIncidentCount: driver.TeamIncidentCount,
        
        lap: telemetry.values.CarIdxLap[idx],
        officialClassPosition: telemetry.values.CarIdxPosition[idx],
        officialPosition: telemetry.values.CarIdxPosition[idx],
        paceLine: telemetry.values.CarIdxPaceLine[idx],
        paceRow: telemetry.values.CarIdxPaceRow[idx],
        trackPositionPct: telemetry.values.CarIdxLapDistPct[idx],
        trackSurface: telemetry.values.CarIdxTrackSurface[idx] as TrackSurface,
        flags: telemetry.values.CarIdxSessionFlags[idx]
      };
      cars.set(idx, car);
    }

    car.drivers.push({
      customerId: driver.UserID,
      incidentCount: driver.CurDriverIncidentCount,
      name: driver.UserName,
      shortName: driver.AbbrevName,
    });
  }

  let sessions = session.data.SessionInfo.Sessions;

  return {
    cars: [...cars.values()],
    camera: {
      carIdx: telemetry.values.CamCarIdx,
      time: {
        session: telemetry.values.ReplaySessionNum,
        time: telemetry.values.ReplaySessionTime,
      },
      speed: telemetry.values.ReplayPlaySpeed,
    },
    live: {
      session: telemetry.values.SessionNum,
      time: telemetry.values.SessionTime,
    },
    weekend: {
      trackDisplayLength: session.data.WeekendInfo.TrackLength,
      trackLength: getTrackLength(session),
      trackId: session.data.WeekendInfo.TrackConfigName,
      trackName: session.data.WeekendInfo.TrackDisplayName,
    },
    sessionFlags: telemetry.values.SessionFlags,

    findCarByIdx: (idx: number) => cars.get(idx),
    findCarByNumber: createLookupFunction([...cars.values()], (car) => car.number),
  };
}


