/**
 * the pacing view contains information about the current pace state including:
 * - the current grid order
 * - the cars currently in the pits
 * - TODO the number of pace laps left 
 * - one lap to green
 */

import { View } from "../streams";
import { AppState } from "../../appState";
import { PaceState, PaceSpot, PaceCarInfo } from "../../../common/PaceState";

const getPaceState: View<AppState, PaceState> = (state) => {

    const grid: PaceSpot[] = [];
    const pits: PaceCarInfo[] = [];

    for(const car of state.cars) {
        if(car.isPaceCar) { continue; }
        
        const pCar: PaceCarInfo = {
            carNumber: car.number,
            driverName: car.teamName,
            idx: car.idx,
            officialPosition: car.officialPosition,
        };

        if(car.paceRow != -1) {
            grid.push({
                car: pCar,
                line: car.paceLine,
                row: car.paceRow,
            });
        } else {
            pits.push(pCar);
        }
    }

    grid.sort((c1, c2) => {
        if(c1.row == c2.row) {
            return c1.line - c2.line;
        } else {
            return c1.row - c2.row;
        }
    });

    pits.sort((c1, c2) => {
        return c1.officialPosition - c2.officialPosition;
    });

    return {
        grid,
        pits,
        oneToGo: state.sessionFlags.includes("OneLapToGreen"),
    }
}

export default getPaceState;