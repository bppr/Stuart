import React from 'react';

import * as sdk from '../sdk';
import { Resolution } from '../../common/incident';
import { Incident } from "./App"

import { Card, CardHeader, ButtonGroup, Avatar, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check'
import { formatTime } from '../clock';

// a component for displaying an incident
// allows tally/dismiss/resolve via props.onTally, props.onDismiss, props.onResolve
// prop: incident, a record for an incident including its resolution state
function Incident(props: {
  incident: Incident,
}) {
  const car = props.incident.data.car;

  // call back to main process, which calls irsdk to jump to correct car/time
  const showReplay = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.replay(props.incident.data)
  }

  const acknowledgeIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    props.incident.resolve("Acknowledged");
  }

  const dismissIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    props.incident.resolve("Dismissed");
  }

  const unresolveIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    props.incident.resolve("Unresolved");
  }

  return <Card>
    <CardHeader
      avatar={
        <Avatar sx={{ color: "black" }} alt={props.incident.data.type}>{ getIncidentIcon(props.incident) }</Avatar>
      }
      title={`(${props.incident.id} #${car.number} ${car.driverName}`}
      subheader={[props.incident.data.type, '/', formatTime(props.incident.data.sessionTime)].join(' ')}
      action={
        <ButtonGroup size="large">
          <IconButton onClick={showReplay} title="Show in Replay">
            <SearchIcon />
          </IconButton>
          <IconButton onClick={acknowledgeIncident} title="Acknowledge">
            <CheckIcon />
          </IconButton>
          <IconButton onClick={dismissIncident} title="Dismiss">
            <ClearIcon />
          </IconButton>
        </ButtonGroup>
      }
    />
  </Card>

}

export function getIncidentIcon(incident: Incident) {
  let icon = "🚨";
  switch (incident.data.type) {
    case "Track Limits":
      icon = "⛐";
      break;
    case "Incident Count":
      icon = incident.data.car.incidentCount + "x";
      break;
    case "Off-Track":
      icon = "🌳";
      break;
    case "Involved in Major Incident":
      icon = "🟨";
      break;
    case "Unsafe Rejoin":
      icon = "💥";
      break;
  }
  return icon;
}

export default React.memo(Incident);