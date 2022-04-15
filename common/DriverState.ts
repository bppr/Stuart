import { CarColors, HexColor } from "./util";

export type CarSessionFlag = "Servicible" | "Black" | "Repair" | "Checkered";

export type DriverState = {
    teamName: string,
    teamIncidentCount: number,
    car: {
        number: string,
        className: string,
        classColor: HexColor,
        carColors: CarColors,
        idx: number,
    }
    flags: CarSessionFlag[],
    lap: number,
    position: number,
    classPosition: number,
};