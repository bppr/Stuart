
import { ClockState } from "../common/ClockState"
import { Incident } from "../common/incident"

const TEST_INCIDENTS: Incident[] = [
  {
    lap: 3,
    time: {num:1, time:10.0},
    trackPositionPct: 0.5,
    car: {
      class: {
        color: "#2020FF",
        name: "Car!",
      }, 
      color: {
        primary: "#FF0000",
        secondary: "#00FF00",
        tertiary: "#0000FF",
      },
      driverName: "Zach C Miller",
      idx: 1,
      number: "49",
      teamName: "Zach C Miller",
    },
    type: "Incident Count",
    description: "1x",
  }, {
    lap: 4,
    time: {num:1, time:15.0},
    trackPositionPct: 0.53,
    car: {
      class: {
        color: "#2020FF",
        name: "Car!",
      }, 
      color: {
        primary: "#FF0000",
        secondary: "#00FF00",
        tertiary: "#0000FF",
      },
      driverName: "Zach C Miller",
      idx: 1,
      number: "49",
      teamName: "Zach C Miller",
    },
    type: "Incident Count",
    description: "2x",
  }, {
    lap: 4,
    time: {num:1, time:20.0},
    trackPositionPct: 0.12,
    car: {
      class: {
        color: "#2020FF",
        name: "Car!",
      }, 
      color: {
        primary: "#FF0000",
        secondary: "#00FF00",
        tertiary: "#0000FF",
      },
      driverName: "Brian Pratt2",
      idx: 1,
      number: "21",
      teamName: "Brian Pratt2",
    },
    type: "Incident Count",
    description: "4x",
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
  TEST_CLOCK_STATE,
}