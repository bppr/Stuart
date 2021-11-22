var _ = require('lodash');

let sessionState = {
  timestamp: 0,
  drivers: [],
};

let telemetryState = {
  sessionNum: 0,
  sessionTime: 0,
  lapPcts: [],
};

const nullDriver = {
  incidents: 0,
}

function handleSessionUpdate(outbox) {
  return function(info) {
    const { timestamp, data } = info;

    const drivers = data.DriverInfo.Drivers.map(driver => {
      return {
        index: driver.CarIdx,
        team: driver.TeamName,
        driver: driver.UserName,
        carNumber: driver.CarNumber,
        incidents: driver.TeamIncidentCount
      }
    });

    const prevDrivers = _.groupBy(sessionState.drivers, 'carNumber')

    const driversWithNewIncidents = drivers.filter(({ carNumber, incidents }) => {
      return incidents > (prevDrivers[carNumber] || nullDriver).incidents
    });

    driversWithNewIncidents.forEach(driver => outbox.send('incident', { 
      timestamp,
      driver,
      sessionNum: telemetryState.sessionNum,
      sessionTime: telemetryState.sessionTime,
      lapPct: telemetryState.lapPcts[driver.index]
    }));
    
    sessionState = { drivers, timestamp };
  }
}

function handleTelemetryUpdate(outbox) {
  return function(telemetry) {
    const newState = {
      sessionNum: telemetry.values.SessionNum,
      sessionTime: telemetry.values.SessionTime,
      lapPcts: telemetry.values.CarIdxLapDistPct
    };

    telemetryState = newState;
  }
}

module.exports = {
  handleSessionUpdate,
  handleTelemetryUpdate
};