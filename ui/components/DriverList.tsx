import { DriverState } from "../../common/DriverState";
import { Incident } from "../types/Incident";
import { Accordion, Table, TableCell, TableRow, AccordionDetails, AccordionSummary, LinearProgress, List, ListItem, ListItemAvatar, ListItemText, Paper, Slider, TableContainer, TableHead, Typography, IconButton, Avatar, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { getIncidentAvatar } from "./Incident";
import React, { useState } from "react";

function DriverList(props: { drivers: DriverState[], incidents: Incident[] }) {

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

    return <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell /> { /* expand/collapse */}
                    <TableCell>#</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell align="right">Incidents</TableCell>
                    <TableCell align="right">Flags</TableCell>
                </TableRow>
            </TableHead>
            {
                props.drivers.map(driver => <DriverRow key={"car-" + driver.car.idx}
                    driver={driver}
                    incidents={props.incidents.filter(inc => inc.data.car.index === driver.car.idx)}
                />)
            }
        </Table>
    </TableContainer>
}

function DriverRow(props: { driver: DriverState, incidents: Incident[] }) {

    const [expanded, setExpanded] = useState(false);

    const shownIncidents = props.incidents.filter(inc => inc.resolution === "Acknowledged");

    return <React.Fragment>
        <TableRow>
            <TableCell>
                <IconButton
                    size="small"
                    onClick={() => setExpanded(!expanded)} >
                    {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </TableCell>
            <TableCell>
                <Avatar sx={{ width: 24, height: 24, fontSize:12, bgcolor: props.driver.car.classColor, color: "black"}} variant="rounded">
                    {props.driver.car.number}
                </Avatar>
            </TableCell>
            <TableCell>
                <Typography>{props.driver.teamName}</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography>{shownIncidents.length}</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography>{getFlags(props.driver)}</Typography>
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell colSpan={5} sx={{paddingBottom: 0, paddingTop: 0}}>
                <Collapse in={expanded}>
                    <List>
                        {
                            shownIncidents.map(incident => <IncidentListItem key={"driver-incident-" + incident.id} incident={incident} />)
                        }
                    </List>
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

function DriverEntry(props: { driver: DriverState, incidents: Incident[] }) {
    let flagsEmoji = "";
    props.driver.flags.forEach(flag => {
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

    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div style={{ float: "left" }}>
                <span style={{ backgroundColor: props.driver.car.classColor }}>
                    {props.driver.car.number}
                </span> {props.driver.teamName}
            </div>
            <div style={{ float: "right" }}>
                {flagsEmoji}
            </div>
        </AccordionSummary>
        <AccordionDetails>
            <List>
                {
                    props.incidents.map(incident => <IncidentListItem key={"driver-incident-" + incident.id} incident={incident} />)
                }
            </List>
        </AccordionDetails>
    </Accordion>
}

function IncidentListItem(props: { incident: Incident }) {
    const incident = props.incident;
    return <ListItem>
        <ListItemAvatar>
            {getIncidentAvatar(incident)}
        </ListItemAvatar>
        <ListItemText primary={<React.Fragment>
            <Typography sx={{ display: "inline", float: "left" }}
                component="div">{incident.data.type}</Typography>
            <Typography sx={{ display: "inline", float: "right" }}
                component="div">Lap {incident.data.car.currentLap}</Typography>
        </React.Fragment>}
            secondary={<LinearProgress variant="determinate" value={incident.data.car.currentLapPct} />} />
    </ListItem>
}

export default DriverList;