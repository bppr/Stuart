import React from 'react';
import _, { groupBy } from 'lodash';

import * as sdk from '../sdk';

import { Incident as BackendIncident, } from '../../common/incident';
import { getIncidentIcon } from './UIIncident';
import { Accordion, AccordionDetails, AccordionSummary, List, Avatar, Badge, Typography, Slider, FormControlLabel, FormGroup, Switch, IconButton, ListItem, ListItemIcon, ListItemText, ButtonGroup, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UndoIcon from '@mui/icons-material/Undo';
import SearchIcon from '@mui/icons-material/Search';
import Incident from './UIIncident';

// Displays a list of incidents for a specific driver

const CarIncidents = React.memo(function (props: {
    incidents: BackendIncident[],
    groupByType: boolean
}) {

    //  let [expanded, setExpanded] = React.useState(false);


    let car = props.incidents[0].data.car;

    let incidents = props.incidents;
    let groupByType = props.groupByType;
    incidents
        .sort((a, b) => {
            // sort by timestamp (i.e., sessionNum first, then sessionTime)

            let comp1 = a.data.sessionNum - b.data.sessionNum;
            if (comp1 != 0) return comp1;
            return a.data.sessionTime - b.data.sessionTime;
        });

    let displayedIncidents = incidents;

    let displayedIncidentsByType = _.groupBy(displayedIncidents, (inc) => (inc.data.type));

    //   const toggleExpander =
    //       (event: React.SyntheticEvent, newExpanded: boolean) => {
    //           setExpanded(newExpanded);
    //       };



    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Badge badgeContent={displayedIncidents.length} color="warning">
                <Avatar>{car.number}</Avatar>
            </Badge>
            <Stack sx={{ marginLeft: 2 }}>
                <Typography variant="subtitle2">{car.driverName}</Typography>
                <Typography sx={{ color: "secondary" }} variant="caption">{"Team: " + car.teamName}</Typography>
            </Stack>
        </AccordionSummary>
        <AccordionDetails>
            <Stack spacing={1}>
                {
                    (!groupByType) ?
                        displayedIncidents.map((inc) => <Incident
                            key={"car-incs-all." + car.number + "." + inc.id}
                            incident={inc} />
                        )
                        :
                        Object.keys(displayedIncidentsByType).map((incType) => {
                            let incs = displayedIncidentsByType[incType];

                            return <GroupedIncidents
                                key={"car-incs-type." + car.number + "." + incType}
                                incs={incs} />
                        })
                }
            </Stack>
        </AccordionDetails>
    </Accordion>
});

function GroupedIncidents(props: {
    incs: BackendIncident[]
}) {

    let incs = props.incs;
    let inc = incs[0];
    let incType = inc.data.type;

    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Badge badgeContent={incs.length} color="warning">
                <Avatar sx={{ color: "black", width: 32, height: 32 }}>{getIncidentIcon(inc)}</Avatar>
            </Badge>
            <Typography sx={{ marginLeft: 2 }}>{incType}</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <List sx={{ padding: 0 }}>
                {
                    incs.map((i) => {
                        return <MiniIncidentListItem
                            key={i.id}
                            incident={i} />
                    })
                }
            </List>
        </AccordionDetails>
    </Accordion>
}

function MiniIncidentListItem(props: {
    incident: BackendIncident
}) {

    const showReplay = (ev: React.MouseEvent) => {
        ev.preventDefault()
        sdk.replay(props.incident.data)
    }

    const unresolveIncident = (ev: React.MouseEvent) => {
        ev.preventDefault()
        sdk.unresolveIncident(props.incident.id);
    }

    let inc = props.incident;
    return <ListItem sx={{ height: 20 }}>
        <ListItemText
            primary={
                <React.Fragment>
                    <Stack direction="row">
                        <Typography sx={{ width: 64 }}>Lap {inc.data.car.currentLap}</Typography>
                        <Slider size="small" disabled defaultValue={100 * inc.data.car.currentLapPct} />
                        <ButtonGroup size="large">
                            <IconButton edge="end"
                                onClick={showReplay}
                                title="Show in Replay">
                                <SearchIcon />
                            </IconButton>
                            <IconButton edge="end"
                                onClick={unresolveIncident}
                                title="Undo">
                                <UndoIcon />
                            </IconButton>
                        </ButtonGroup>
                    </Stack>
                </React.Fragment>
            }
        />
    </ListItem>

}

function CarIncident(props: {
    incident: BackendIncident
}) {
    // call back to main process, which calls irsdk to jump to correct car/time
    const showReplay = (ev: React.MouseEvent) => {
        ev.preventDefault()
        sdk.replay(props.incident.data)
    }

    const unresolveIncident = (ev: React.MouseEvent) => {
        ev.preventDefault()
        sdk.unresolveIncident(props.incident.id);
    }

    let inc = props.incident;

    return <ListItem
        secondaryAction={
            <ButtonGroup size="large">
                <IconButton edge="end"
                    onClick={showReplay}
                    title="Show in Replay">
                    <SearchIcon />
                </IconButton>
                <IconButton edge="end"
                    onClick={unresolveIncident}
                    title="Undo">
                    <UndoIcon />
                </IconButton>
            </ButtonGroup>
        }>
        <ListItemIcon>
            <Avatar sx={{ color: "black", width: 32, height: 32 }}>{getIncidentIcon(inc)}</Avatar>
        </ListItemIcon>
        <ListItemText
            primary={
                "Lap " + inc.data.car.currentLap + ": " + inc.data.type
            }
            secondary={
                <React.Fragment>
                    <Stack direction="row">
                        <Typography sx={{ width: 64 }}>Lap {inc.data.car.currentLap}</Typography>
                        <Slider size="small" disabled defaultValue={100 * inc.data.car.currentLapPct} />
                    </Stack>
                </React.Fragment>
            }
        />
    </ListItem>

    //        return <div className="incident">
    //        {
    //            <div>
    //                <p>{getIncidentIcon(inc) +
    //                    " " + inc.data.type +
    //                    " (Lap: " + inc.data.car.currentLap +
    //                    ")"}</p>
    //               <div className="incident-controls">
    //                    <a title="Show Replay" onClick={showReplay}>🔍</a>
    ///                    <a onClick={unresolveIncident} title="Unresolve Incident">↩️</a>
    //               </div>
    //           </div>
    //
    //        }
    //    </div>;
}

export default CarIncidents;