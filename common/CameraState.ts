import { DriverCar } from "./DriverState"

export type CameraState = {
    current: {
        carIdx: number,
        cameraNum: number,
        cameraGroupNum: number,
        speed: number,
    }
    cars: DriverCar[],
    cameraGroups: {
        num: number,
        name: string,
        cameras: {
            num: number,
            name: string,
        }[]
    }[]
    sessions: {
        num: number,
        name: string,
        type: string,
        lapLimit: number,
        timeLimt: number,
    }[]
}