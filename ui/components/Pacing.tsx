import { Card, CardHeader, Stack, Typography, Avatar, IconButton, ButtonGroup, Table, TableBody, TableCell, TableRow } from '@mui/material'
import EndOfLine from '@mui/icons-material/VerticalAlignBottom';
import WaveAround from '@mui/icons-material/UTurnLeft';
import React, { useState } from 'react'

type CarInfo = {
    name: string,
    number: string,
    position: number,
}

type GridSpot = {
    car: CarInfo,
    paceLine: number,
    paceRow: number,
}

type PaceOrder = {
    grid: GridSpot[],
    pits: CarInfo[],
}

let TEST_PACE_ORDER: PaceOrder = {
    grid: [
        {
            car: {
                name: "Joey Logano",
                number: "68",
                position: 1,
            },
            paceLine: 0,
            paceRow: 0
        }, {
            car: {
                name: "Suzie Queue",
                number: "9",
                position: 2,
            },
            paceLine: 1,
            paceRow: 0,
        }, {
            car: {
                name: "Mike Racecar",
                number: "18",
                position: 3
            },
            paceLine: 0,
            paceRow: 1,
        }, {
            car: {
                name: "Someone Else",
                number: "000",
                position: 4
            },
            paceLine: 1,
            paceRow: 2
        }
    ],
    pits: [{
        name: "Mister Lazy",
        number: "12",
        position: 5
    }]
}

function GridCarElement(props: {
    car: CarInfo
}) {
    return <Card>
        <CardHeader
            avatar={
                <Avatar>P{props.car.position}</Avatar>
            }
            title={"#" + props.car.number + " " + props.car.name}
            action={<ButtonGroup>
                <IconButton name='Send driver to the end of the line'>
                    <EndOfLine />
                </IconButton>
                <IconButton name='Wave driver around the pace car'>
                    <WaveAround />
                </IconButton>
            </ButtonGroup>} />
    </Card>
}

function GridEmptyElement(props: {}) {
    return <Card>
        <CardHeader
            avatar={
                <Avatar>X</Avatar>
            }
            title="Empty" />
    </Card>
}

function PitCarElement(props: {
    car: CarInfo
}) {
    return <Card>
        <CardHeader
            avatar={
                <Avatar>P{props.car.position}</Avatar>
            }
            title={"#" + props.car.number + " " + props.car.name} />
    </Card>
}

function GridStack(props: {
    grid: PaceOrder
}) {

    // display a grid of cars that are currently on track, then a space, then cars currently in the pits

    // determine the rectangular size of the grid
    let maxLane = 0;
    let maxRow = 0;
    for (let gridSpot of props.grid.grid) {
        maxLane = Math.max(gridSpot.paceLine);
        maxRow = Math.max(gridSpot.paceRow);
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
        gridSpots[gridSpot.paceRow][gridSpot.paceLine] = gridSpot.car;
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
                            return <TableCell>{
                                    car != null &&
                               
                                <GridCarElement car={car} key={spotKey} />
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
    type: "wave_around" | "end_of_line",
    // The car numbers to issue the command to, in order
    carNumbers: string[],
}

type DesiredPaceOrder = {
    // The target order of the cars
    cars: CarInfo[],
    // The commands necessary to issue in order to achieve the desired order
    commands: GridCommand[],
}

const INITIAL_DESIRED_PACE_ORDER: DesiredPaceOrder | null = null;
export default function Pacing(props: {}) {
    let [paceOrder, setPaceOrder] = useState(TEST_PACE_ORDER);

    let [desiredPaceOrder, setDesiredPaceOrder] = useState(INITIAL_DESIRED_PACE_ORDER);

    function updatePaceOrder(newPaceOrder: PaceOrder) {
        // TODO: if there is a desiredPaceOrder already being worked on, and a car comes out of the pits and thus is given a position in the pace line, add it to the back of the desired pace order grid. Best we can do I think.

        setPaceOrder(newPaceOrder);
    }
    // left to do:
    // - display desired order stuff on the right
    // - a button to copy the current order to the desired order ("edit")
    // - drag and drop items in the ordering
    // - wave-around

    // display current pacing order on the left

    return <GridStack grid={paceOrder} />
}