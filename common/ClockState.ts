export type SessionTime = {
    // The session number of the overall event
    num: number,
    // The number of seconds since the session began
    time: number,
}

export type ClockState = {
    /**
     * The current time in the sim. Note that when watching a saved replay, live time == replay time.
     */
    live: SessionTime;
    /**
     * The current time that the replay camera is observing
     */
    replay: SessionTime;
    /**
     * The car currently being observed
     */
    // NB: not using CarState here because we don't want this view to update on every lapPositionPct change.
    // most views will probably need to do this.
    camCar: {
        index: number;
        number: string;
        driverName: string;
    };
    /**
     * The playback speed of the camera. 1 for normal speed, 0 for paused, fractional values for slow-mo, 2+ for fast forward, negative for rewind, etc.
     */
    camSpeed: number;
};
