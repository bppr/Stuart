/**
 * Not actually information about the pace car. Information about a car that is specific to its pace position
 */
import { DriverCar } from "./DriverState";

export type PaceCarInfo =  DriverCar & {
    officialPosition: number; 
};

export type PaceSpot = {
    car: PaceCarInfo;
    // which lane the car is in, 0 for the inside-most lane.
    line: number;
    // the row the car is in, 0 for the front row
    row: number;
};

export type PaceState = {
    // True if there is only one lap left to go before the race restarts. Pace order should not be edited when this is true
    oneToGo: boolean;
    /**
     * The current order of the grid, sorted by "position", (alternating inside/outside lane, then by row)
     */
    grid: PaceSpot[];
    /**
     * Cars that are currently in the pits (or otherwise not on track), Ordered by official position.
     */
    pits: PaceCarInfo[];
};
