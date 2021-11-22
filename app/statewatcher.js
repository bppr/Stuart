var _ = require('lodash');

// An object containing all the properties of a driver that we might care about, retrieved from either the session info or telemetry info
function Driver(carIdx) {

	this.carIdx = carIdx;
    
	// Copied from session or telemetry info updates ("global" properties, copied here to be easier to pass around with the "Driver" object")
    this.timestamp = null; // the real world time this info was last updated
    this.sessionNumber = -1;
    this.sessionTime = -1; // the session time this driver info was last updated
	this.sessionTick = -1;
	
	// i miss type safety

	// Properties copied from session info
    this.incidentCount = -1;
    this.carNumber = -1;
    this.driverName = null;
    this.teamName = null;
	
	// Properties copied from telemetry info
    this.trackPositionPct = null;
    this.lapsCompleted = null;
    this.trackSurface = null; // on track, in pits, etc. Not surface material
	this.onPitRoad = null;
}

// Returns the *total* race distance completed, in fractional laps
Driver.prototype.getRaceDistance = function () {
    return (this.trackPositionPct || 0) + (this.lapsCompleted || 0);
}

// Updates the session-based properties of this driver, where sessionInfo is the root object
Driver.prototype.updateSessionInfo = function (sessionInfo) {
    for (var i in sessionInfo.DriverInfo.Drivers) {
        var driver = sessionInfo.DriverInfo.Drivers[i];

        this.updateDriverInfo(driver);
    }
}

// Updates the session-based properties of this driver, where driverInfo is the specific object for this driver.
Driver.prototype.updateDriverInfo = function (driverInfo) {
    if (this.carIdx != driverInfo.CarIdx) {
        return;
    }

    this.driverName = driverInfo.UserName;
    this.teamName = driverInfo.TeamName;
    this.carNumber = driverInfo.CarNumber;
    this.incidentCount = driverInfo.CurDriverIncidentCount;
}

// Updates the telemetry-based properties of this driver
Driver.prototype.updateTelemetryInfo = function (telemetryInfo) {
    this.trackPositionPct = telemetryInfo.CarIdxLapDistPct[this.carIdx];
    this.lapsCompleted = telemetryInfo.CarIdxLapCompleted[this.carIdx];
    this.trackSurface = telemetryInfo.CarIdxTrackSurface[this.carIdx];
	this.sessionTime = telemetryInfo.SessionTime;
	this.sessionNumber = telemetryInfo.SessionNum;
	this.onPitRoad = telemetryInfo.CarIdxOnPitRoad[this.carIdx];
}

function State() {
    // List of Drivers by CarIDx
    this.drivers = {};
	
	this.timestamp = null; // the real world time this info was last updated
    this.sessionNumber = -1;
    this.sessionTime = -1; // the session time this driver info was last updated
	this.sessionTick = -1;
}

// Updates the state with properties retrieved from session
State.prototype.updateSessionInfo = function (session) {
	
	// console.log("updateSessionInfo: " + JSON.stringify(session," "));
	
    var timestamp = session.timestamp;
    var sessionInfo = session.data;
	
	this.timestamp = timestamp;
	
    for (var i in sessionInfo.DriverInfo.Drivers) {
        var driverInfo = sessionInfo.DriverInfo.Drivers[i];
		
		var carIdx = driverInfo.CarIdx;
        var driver = this.drivers[carIdx] || new Driver(carIdx);
        driver.updateDriverInfo(driverInfo);
        driver.timestamp = timestamp;

        this.drivers[carIdx] = driver;
    }
};

// Updates the fields of this State with new telemetry info
State.prototype.updateTelemetryInfo = function (telemetry) {
	//console.log("updateTelemetryInfo: " + JSON.stringify(telemetry," "));
	
    var timestamp = telemetry.timestamp;
    var telemetryInfo = telemetry.values;

	this.timestamp = timestamp;
	this.sessionTime = telemetryInfo.SessionTime;
	this.sessionNumber = telemetryInfo.SessionNum;
	this.sessionTick = telemetryInfo.SessionTick;
	
	// update all known drivers, creating new ones if this is the first time we've seen them
    for (var carIdx in telemetryInfo.CarIdxPosition) {
        // attempt to remove invalid cars
        if (telemetryInfo.CarIdxLap[carIdx] < 0) {
           // TODO this.drivers[carIdx] = null;
        } else {
            var driver = this.drivers[carIdx];
            if (driver == null) {
                driver = new Driver(carIdx);
                this.drivers[carIdx] = driver;
            }
            driver.updateTelemetryInfo(telemetryInfo);
			
			driver.timestamp = this.timestamp;
			driver.sessionTime = this.sessionTime;
			driver.sessionNumber = this.sessionNumber;
			driver.sessionTick = this.sessionTick;
        }
    }
}

// Creates a new StateWatcher that publishes events and incidents to the given outbox
function StateWatcher(outbox) {
    this.oldState = null;
    this.newState = null;

    // An array of callback functions with the method signature: 
	// function(Driver old, Driver new, float sessionTime)
	// that will be called when driver info is updated
	//
	// This is where we add new "plugins" for listening to event changes
    this.driverListeners = [
        new NewIncidentsListener(outbox),
		// new SectorTimeListener(12),
		lapCountListener,
		new PitStopTimer(),
		new PitLaneTimer(),
		new OffTrackDetector(2)
		//LogDriverChangesDebug
    ];

    // session listeners?

    // irsdk event handlers, for unbinding;
    this.irsdk = null;
	var that = this;
	this.irsdkSessionUpdateCB = function(sessionInfo) {
		that.handleStateUpdate(sessionInfo, null);
	}	
	this.irsdkTelemetryUpdateCB = function(telemetryInfo) {
		that.handleStateUpdate(null, telemetryInfo);
	}
}

// Updates the state from new telemetry or session info, informs all driver listeners of the new data.
// should be private really
StateWatcher.prototype.handleStateUpdate = function(sessionInfo, telemetryInfo) {
	if (this.newState == null) {
		this.newState = new State();
	} else {
		this.oldState = this.newState;
		this.newState = _.cloneDeep(this.oldState || {});
	}
	 // TODO this seems to only be called once
	//console.log(".");
	
	if(sessionInfo != null) {
		this.newState.updateSessionInfo(sessionInfo);
	}
	if(telemetryInfo != null) {
		this.newState.updateTelemetryInfo(telemetryInfo);
	}

	var oldDrivers = (this.oldState || {}).drivers || {};
	var newDrivers = this.newState.drivers;

	//console.log(JSON.stringify(this.newState, null," "));

	var uniqueIDx = new Set();
	Object.keys(oldDrivers).forEach(uniqueIDx.add, uniqueIDx);
	Object.keys(newDrivers).forEach(uniqueIDx.add, uniqueIDx);
	uniqueIDx.forEach((carIdx) => {
		var oldDriver = oldDrivers[carIdx];
		var newDriver = newDrivers[carIdx];
	
		for (var i in this.driverListeners) {
			this.driverListeners[i](oldDriver, newDriver, this.newState.sessionTime);
		}
	});
};

// Attaches this StateWatcher to an IRSDK instance. Only one IRSDK instance can be bound at a time;
StateWatcher.prototype.bindToIRSDK = function (irsdk) {
    this.unbind();

    this.irsdk = irsdk;
    this.irsdk.on('SessionInfo', this.irsdkSessionUpdateCB);
    this.irsdk.on('Telemetry', this.irsdkTelemetryUpdateCB);
}

// Detaches from the irSDK instance by unregistering the listeners
StateWatcher.prototype.unbind = function () {
    if (this.irsdk != null) {
        this.irsdk.removeListener('SessionInfo', this.irsdkSessionUpdateCB);
        this.irsdk.removeListener('Telemetry', this.irsdkTelemetryUpdateCB);
        this.irsdk = null;
    }
}

// Car change listeners

// Abstract/utility listeners

// CarTimer is the base class for a change listener that times an event from start to finish. Its two parameters are functions in the form of change listeners (oldCar, newCar), and return true if their change has occurred.
// Once the two events have occurred, the timeFunction is called with the car data and number of seconds elapsed between the two events
// if restart is true, every time the startFunction returns true, the timer will be restarted, Otherwise, the stop function must be called to restart the timer.
function CarTimer(startFunction, stopFunction, timeFunction, restart = false) {
	var startTimesByCarIdx = {};
	
	if(startFunction == null) throw "startFunction may not be null";
	if(stopFunction == null) throw "stopFunction may not be null";
	if(timeFunction == null) throw "timeFunction may not be null";
	
	return function(oldCar, newCar, sessionTime) {
		var carIdx = (newCar || oldCar).carIdx;
		var startTime = startTimesByCarIdx[carIdx];
		if(startTime == null || restart) {
			// check start function
			if(startFunction(oldCar, newCar)) {
				startTime = sessionTime;
				startTimesByCarIdx[carIdx] = startTime;
			}
		}
		
		if(startTime != null && stopFunction(oldCar, newCar)) {
			var duration = sessionTime - startTime;
			startTimesByCarIdx[carIdx] = null;
			timeFunction(duration, newCar || oldCar);
		}
		
	};
}

// An event listener that keeps track of the given state function, and triggers the callback method if the statefunction returns true for a car for more than the given number of seconds.
// - stateFunction: a function that accepts a Driver and returns true when the desired state is present
// - timeLimitSeconds: the number of seconds that the state function must return true before the callback is called
// - callback: a callback method that accepts a Driver and is called when the time limit is exceeded
// - endCallback (nullable): a callback method that accepts a float and a Driver, an is called when the state method stops returning true. This callback is not executed if the time limit wasn't exceeded.
function CarCountdownTimer(stateFunction, timeLimitSeconds, callback, endCallback) {
    var startTimesByCarIdx = {};
    var cbTriggeredByCarIdx = {};

    if (stateFunction == null)
        throw "stateFunction may not be null";
    if (callback == null)
        throw "stopFunction may not be null";

    return function (oldCar, newCar, sessionTime) {
        if (oldCar == null && newCar == null)
            throw "oldCar and newCar cannot both be null";

        var carIdx = (newCar || oldCar).carIdx;
        var startTime = startTimesByCarIdx[carIdx];

        var newState = false;
        if (newCar != null)
            newState = stateFunction(newCar);

        if (newState) {
            if (startTime == null) {
                startTime = sessionTime;
                startTimesByCarIdx[carIdx] = sessionTime;
                cbTriggeredByCarIdx[carIdx] = false;
            }
			
			var duration = sessionTime - startTime;
			
			// may need to do somethig here when session changes.
			
			if (duration >= timeLimitSeconds && !(cbTriggeredByCarIdx[carIdx])) {
                cbTriggeredByCarIdx[carIdx] = true;
                callback(newCar || oldCar);
            }
        } else  {
			if(startTime != null) {
				if(cbTriggeredByCarIdx[carIdx]) {
					var duration = sessionTime - startTime;
					if (endCallback != null) {
						endCallback(duration, newCar || oldCar);
					}
				}
				startTimesByCarIdx[carIdx] = null;
			}
		}
    };
}

// Similar to "CarTimer", but times for however long the stateFunction returns true
function CarStateTimer(stateFunction, timeFunction) {

    if (stateFunction == null)
        throw "stateFunction may not be null";
    if (timeFunction == null)
        throw "timeFunction may not be null";

    var risingEdge = function (oldCar, newCar) {
        return (oldCar == null && newCar != null && stateFunction(newCar)) ||
        (oldCar != null && !stateFunction(oldCar) && newCar != null && stateFunction(newCar));
    };

    var fallingEdge = function (oldCar, newCar) {
        return (newCar == null && oldCar != null && stateFunction(oldCar)) ||
        (oldCar != null && stateFunction(oldCar) && newCar != null && !stateFunction(newCar));
    };

    return new CarTimer(risingEdge, fallingEdge, timeFunction, false);
}

// A car listener that listens for changes to a value returned from a getter method, and calls the callback function with the new value if it changes
function CarPropertyChangeListener(propertyGetter, callback) {
    if (propertyGetter == null)
        throw "propertyGetter may not be null";
    if (callback == null)
        throw "callback may not be null";

    return function (oldCar, newCar) {
        var oldValue = null;
        if (oldCar != null)
            oldValue = propertyGetter(oldCar);

        var newValue = null;
        if (newCar != null)
            newValue = propertyGetter(newCar);

        if (!(oldValue == newValue)) {
			//console.log("PC: old:" + oldValue + " new:" + newValue);
            callback(newValue, newCar, oldValue, oldCar);
        }
    }
}

// Concrete, useful listeners

// A car listener that logs whenever a car has been off track for more than the given number of seconds. Also logs when the car comes back on the track.
function OffTrackDetector(minSeconds) {

    var isOffTrack = function (car) {
		var ot = car.trackSurface == "OffTrack";
        return ot;
    }

    return new CarCountdownTimer(isOffTrack, minSeconds,
        (car) => {
        console.log("OT: " + car.driverName + " has gone off track.");
    },
        (time, car) => {
        console.log("OT: " + car.driverName + " was off track for " + time.toFixed(2) + " seconds.");
    });
}

function PitStopTimer() {
    var isInPitBox = function (car) {
        return car.trackSurface == "InPitStall";
    };

    return new CarStateTimer(isInPitBox, (time, car) => {
        console.log("PT: " + car.driverName + " spent " + time + " seconds in the pit box.");
    });
}

function PitLaneTimer() {
    var isInPitLane = function (car) {
        return car.onPitRoad;
    }

    return new CarStateTimer(isInPitLane, (time, car) => {
        console.log("PT: " + car.driverName + " spent " + time + " seconds in pit lane.");
    });
}

// listeners can also be bare methods
function lapCountListener(oldCar, newCar) {
    if (oldCar != null && newCar != null) {
        if (oldCar.lapsCompleted != newCar.lapsCompleted) {
            console.log("LC: " + newCar.driverName + " finished lap " + newCar.lapsCompleted + ".");
        }
    }
}

// A car listener that logs to the the time spent in each sector when a car leaves a sector. Track sectors are evenly spaced.
function SectorTimeListener(numSectors) {

    if (numSectors < 1)
        numSectors = 1;

    var sectorListeners = [];
    var sectorSize = 1 / numSectors;
    var sectorNumber = 1;
    for (var sector = 0.0; sector < 1.0; sector += sectorSize) {
        var carIsInSector = (car) => {
            return car.trackPositionPct >= sector && car.trackPositionPct < (sector + sectorSize);
        };

        sectorListeners.push(new CarStateTimer(carIsInSector, (time, car) => {
                console.log("ST: " + car.driverName + " finished sector " + sectorNumber + " in " + time.toFixed(2) + " seconds.");
            }));
        sectorNumber++;
    }

    return function (oldCar, newCar, sessionTime) {
        for (var i in sectorListeners) {
            sectorListeners[i](oldCar, newCar, sessionTime);
        }
    };
}

// A car watcher that just logs everything.
function LogDriverChangesDebug(oldCar, newCar) {
    console.log("Old: " + JSON.stringify(oldCar));
    console.log("New: " + JSON.stringify(newCar));
}

// A driver listener that checks to see if a driver's incident count has increased.
function NewIncidentsListener(outbox) {
    var getIncidents = function (car) {
        return car.incidentCount;
    };

    return new CarPropertyChangeListener(getIncidents, (incidents, car, oldIncidents) => {
        if (oldIncidents < incidents) {
            console.log("IN: " + car.driverName + " now has " + incidents + " incident points.");

            /*
            outbox.send('incident', {
            incidentCount: incidents,
            timestamp: car.timestamp,
            driver: car.driverName,
            sessionNum: car.sessionNum,
            sessionTime: car.sessionTime,
            lapPct: car.trackPositionPct
            });
             */
        }
    });
}

module.exports = StateWatcher;