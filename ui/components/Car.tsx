import React from 'react';

import * as sdk from '../sdk';
import { Incident, IncidentCar as Car } from '../../common/incident';
import { getIncidentIcon } from './Incident';
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Badge, Typography, List, IconButton, ListItem, ListItemIcon, ListItemText, ButtonGroup, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UndoIcon from '@mui/icons-material/Undo';
import SearchIcon from '@mui/icons-material/Search';

// Displays a list of incidents for a specific driver

export default function CarIncidents(props: {
    incidents: Incident[]
}) {

    let [expanded, setExpanded] = React.useState(false);
    let [showDismissed, setShowDismissed] = React.useState(false);

    let car = props.incidents[0].data.car;

    let incidents = props.incidents;
    incidents
        .sort((a, b) => {
            // sort by timestamp (i.e., sessionNum first, then sessionTime)

            let comp1 = a.data.sessionNum - b.data.sessionNum;
            if (comp1 != 0) return comp1;
            return a.data.sessionTime - b.data.sessionTime;
        });

    let acknowledgedIncidents = incidents.filter(
        (inc) => inc.resolution == "Acknowledged");

    const toggleExpander =
        (event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded);
        };

    return <Accordion expanded={expanded} onChange={toggleExpander} >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Badge badgeContent={acknowledgedIncidents.length} color="primary">
                <Avatar>{car.number}</Avatar>
            </Badge>
            <Stack sx={{ marginLeft: 2 }}>
                <Typography variant="subtitle2">{car.driverName}</Typography>
                <Typography sx={{ color: "secondary" }} variant="caption">{"Team: " + car.teamName}</Typography>
            </Stack>
        </AccordionSummary>
        <AccordionDetails>
            <List>
                {
                    acknowledgedIncidents.map((inc) => <CarIncident
                        key={inc.id}
                        incident={inc} />
                    )
                }
            </List>
        </AccordionDetails>
    </Accordion>
}

function CarIncident(props: {
    incident: Incident
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
            primary={inc.data.type}
            secondary={
                <React.Fragment>
                    <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                    >
                        Lap: {inc.data.car.currentLap}
                    </Typography>
                    {inc.data.description != undefined ? inc.data.description : ""}
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