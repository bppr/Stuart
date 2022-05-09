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
import { AppState, toDriverCar } from "../../appState";
import { DriverState } from "../../../common/DriverState";

const getDriverState: View<AppState, DriverState[]> = (state) => {
    return state.cars.filter(car => !car.isPaceCar)
        .map(car => {
            const ds: DriverState = {
                car: toDriverCar(car),
                classPosition: car.officialClassPosition,
                flags: car.flags,
                lap: car.lap,
                position: car.officialPosition,
                teamIncidentCount: car.teamIncidentCount,
            }

            return ds;
        });
}

export default getDriverState;