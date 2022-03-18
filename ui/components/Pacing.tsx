import { Card, CardHeader, Stack, Typography, Avatar, IconButton, ButtonGroup, Table, TableBody, TableCell, TableRow, Paper, TableContainer, TableHead, Button, Grid, CircularProgress, Box } from '@mui/material'
import EndOfLine from '@mui/icons-material/VerticalAlignBottom';
import WaveAround from '@mui/icons-material/UTurnLeft';
import MoveUp from '@mui/icons-material/KeyboardArrowUp';
import MoveDown from '@mui/icons-material/KeyboardArrowDown';
import React, { useState } from 'react'
import { PaceCarInfo, PaceState } from "../../common/PaceState";

let TEST_PACE_ORDER: PaceState = {
    oneToGo: false,
    grid: [
        {
            car: {
                idx: 1,
                driverName: "Joey Logano",
                carNumber: "68",
                officialPosition: 1,
            },
            line: 0,
            row: 0
        }, {
            car: {
                idx: 2,
                driverName: "Suzie Queue",
                carNumber: "9",
                officialPosition: 2,
            },
            line: 1,
            row: 0,
        }, {
            car: {
                idx: 3,
                driverName: "Mike Racecar",
                carNumber: "18",
                officialPosition: 4,
            },
            line: 0,
            row: 1,
        }, {
            car: {
                idx: 4,
                driverName: "Someone Else",
                carNumber: "000",
                officialPosition: 3,
            },
            line: 1,
            row: 2
        }
    ],
    pits: [{
        idx: 5,
        driverName: "Mister Lazy",
        carNumber: "12",
        officialPosition: 5,
    }]
}

function GridCarElement(props: {
    car: PaceCarInfo
}) {
    function handleWaveBy(ev: any) {
        sendIRCommands([`!waveby ${props.car.carNumber}`]);
    }
    function handleEOL(ev: any) {
        sendIRCommands([`!eol ${props.car.carNumber}`]);
    }


    return <Card>
        <CardHeader
            avatar={
                <Avatar>P{props.car.officialPosition}</Avatar>
            }
            title={"#" + props.car.carNumber + " " + props.car.driverName}
            action={<ButtonGroup>
                <IconButton onClick={handleEOL} >
                    <EndOfLine />
                </IconButton>
                <IconButton onClick={handleWaveBy} >
                    <WaveAround />
                </IconButton>
            </ButtonGroup>} />
    </Card>
}

function PitCarElement(props: {
    car: PaceCarInfo
}) {
    return <Card>
        <CardHeader
            avatar={
                <Avatar>P{props.car.officialPosition}</Avatar>
            }
            title={"#" + props.car.carNumber + " " + props.car.driverName} />
    </Card>
}

/**
 * GridStack is a component that displays the cars currently in grid, as well as 
 * those in the pits. Cars in grid may be immediately issued "end of line" or 
 * "wave around" commands, but those in the pits may not.
 */
function GridStack(props: {
    grid: PaceState
}) {

    // display a grid of cars that are currently on track, then a space, then cars currently in the pits

    // determine the rectangular size of the grid
    let maxLane = 0;
    let maxRow = 0;
    for (let gridSpot of props.grid.grid) {
        maxLane = Math.max(gridSpot.line);
        maxRow = Math.max(gridSpot.row);
    }
    const lines = maxLane + 1;
    const rows = maxRow + 1;

    // create a sparse array filled with the known cars
    let gridSpots = [];
    for (let row = 0; row < rows; ++row) {
        gridSpots.push((new Array(lines).fill(null)));
    }

    // sparse arrays
    for (let gridSpot of props.grid.grid) {
        gridSpots[gridSpot.row][gridSpot.line] = gridSpot.car;
    }

    let gridTable = <Table>
        <TableBody>
            {
                // each element of gridSpots is a row
                gridSpots.map((gridRow, rowIndex) => {
                    // each row should be a horizontal stack of the elements in the lane
                    return <TableRow key={"grid-row-" + rowIndex}>
                        {
                            gridRow.map((car, lineIndex) => {
                                const spotKey = "grid-spot-" + rowIndex + "-" + lineIndex;
                                return <TableCell key={spotKey}>{
                                    car != null &&
                                    <GridCarElement car={car} />
                                }
                                </TableCell>

                            })
                        }
                    </TableRow>
                })
            }
        </TableBody>
    </Table>

    let pitStack = <Stack>
        {
            props.grid.pits.map((car, pitRowIndex) => {
                return <PitCarElement car={car} key={"pit-row-" + pitRowIndex} />
            })
        }
    </Stack>

    return <Stack>
        <Typography>Current Order</Typography>
        {gridTable}
        <Typography>Cars in Pits</Typography>
        {pitStack}
    </Stack>
}

type GridCommand = {
    // The type of commands to issue
    // end_of_line: move the given cars back to the end the line in order
    // wave_around: issue wave-bys to the cars in order
    // set_order_to: is just an "end_of_line" command that is guaranteed to contain all of the cars.
    // this could be done more intelligently. but who cares.
    type: "set_order_to" | "wave_around" | "end_of_line",
    // The car numbers to issue the command to, in order
    carNumbers: string[],
}

type DesiredPaceOrderSpot = {
    // the car in this spot
    car: PaceCarInfo,
    // the number of extra laps this car will get because of wave-arounds
    additionalLaps: number,
}

type DesiredPaceOrder = {
    // The target order of the cars
    cars: DesiredPaceOrderSpot[],
    // The commands necessary to issue in order to achieve the desired order
    commands: GridCommand[],
}

const INITIAL_DESIRED_PACE_ORDER: DesiredPaceOrder | null = null;

/**
 * Calculates the initial desired pace order from the current order
 */
function createDesiredPaceOrder(pace: PaceState): DesiredPaceOrder {
    // start with the cars actually in grid

    // no need to sort, cars are guaranteed to be in the appropriate order
    // order is determined by app/state/views/pacing.ts
    let grid = [...pace.grid];
    let pits = [...pace.pits];

    let cars = [
        ...(grid.map((gs) => gs.car)),
        ...pits
    ];

    return {
        cars: cars.map((car) => {
            return {
                car,
                additionalLaps: 0,
            }
        }),
        commands: [
            {
                type: "set_order_to",
                carNumbers: cars.map(c => c.carNumber),
            }
        ]
    };
}

function moveCarUp(paceOrder: DesiredPaceOrder, carId: number): DesiredPaceOrder {
    let newOrder: DesiredPaceOrderSpot[] = [...paceOrder.cars];

    // find the car to change
    let targetCarIndex = newOrder.findIndex((car) => car.car.idx == carId);

    // -1 if not found, can't move car 0 up anyway
    if (targetCarIndex > 0) {
        const t = newOrder[targetCarIndex];
        newOrder[targetCarIndex] = newOrder[targetCarIndex - 1];
        newOrder[targetCarIndex - 1] = t;

        // update the previous command with either the new order, or by adding an additional command
        let newCommands = [...paceOrder.commands];
        let lastCommand = newCommands[newCommands.length - 1];

        let newCommand: GridCommand = {
            type: "set_order_to",
            carNumbers: newOrder.map(car => car.car.carNumber),
        }

        if (lastCommand.type === "set_order_to") {
            // replace the previous end of line command with this new one
            newCommands.pop();
        }

        newCommands.push(newCommand);

        return {
            cars: newOrder,
            commands: newCommands,
        }
    } else {
        return paceOrder;
    }
}

/**
 * Moves the car identified by the given carIdx down one spot in the pace grid
 * 
 * @param paceOrder the pace order to modify
 * @param carId the index of the car to move down one spot in the pace grid
 * @returns a new DesiredPaceOrder with the resulting order and commands necessary to achieve this order
 */
function moveCarDown(paceOrder: DesiredPaceOrder, carId: number): DesiredPaceOrder {
    // find the target car;
    let targetCarIndex = paceOrder.cars.findIndex(car => car.car.idx === carId);

    if (targetCarIndex === -1 || targetCarIndex === (paceOrder.cars.length - 1)) {
        // can't do anything if it's the last car or if it's not in the grid
        return paceOrder;
    } else {
        // find the car below and move it up
        return moveCarUp(paceOrder, paceOrder.cars[targetCarIndex + 1].car.idx);
    }
}

function moveToEnd(paceOrder: DesiredPaceOrder, carId: number, waveAround: boolean): DesiredPaceOrder {

    // find our car and pull it out
    let targetCar: DesiredPaceOrderSpot | null = null;
    let restOfTheCars: DesiredPaceOrderSpot[] = [];

    for (const car of paceOrder.cars) {
        if (car.car.idx === carId) {
            targetCar = car;
        } else {
            restOfTheCars.push(car);
        }
    }

    if (targetCar === null) {
        return paceOrder;
    } else {
        // pop our car on the end
        restOfTheCars.push({
            car: targetCar.car,
            additionalLaps: targetCar.additionalLaps + (waveAround ? 1 : 0),
        });

        return {
            cars: restOfTheCars,
            commands: [...paceOrder.commands, {
                carNumbers: [targetCar.car.carNumber],
                type: waveAround ? "wave_around" : "end_of_line",
            }],
        };
    }
}

function DesiredPaceOrderTable(props: {
    currentPaceOrder: PaceState,
    desiredOrder: DesiredPaceOrder,
    setDesiredOrder: (_: DesiredPaceOrder) => void,
}) {

    // TODO lots of stuff to do in here, mostly figuring out where the state for desiredOrder should live
    // it needs to be mutable by buttons in each row.
    // maybe add methods to the "grid" array entries in DesiredPaceOrder?

    // Big ol table
    // Columns:
    // - move car up/down buttons
    // - old vs new grid spot
    // - current official position?
    // - eol/wb buttons

    // Rows are colored red if the driver is technically being penalized (new grid order > old grid order and no additional laps)
    // Green if driver is gaining grid spots?

    // figure out old grid positions of cars
    type OldGridPosition = number | "P";
    const gridPositionByIdx: OldGridPosition[] = [];
    props.currentPaceOrder.grid.forEach((spot, index) => {
        gridPositionByIdx[spot.car.idx] = index + 1;
    });
    props.currentPaceOrder.pits.forEach(car => {
        gridPositionByIdx[car.idx] = "P";
    });

    function handleMoveCarUp(idx: number): (ev: any) => void {
        return (ev) => {
            props.setDesiredOrder(moveCarUp(props.desiredOrder, idx));
        }
    }
    function handleMoveCarDown(idx: number): (ev: any) => void {
        return (ev) => {
            props.setDesiredOrder(moveCarDown(props.desiredOrder, idx));
        }
    }
    function handleMoveCarEOL(idx: number): (ev: any) => void {
        return (ev) => {
            props.setDesiredOrder(moveToEnd(props.desiredOrder, idx, false));
        }
    }
    function handleMoveCarWB(idx: number): (ev: any) => void {
        return (ev) => {
            props.setDesiredOrder(moveToEnd(props.desiredOrder, idx, true));
        }
    }

    return <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Move</TableCell> {/* up/down buttons */}
                    <TableCell>Grid</TableCell>
                    <TableCell>Race</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Send to Back</TableCell> {/* left/right buttons */}
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    props.desiredOrder.cars.map((car, index) => {
                        const originalPosition = gridPositionByIdx[car.car.idx];
                        const newPosition = index + 1;

                        const carIsBeingPenalized = originalPosition != "P" && originalPosition > newPosition;

                        // TODO turn red if being penalized?
                        return <TableRow key={"desired-order-car-" + car.car.idx}>
                            <TableCell>
                                <ButtonGroup orientation='vertical'>
                                    <IconButton onClick={handleMoveCarUp(car.car.idx)}>
                                        <MoveUp />
                                    </IconButton>
                                    <IconButton onClick={handleMoveCarDown(car.car.idx)}>
                                        <MoveDown />
                                    </IconButton>
                                </ButtonGroup>
                            </TableCell>
                            <TableCell>
                                {(newPosition != originalPosition)
                                    ? originalPosition + ">" + newPosition
                                    : newPosition}
                            </TableCell>
                            <TableCell>
                                {car.car.officialPosition}
                            </TableCell>
                            <TableCell>
                                {`#${car.car.carNumber} ${car.car.driverName}`}
                            </TableCell>
                            <TableCell>
                                <ButtonGroup>
                                    <IconButton onClick={handleMoveCarEOL(car.car.idx)}>
                                        <EndOfLine />
                                    </IconButton>
                                    <IconButton onClick={handleMoveCarWB(car.car.idx)}>
                                        <WaveAround />
                                    </IconButton>
                                </ButtonGroup>
                            </TableCell>
                        </TableRow>
                    })
                }
            </TableBody>
        </Table>
    </TableContainer>
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendIRCommands(commands: string[]): Promise<boolean> {
    // simulate sending the commands for now
    for (const c of commands) {
        console.log("iR chat command: ", c);
        await sleep(200);
    }
    return true
}

/**
 * Pacing is responsible for displaying the current caution status and pace order, 
 * and for allowing a steward to reorganize the pace line as they see fit 
 * (via end-of-line penalties and wave-arounds)
 * 
 * The current pace order of the cars in-sim will be displayed on the left, and will 
 * show both pace lines as well as cars that are in the pits. From this view, cars 
 * can be issued "end of line" or "wave by" actions immediately.
 * 
 * To edit the pacing order, first the current order must be copied into a "desired" 
 * pace order window on the right. The order is based on the pace lines first, alternating
 * left and right, followed by any cars currently in the pits ordered by "official position".
 * From here, cars can be shifted up and down single spots a a time, may be sent to the back,
 * or may be waved around, with the "desired order" window updating appropriately.
 * 
 * @param props 
 * @returns 
 */
export default function Pacing(props: {}) {
    let [paceOrder, setPaceOrder] = useState(TEST_PACE_ORDER);

    let [desiredPaceOrder, setDesiredPaceOrder] = useState(INITIAL_DESIRED_PACE_ORDER);
    let [executingCommands, setExecutingCommands] = useState(false);

    // left to do:
    // - display desired order stuff on the right
    // - a button to copy the current order to the desired order ("edit")
    // - drag and drop items in the ordering
    // - wave-around

    function handleCopyPaceOrder(ev: any) {
        // copy from current order
        setDesiredPaceOrder(createDesiredPaceOrder(paceOrder));
    }

    function handleCommitPaceOrder(ev: any) {
        // TODO wire this up to the actual SDK

        if (desiredPaceOrder != null) {
            // TODO move this logic somewhere else
            const irCommands: string[] = [];
            desiredPaceOrder.commands.forEach(command => {
                command.carNumbers.forEach(carNumber => {
                    let c = null;
                    switch (command.type) {
                        case "end_of_line":
                        case "set_order_to":
                            c = "!eol";
                            break;
                        case "wave_around":
                            c = "!waveby";
                            break;
                    }

                    if (c != null) {
                        irCommands.push(`${c} ${carNumber}`);
                    }
                });
            });
            let commandsSent = sendIRCommands(irCommands);
            setExecutingCommands(true);
            commandsSent.then((success) => {
                setExecutingCommands(false);
                setDesiredPaceOrder(null);
            })
        }
    }

    // display current pacing order on the left
    // display edit buttons and target pacing order on the right
    return <Grid container>
        <Grid item xs={4}>
            <GridStack grid={paceOrder} />
        </Grid>
        <Grid item xs={8}>
            <Stack>
                <Stack direction="row">
                    <Button onClick={handleCopyPaceOrder}>Copy current grid order</Button>
                    <Box sx={{ position: 'relative' }}>
                        <Button onClick={handleCommitPaceOrder} disabled={desiredPaceOrder == null}>Commit new grid order</Button>
                        <CircularProgress size={24} sx={{ 
                            top: "50%", 
                            left: "50%",
                             position: "absolute",
                              marginTop: "-12px",
                              marginLeft: "-12px" ,
                              display: executingCommands ? "block" : "none"}} />
                    </Box>
                </Stack>
                {desiredPaceOrder != null &&
                    <DesiredPaceOrderTable
                        currentPaceOrder={paceOrder}
                        desiredOrder={desiredPaceOrder}
                        setDesiredOrder={setDesiredPaceOrder} />}
            </Stack>
        </Grid>
    </Grid>
}