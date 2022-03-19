
import { ClockState } from "../common/ClockState"
import { IncidentData } from "../common/incident"

const TEST_INCIDENTS: IncidentData[] = [
  {
    sessionNum: 1,
    sessionTime: 10.0,
    car: {
      currentLap: 3,
      currentLapPct: 0.5,
      driverName: "Zach C Miller",
      incidentCount: 1,
      index: 1,
      number: "49",
      teamName: "Zach C Miller",
    },
    type: "Incident Count",
  },{
    sessionNum: 1,
    sessionTime: 15.0,
    car: {
      currentLap: 4,
      currentLapPct: 0.53,
      driverName: "Zach C Miller",
      incidentCount: 2,
      index: 1,
      number: "49",
      teamName: "Zach C Miller",
    },
    type: "Incident Count",
  },{
    sessionNum: 1,
    sessionTime: 20.0,
    car: {
      currentLap: 4,
      currentLapPct: 0.12,
      driverName: "Brian Pratt2",
      incidentCount: 2,
      index: 2,
      number: "21",
      teamName: "Brian Pratt2",
    },
    type: "Incident Count"
  },{
    sessionNum: 1,
    sessionTime: 25.0,
    car: {
      currentLap: 4,
      currentLapPct: 0.12,
      driverName: "Joel del Maria del Sol Garbanzolo de el nombre largo",
      incidentCount: 2,
      index: 3,
      number: "8",
      teamName: "Team Longest Name Racing",
    },
    type: "Incident Count"
  }
]


const TEST_INCIDENTS2  = [
  {
    sessionNum: 0,
    sessionTime: 45.5016098234,
    resolved: false,
    tallied: false,
    key: 1,
    car: {
      index: 0,
      driverName: 'Brian Pratt2',
      number: '21',
      teamName: 'Powell Autosport',
      incidentCount: 3,
      currentLap: 4,
      currentLapPct: 0.4205678
    }
  },
  {
    sessionNum: 0,
    sessionTime: 49.5016098234,
    resolved: false,
    tallied: false,
    key: 2,
    car: {
      index: 0,
      driverName: 'Brian Pratt2',
      number: '21',
      teamName: 'Powell Autosport',
      incidentCount: 5,
      currentLap: 4,
      currentLapPct: 0.4405678
    }
  },
  {
    sessionNum: 0,
    sessionTime: 58.591304598,
    resolved: false,
    tallied: false,
    key: 3,
    car: {
      index: 1,
      driverName: 'Mike Racecar',
      number: '18',
      teamName: 'Gabir Motors',
      incidentCount: 7,
      currentLap: 3,
      currentLapPct: 0.6958742
    }
  }
]

const TEST_CLOCK_STATE: ClockState = {
  camCar: {
    driverName: "Zach C Miller",
    index: 1,
    number: "49",
  },
  camSpeed: 1,
  live: {
    num: 1,
    time: 60,
  },
  replay: {
    num: 1,
    time: 40
  }
}

export {
  TEST_INCIDENTS,
  TEST_INCIDENTS2,
  TEST_CLOCK_STATE,
}