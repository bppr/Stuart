import React, { useState } from 'react';

import * as sdk from '../sdk';
import { IncidentCar as Car } from '../../common/incident';
import { getIncidentEmoji } from './Incident';
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Badge, Typography, List, IconButton, ListItem, ListItemIcon, ListItemText, ButtonGroup, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UndoIcon from '@mui/icons-material/Undo';
import SearchIcon from '@mui/icons-material/Search';
import { Incident } from "../types/Incident";


/**
 * Displays a list of incidents for a specific car (driver?)
 */
export default function CarIncidents(props: { incidents: Incident[]}) {
  const [expanded, setExpanded] = useState(false);

  const car = props.incidents[0].data.car;
  const incidents = props.incidents;

  // sort by timestamp (i.e., sessionNum first, then sessionTime)
  incidents.sort((a, b) => {
    const sessionDiff = a.data.sessionNum - b.data.sessionNum;
    if (sessionDiff !== 0) 
        return sessionDiff;
      
    return a.data.sessionTime - b.data.sessionTime;
  });

  const acknowledgedIncidents = incidents.filter((inc) => inc.resolution === "Acknowledged");
  const toggleAccordion = (_: any, newVal: boolean) => setExpanded(newVal)

  return <Accordion expanded={expanded} onChange={toggleAccordion} >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Badge badgeContent={acknowledgedIncidents.length} color="warning">
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
        acknowledgedIncidents.map(inc => <CarIncident key={inc.id} incident={inc} />)
      }
      </List>
    </AccordionDetails>
  </Accordion>
}

function formatPct(lapPct: number, decimals: number = 2) {
  const rounded = (lapPct * 100).toLocaleString('en-US', {
    maximumSignificantDigits: 2 + decimals
  })

  return `${rounded}%`
}

function CarIncident(props: { incident: Incident}) {
    // call back to main process, which calls irsdk to jump to correct car/time
    const showReplay = (ev: React.MouseEvent) => {
      ev.preventDefault()
      sdk.replay(props.incident.data)
    }

    const unresolveIncident = (ev: React.MouseEvent) => {
      ev.preventDefault()
      props.incident.resolve("Unresolved");
    }

    const inc = props.incident;

    return <ListItem
      secondaryAction={
        <ButtonGroup size="large">
          <IconButton edge="end" onClick={showReplay} title="Show in Replay">
            <SearchIcon />
          </IconButton>

          <IconButton edge="end" onClick={unresolveIncident} title="Undo">
            <UndoIcon />
          </IconButton>
        </ButtonGroup>}
      >
        <ListItemIcon>
          <Avatar sx={{ color: "black", width: 32, height: 32 }}>{ getIncidentEmoji(inc) }</Avatar>
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
                Lap: {inc.data.car.currentLap} / {formatPct(inc.data.car.currentLapPct)}
              </Typography>
              { inc.data.description && inc.data.description }
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