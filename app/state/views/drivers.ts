/**
 * The "Drivers" view represents information about all the cars and drivers in the race, and includes information that updates infrequently, including:
 * 
 * Cars: (essentially, "teams")
 * - idx
 * - number
 * - class
 * - class color
 * - car model
 * - team name
 * - current driver ID (iracing customer ID)
 * - team incident count
 * - drivers
 *   - name
 *   - customer id
 *   - irating
 *   - license level and color
 *   - personal incident count 
 */

import { View } from "../streams";
import { AppState } from "../../appState";
import { CarSessionFlag, DriverState } from "../../../common/DriverState";

const getDriverState: View<AppState, DriverState[]> = (state) => {
    return state.cars.filter(car => !car.isPaceCar)
        .map(car => {
            return {
                car: {
                    carColors: car.carColors,
                    classColor: car.classColor,
                    className: car.className,
                    idx: car.idx,
                    number: car.number,
                },
                lap: car.lap,
                classPosition: car.officialClassPosition,
                position: car.officialPosition,
                teamIncidentCount: car.teamIncidentCount,
                teamName: car.teamName,
                flags: car.flags as CarSessionFlag[]
            };
        })
}

export default getDriverState;