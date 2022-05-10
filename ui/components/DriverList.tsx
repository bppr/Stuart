import { CarSessionFlag, DriverState } from "../../common/DriverState";
import { IncidentRecord } from "../types/Incident";
import { Table, TableCell, TableRow, Paper, TableContainer, TableHead, Typography, IconButton, Avatar, Collapse, TableSortLabel, TableBody, Box, Menu, MenuItem, Backdrop, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, TextField, Radio, Modal, Container, Dialog, DialogTitle, DialogActions } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Incident, { getIncidentEmoji } from "./Incident";
import React, { useEffect, useState } from "react";
import { CircularIncidentMap } from "./CircularIncidentMap";
import sdk, { sendChatMessages } from "../sdk";


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

    const [menuAnchorElement, setMenuAnchorElement] = useState(null as null | HTMLElement);

    function handleOpenMenu(event: React.MouseEvent<HTMLButtonElement>) {
        setMenuAnchorElement(event.currentTarget);
    }

    function handleCloseMenu() {
        setMenuAnchorElement(null);
    }

    async function handleClearAllBlackFlags() {
        await sendChatMessages(["!clearall"]);
        handleCloseMenu();
    }

    return <TableContainer component={Paper}>
        <Table size="small">
            <colgroup>
                <col />
                <col />
                <col />
                <col span={4} width="64px" />
            </colgroup>
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
                            onClick={() => requestSortColumn("incidents")} title="Tallied Incidents">I</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                        <TableSortLabel active={sortColumn === "class-position"}
                            direction={sortAscending ? 'asc' : 'desc'}
                            onClick={() => requestSortColumn("class-position")} title="Position in Class">C</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                        <TableSortLabel active={sortColumn === "position"}
                            direction={sortAscending ? 'asc' : 'desc'}
                            onClick={() => requestSortColumn("position")} title="Position Overall">R</TableSortLabel>
                    </TableCell>
                    <TableCell padding="checkbox">
                        <IconButton onClick={handleOpenMenu} size="small">
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            open={Boolean(menuAnchorElement)}
                            anchorEl={menuAnchorElement}
                            onClose={handleCloseMenu}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "left"
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                        >
                            <MenuItem onClick={handleClearAllBlackFlags}>Clear All Black Flags</MenuItem>
                        </Menu>
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
    const [showDismissedIncidents, setShowDismissedIncidents] = useState(false);

    const shownIncidents = props.incidents.filter(inc => (
        inc.resolution === "Acknowledged" ||
        inc.resolution === "Penalized" ||
        (showDismissedIncidents && inc.resolution === "Dismissed")
    ));

    // driver options menu
    const [menuAnchorElement, setMenuAnchorElement] = useState(null as (null | HTMLElement));
    function handleMenuClick(event: React.MouseEvent<HTMLButtonElement>) {
        setMenuAnchorElement(event.currentTarget);
    }

    if (shownIncidents.length === 0 && expanded) {
        setExpanded(false);
    }

    return <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
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
            <TableCell sx={{
                display: "flex"
            }}>
                <Typography sx={{ flexGrow: 1 }}>{props.driver.car.teamName}</Typography>
                <DriverFlags driver={props.driver} />
            </TableCell>
            <TableCell align="right">
                <Typography>{shownIncidents.length}</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography>{props.driver.classPosition}</Typography>
            </TableCell>
            <TableCell align="right" >
                <Typography>{props.driver.position}</Typography>
            </TableCell>
            <TableCell padding="checkbox">
                <IconButton onClick={handleMenuClick} size="small">
                    <MoreVertIcon />
                </IconButton>
                <DriverMenu
                    driver={props.driver}
                    anchorEl={menuAnchorElement}
                    onClose={() => setMenuAnchorElement(null)}
                    showHiddenIncidents={showDismissedIncidents}
                    setShowHiddenIncidents={setShowDismissedIncidents}
                />
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell colSpan={7} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                <Collapse in={expanded} unmountOnExit timeout="auto">
                    <DriverDetails incidents={shownIncidents} />
                </Collapse>
            </TableCell>
        </TableRow>
    </React.Fragment>
}

function DriverMenu(props: {
    driver: DriverState,
    anchorEl: Element | null,
    onClose: () => void,
    showHiddenIncidents: boolean,
    setShowHiddenIncidents: (_: boolean) => void
}) {

    // give penalty backdrop
    const [showPenaltyBackdrop, setShowPenaltyBackdrop] = useState(false);

    // Disqualify modal
    const [showDisqualifyModal, setShowDisqualifyModal] = useState(false);

    function handleGivePenalty() {
        setShowPenaltyBackdrop(true);
        props.onClose();
    }
    function handleShowDisqualify() {
        setShowDisqualifyModal(true);
        props.onClose();
    }

    function handleToggleHiddenIncidents() {
        props.setShowHiddenIncidents(!props.showHiddenIncidents);
        props.onClose();
    }


    async function handleClearBlackFlags() {
        const carNumber = props.driver.car.number;
        await sendChatMessages([`!clear #${carNumber}`]);
        props.onClose();
    }

    return <React.Fragment> <Menu
        id={`car-${props.driver.car.idx}-menu`}
        open={Boolean(props.anchorEl)}
        anchorEl={props.anchorEl}
        onClose={props.onClose}
        anchorOrigin={{
            vertical: "top",
            horizontal: "left"
        }}
        transformOrigin={{
            vertical: "top",
            horizontal: "right",
        }}
    >
        <MenuItem onClick={handleToggleHiddenIncidents}>{props.showHiddenIncidents ? "Hide" : "Show"} Dismissed Incidents</MenuItem>
        <MenuItem onClick={handleClearBlackFlags}>Clear Black Flags</MenuItem>
        <MenuItem onClick={handleGivePenalty}>Issue Penalty...</MenuItem>
        <MenuItem onClick={handleShowDisqualify}>Disqualify...</MenuItem>
    </Menu>

        <PenaltyModal driver={props.driver} open={showPenaltyBackdrop} onClose={() => setShowPenaltyBackdrop(false)} />
        <DisqualifyModal driver={props.driver} open={showDisqualifyModal} onClose={() => setShowDisqualifyModal(false)} />
    </React.Fragment>
}

function PenaltyModal(props: { driver: DriverState, open: boolean, onClose: () => void }) {
    type PenaltyDurationType = "driveThrough" | "time";
    const [penaltyDurationType, setPenaltyDurationType] = useState("driveThrough" as PenaltyDurationType);
    const [penaltyDurationTime, setPenaltyDurationTime] = useState(0);
    const [penaltyDurationTimeError, setPenaltyDurationTimeError] = useState(false);
    const [penaltyInProgress, setPenaltyInProgress] = useState(false);

    function handlePenaltyTimeChange(ev: React.ChangeEvent<HTMLInputElement>) {
        try {
            const time = parseInt(ev.target.value);
            setPenaltyDurationTime(time);
            setPenaltyDurationTimeError(false);
        } catch (e) {
            setPenaltyDurationTimeError(true);
        }
    }

    async function handleIssuePenalty() {
        const carNumber = props.driver.car.number;
        const duration = penaltyDurationType == "driveThrough" ? "D" : penaltyDurationTime;
        setPenaltyInProgress(true);
        await sendChatMessages([`!black #${carNumber} ${duration}`]);
        setPenaltyInProgress(false);
        props.onClose();
    }

    return <Dialog
        open={props.open}
        onClose={props.onClose}
    >
        <DialogTitle>Give penalty to {props.driver.car.driverName}</DialogTitle>
        <Container>
            <RadioGroup
                value={penaltyDurationType}
                row={true}
                onChange={handlePenaltyTimeChange}>
                <FormControlLabel
                    value="driveThrough"
                    control={<Radio />}
                    label="Drive-Through"
                    onClick={() => setPenaltyDurationType("driveThrough")} />
                <FormControlLabel
                    value="time"
                    control={<Radio />}
                    label={<Box>
                        <TextField
                            disabled={penaltyDurationType != "time"}
                            type="number"
                            label="Seconds"
                            error={penaltyDurationTimeError}
                            size="small"
                            sx={{
                                width: 80
                            }}
                            value={penaltyDurationTime}
                            inputProps={{
                                min: 0
                            }}
                            onClick={() => setPenaltyDurationType("time")}
                            onChange={(ev) => setPenaltyDurationTime(parseInt(ev.target.value))} />
                    </Box>} />
            </RadioGroup>
        </Container>
        <DialogActions>
            <Button variant="outlined" onClick={props.onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleIssuePenalty} disabled={penaltyInProgress}>Penalize</Button>
        </DialogActions>
    </Dialog>
}

function DisqualifyModal(props: { driver: DriverState, open: boolean, onClose: () => void }) {
    const [disqualifyInProgress, setDisqualifyInProgress] = useState(false);

    async function handleDisqualify() {
        const carNumber = props.driver.car.number;
        setDisqualifyInProgress(true);
        await sendChatMessages([`!dq #${carNumber}`]);
        setDisqualifyInProgress(false);
        props.onClose();
    }

    return <Dialog
        open={props.open}
        onClose={props.onClose}>
        <DialogTitle>Disqualify {props.driver.car.driverName}?</DialogTitle>
        <Typography>Are you sure?</Typography>
        <DialogActions>
            <Button variant="outlined" onClick={props.onClose}>No</Button>
            <Button variant="contained" onClick={handleDisqualify} disabled={disqualifyInProgress}>Yes</Button>
        </DialogActions>
    </Dialog>
}

type FlagElements = {
    [key in CarSessionFlag]?: JSX.IntrinsicElements['img']
}

const FLAG_ELEMENTS_BY_NAME: FlagElements = {
    "Black" : <img key="Black" src="./static/flag_black.png" width="24" height="24" title="Penalty" />,
    "Repair": <img key="Repair" src="./static/flag_meatball.png" width="24" height="24" title="Repairs Needed" />,
    "Disqualify": <img key="Disqualify" src="./static/flag_disqualify.png" width="24" height="24" title="Disqualified" />,
    "Checkered": <img key="Checkered" src="./static/flag_checkered.png" width="24" height="24" title="Checkered" />
}

function DriverFlags(props: { driver: DriverState }): JSX.Element {
    return <Box sx={{ display: "flex" }}>
        {props.driver.flags.map((flag) => FLAG_ELEMENTS_BY_NAME[flag])}
    </Box>
}

function DriverDetails(props: { incidents: IncidentRecord[] }) {
    const [hoveredIncident, setHoveredIncident] = useState(-1);

    return <Box sx={{
        display: "flex"
    }}>
        <CircularIncidentMap size={200}
            icons={
                props.incidents.map(inc => {
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
            <Typography>Incidents:</Typography>
            {
                props.incidents.map(incident => <IncidentListItem
                    key={"driver-incident-" + incident.id}
                    incident={incident}
                    hovered={(over: boolean) => {
                        setHoveredIncident((oldId) => {
                            if (over) {
                                return incident.id;
                            } else {
                                if (oldId === incident.id) {
                                    return -1;
                                } else {
                                    return oldId;
                                }
                            }
                        })
                    }} />)
            }
        </Box>
        <Box sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
        }}>
            <Typography>Penalties:</Typography>

        </Box>
    </Box>
}

function IncidentListItem(props: { incident: IncidentRecord, hovered?: (over: boolean) => void }) {

    const hover = props.hovered ?? ((over: boolean) => { });

    const incident = props.incident;
    return <Box sx={{
        display: "flex",
        alignItems: "center"
    }} onMouseOver={() => hover(true)} onMouseOut={() => hover(false)}>
        <Incident incident={incident} compact />
    </Box>
}

export default DriverList;


const DEFAULT_DRIVERS: DriverState[] = [];
export function SelfBoundDriverList(props: {driverChannelName: string, incidents: IncidentRecord[]}) {
    
  const [drivers, setDrivers] = useState(DEFAULT_DRIVERS);
  useEffect(() => {
      return sdk.receive(props.driverChannelName, setDrivers);
  }, [props.driverChannelName, setDrivers]);

  return <DriverList drivers={drivers} incidents={props.incidents} />
}