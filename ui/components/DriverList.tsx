import { DriverState } from "../../common/DriverState";
import { IncidentRecord } from "../types/Incident";
import { Table, TableCell, TableRow, Paper, TableContainer, TableHead, Typography, IconButton, Avatar, Collapse, TableSortLabel, TableBody, Box, ButtonGroup } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { getIncidentEmoji } from "./Incident";
import React, { useState } from "react";
import { CircularIncidentMap } from "./CircularIncidentMap";
import * as sdk from '../sdk';


type SortColumn = "name" | "class" | "incidents" | "position" | "class-position";

/**
 * DriverList displays a compact, expandable table of all drivers currently in the session.
 * 
 * At a glance, it includes information about their official and class positions, any 
 * flags they might have, and the total number of incidents they have marked against them.
 * 
 * @param props.drivers a list of all drivers in the session 
 * @param props.incidents a list of all incidents in the session
 */
function DriverList(props: { drivers: DriverState[], incidents: IncidentRecord[] }) {

    // Display a list of drivers in an "accordion" format.
    // The header of the accordion should contain
    // - Number & class color
    // - Team name
    // - Flags
    // - Count of tallied incidents

    // The body of the accordion contains individual incidents, including
    // - the type of incident (icon)
    // - where it occurred on track
    // - buttons to view or unresolve

    const incidentsByDriver: Map<number, IncidentRecord[]> = new Map();
    props.incidents.forEach(inc => {
        const incs = incidentsByDriver.get(inc.data.car.idx) ?? [];
        incs.push(inc);
        incidentsByDriver.set(inc.data.car.idx, incs);
    });

    const [sortColumn, setSortColumn] = useState("name" as SortColumn);
    const [sortAscending, setSortAscending] = useState(true);

    let driverComparator = (d1: DriverState, d2: DriverState) => {
        switch (sortColumn) {
            case "class": {
                // sort by class first, then by car number
                const classCompare = d1.car.class.name.localeCompare(d2.car.class.name);
                if (classCompare !== 0) return classCompare;
                return d1.car.number.localeCompare(d2.car.number);
            }
            case "class-position": {
                // sort by class first, then by car class position
                const classCompare = d1.car.class.name.localeCompare(d2.car.class.name);
                if (classCompare !== 0) return classCompare;
                return d1.classPosition - d2.classPosition;
            }
            case "position": {
                return d1.position - d2.position;
            }
            case "incidents": {
                const d1Incs = (incidentsByDriver.get(d1.car.idx) ?? []).length;
                const d2Incs = (incidentsByDriver.get(d2.car.idx) ?? []).length;
                return d1Incs - d2Incs;
            }
            case "name": {
                return d1.car.teamName.localeCompare(d2.car.teamName);
            }
            default: {
                throw Error("assertion sort order");
            }
        }
    }

    const driverComparatorDesc = (d1: DriverState, d2: DriverState) => driverComparator(d2, d1);

    const sortedDrivers = [...(props.drivers)];
    sortedDrivers.sort(sortAscending ? driverComparator : driverComparatorDesc);

    function requestSortColumn(col: SortColumn) {
        // if it was just picked, sort ascending. if it was already selected, invert the sort order
        const setAscending = sortColumn !== col || !sortAscending;
        setSortAscending(setAscending);
        setSortColumn(col);
    }

    return <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell align="right" colSpan={2}>
                        <TableSortLabel active={sortColumn === "class"}
                            direction={sortAscending ? 'asc' : 'desc'}
                            onClick={() => requestSortColumn("class")}>Class</TableSortLabel>
                    </TableCell>
                    <TableCell>
                        <TableSortLabel active={sortColumn === "name"}
                            direction={sortAscending ? 'asc' : 'desc'}
                            onClick={() => requestSortColumn("name")}>Driver</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                        <TableSortLabel active={sortColumn === "incidents"}
                            direction={sortAscending ? 'asc' : 'desc'}
                            onClick={() => requestSortColumn("incidents")}>Incidents</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Flags</TableCell>
                    <TableCell align="right">
                        <TableSortLabel active={sortColumn === "class-position"}
                            direction={sortAscending ? 'asc' : 'desc'}
                            onClick={() => requestSortColumn("class-position")}>CP</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                        <TableSortLabel active={sortColumn === "position"}
                            direction={sortAscending ? 'asc' : 'desc'}
                            onClick={() => requestSortColumn("position")}>OP</TableSortLabel>
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    sortedDrivers.map(driver => <DriverRow key={"car-" + driver.car.idx}
                        driver={driver}
                        incidents={incidentsByDriver.get(driver.car.idx) ?? []}
                    />)
                }
            </TableBody>
        </Table>
    </TableContainer>
}

/**
 * DriverRow is a table fragment containing two "rows", one with the driver's details at a glance, and a collapsed section that contains detailed information about the incidents a driver has accrued.
 * 
 * @param props 
 * @returns 
 */
function DriverRow(props: { driver: DriverState, incidents: IncidentRecord[] }) {
    const [expanded, setExpanded] = useState(false);
    const [hoveredIncident, setHoveredIncident] = useState(-1);
    const shownIncidents = props.incidents.filter(inc => inc.resolution === "Acknowledged");

        if(shownIncidents.length === 0 && expanded) {
            setExpanded(false);
        }

    return <React.Fragment>
        <TableRow>
            <TableCell padding="checkbox">
                <IconButton
                    size="small"
                    onClick={() => setExpanded(!expanded)}
                    disabled={shownIncidents.length === 0}>
                    {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </TableCell>
            <TableCell padding="checkbox" align="right">
                <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: props.driver.car.class.color, color: "black" }} variant="rounded">
                    {props.driver.car.number}
                </Avatar>
            </TableCell>
            <TableCell>
                <Typography>{props.driver.car.teamName}</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography>{shownIncidents.length}</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography>{getFlags(props.driver)}</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography>{props.driver.classPosition}</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography>{props.driver.position}</Typography>
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell colSpan={7} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                <Collapse in={expanded}>
                    <Box sx={{
                        display: "flex"
                    }}>
                        <CircularIncidentMap size={360}
                            icons={
                                shownIncidents.map(inc => {
                                    return {
                                        emoji: getIncidentEmoji(inc),
                                        trackPositionPct: inc.data.trackPositionPct,
                                        highlighted: hoveredIncident === inc.id,
                                        incidentId: inc.id,
                                    };
                                })
                            } />
                        <Box sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                        }}>
                            {
                                shownIncidents.map(incident => <IncidentListItem 
                                    key={"driver-incident-" + incident.id} 
                                    incident={incident} 
                                    hovered={(over: boolean) => {
                                        setHoveredIncident((oldId) => {
                                            if(over) {
                                                return incident.id;
                                            } else {
                                                if(oldId === incident.id) {
                                                    return -1;
                                                } else {
                                                    return oldId;
                                                }
                                            }
                                        })  
                                    }}/>)
                            }
                        </Box>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </React.Fragment>
}

function getFlags(driver: DriverState) {
    let flagsEmoji = "";
    driver.flags.forEach(flag => {
        switch (flag) {
            case "Black":
                flagsEmoji += "🏴";
                break;
            case "Checkered":
                flagsEmoji += "🏁";
                break;
            case "Repair":
                flagsEmoji += "🟠";
                break;
            default:
                break;
        }
    });

    return flagsEmoji;
}

function IncidentListItem(props: { incident: IncidentRecord, hovered?: (over: boolean) => void }) {

    const hover = props.hovered ?? ((over: boolean) => {});

    const incident = props.incident;
    return <Box sx={{
        display: "flex",
        alignItems: "center"
    }} onMouseOver={() => hover(true)} onMouseOut={() => hover(false)}>
        <Avatar sx={{
            width: 24,
            height: 24,
            fontSize: 12
        }}>{getIncidentEmoji(props.incident)}</Avatar>
        <Typography sx={{ width: 80 }}>Lap {incident.data.lap}</Typography>
        <Typography sx={{ flexGrow: 1 }}>{incident.data.type}</Typography>
        <ButtonGroup size="small">
            <IconButton onClick={() => sdk.replay(props.incident.data)} >
                <SearchIcon />
            </IconButton>
            <IconButton onClick={() => props.incident.resolve("Unresolved")}>
                <CloseIcon />
            </IconButton>
        </ButtonGroup>
    </Box>
}

export default DriverList;