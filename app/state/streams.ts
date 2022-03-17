/**
 * State-rxjs is an RsJS based way to monitor session and telemetry data from iRacing (irsdk)
 * 
 * It supports two types of ways to interpret the state, Watchers and Views.
 */


import iracing from 'node-irsdk-2021';
import { combineLatest, distinctUntilChanged, merge, fromEvent, map, mergeMap, Observable, of, pairwise, pluck, ReplaySubject, scan, Subject } from 'rxjs';
import { AppState, CarState, Session, SessionType } from '../state';
import equal from 'deep-equal';

/**
 * A Watcher is a function that compares two versions of the input state (before and after) and returns a 
 * list of Events that should be emitted based on what has changed. For example, a Watcher that is watching the AppState 
 * might look at the number of incident points each driver has and create an Incident event for each driver 
 * whose incident point count increased.
 */
export type Watcher<Input, Event> = (oldInput: Input, newInput: Input) => Event[];

/**
 * A StatefulWatcher is a Watcher that takes in two versions of the state as well as an instance of 
 * its own state, and returns a list of events to emit and a new state for itself. The new state will 
 * be passed to the stateful watcher the next time a main state change comes in.
 */
export type StatefulWatcher<Input, State, Event> = (oldInput: Input, newInput: Input, state?: State) => [Event[], State?];

/**
 * Converts a non-stateful Watcher into a stateful one.
 */
function toStateful<State, Event>(watcher: Watcher<State, Event>) :StatefulWatcher<State, any, Event> {
    return (os, ns, s) => [watcher(os, ns), s];
}

/**
 * A View is a function that observes the state and constructs a specific view of some relevant fields.
 */
export type View<State, V> = (state: State) => V;

function getTrackLength(sesh: iracing.SessionData): number {
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

/**
 * Generates a new AppState based on the latest session and telemetry data
 */
function toAppState(session: iracing.SessionData, telemetry: iracing.TelemetryData): AppState {
    let cars: CarState[] = session.data.DriverInfo.Drivers.map(driver => {
        let index = driver.CarIdx;
        let car: CarState = {
            index,
            driverName: driver.UserName,
            currentLap: telemetry.values.CarIdxLap[index],
            currentLapPct: telemetry.values.CarIdxLapDistPct[index],
            incidentCount: driver.TeamIncidentCount,
            number: driver.CarNumber,
            onPitRoad: false, // TODO
            paceLine: telemetry.values.CarIdxPaceLine[index],
            paceRow: telemetry.values.CarIdxPaceRow[index],
            trackSurface: telemetry.values.CarIdxTrackSurface[index],
            teamName: driver.TeamName
        };
        return car;
    });

    let sessions: Session[] = session.data.SessionInfo.Sessions.map(session => {
        let sesh: Session =
         {
            type: SessionType.Unknown, // TODO fix this
        }

        return sesh;
    });

    let appState: AppState = {
        camCarIdx: telemetry.values.CamCarIdx,
        camPaused: telemetry.values.ReplayPlaySpeed == 0,
        cars,
        findCar: (carNum: string) => {
            return cars.find(c=> c.number === carNum);
        },
        replaySessionNum: telemetry.values.ReplaySessionNum,
        replaySessionTime: telemetry.values.ReplaySessionTime,
        sessionNum: telemetry.values.SessionNum,
        sessionTime: telemetry.values.SessionTime,
        sessionType: SessionType.Unknown, // TODO
        sessions,
        trackLength: getTrackLength(session),
        trackLengthDisplay: session.data.WeekendInfo.TrackLength,
    };

    return appState;
}

export class IRSDKObserver {
    private appState: Subject<AppState>;

    constructor(irsdk: iracing.SDKInstance) {
        let telemetrySource = new Observable<iracing.TelemetryData>(o => irsdk.on("Telemetry", (data: iracing.TelemetryData) => o.next(data)));
        let sessionSource = new Observable<iracing.SessionData>(o => irsdk.on("SessionInfo", (data: iracing.SessionData) => o.next(data)));

        let combinedSource = combineLatest([telemetrySource, sessionSource]);
        let appStateSource = combinedSource.pipe(map(([telem, sesh]) => toAppState(sesh, telem)));

        // TODO: The state views should use a subject that only keeps track of the last appstate. That way, any additional connections will only get the latest update event
        // But the incident feed should probably be saved entirely and replayed with all the detectors when a new window is opened.
        this.appState = new ReplaySubject(1);
        appStateSource.subscribe(this.appState);
    }

    /**
     * Creates a new event feed pipeline using the given watchers.
     * 
     * Changes to the app state will be published to each watcher, and any events produced will be observed from the returned Observable.
     * 
     * TODO: there's probably a better way to combine "watchers" and "stateful watchers" into a single parameter.
     * @param watchers 
     * @param statefulWatchers 
     */
    public createEventFeed<E>(watchers: Watcher<AppState, E>[] = [], statefulWatchers: StatefulWatcher<AppState, any, E>[] = []): Observable<E> {
        // 1) create a pairwise view of the appState
        
        // convert all watchers into stateful watchers (because it's easier)
        const asStatefulWatchers = watchers.map(toStateful);
        let allWatchers = [...asStatefulWatchers, ...statefulWatchers];

        // create a pairwise view of the state to have before/after
        let pairs = this.appState.pipe(
            pairwise()
        );

        // convert all watchers to observables based on the pairwiser pipe
        let allWatchersAsObservables = allWatchers.map((watcher) => {
            // Use a "reducer" like mechanism here to give watchers state, where "watchers" are reducers
            // Each watcher gets its current state and the new inputs, and returns a new state and some events
            // FOr the purposes of "scan", the "accumulator" is going to be "state + events", although the events will be ignored by the "reducers"
            
            // Input is a pair of old state and new state
            type ValType = [AppState, AppState];

            // Accumulator is the list of events and the 
            type AccType = ReturnType<typeof watcher>;
            let reducer = (acc: AccType, value: ValType, index: number) => {
                const oldInput = value[0];
                const newInput = value[1];
                const oldState = acc[1];

                return watcher(oldInput, newInput, oldState);
            }
            
            let obserableSingleEvents = pairs.pipe(
                // apply reducer function
                scan<ValType, AccType>(reducer, [[], undefined]),
                // extract only the events and merge to a single stream
                mergeMap((acc) => of(...acc[0]))
            )

            return obserableSingleEvents;
        });

        return merge(...allWatchersAsObservables);
    }

    /**
     * Creates an Observable that publishes an updated view of the state if the returned view ever changes.
     * @param view 
     */
    public createViewFeed<V>(view: View<AppState, V>): Observable<V> {
        return this.appState.pipe(
            map((v,i)=> view(v)),
            distinctUntilChanged((v1, v2) => equal(v1, v2))
            );
    }
}