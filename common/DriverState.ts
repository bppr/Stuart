import { CarColors, HexColor } from "./util";

export type CarSessionFlag = "Servicible" | "Black" | "Repair" | "Checkered" | "Disqualify";

/**
 * Information about a driver and car that changes only rarely
 */
export type DriverCar = {
    teamName: string;
    driverName: string;
    class: {
        color: HexColor,
        name: string,
    },
    color: CarColors,
    idx: number,
    number: string,
}

export type DriverState = {
    teamIncidentCount: number,
    car: DriverCar,
    flags: CarSessionFlag[],
    lap: number,
    position: number,
    classPosition: number,
};