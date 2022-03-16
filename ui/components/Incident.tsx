import React from 'react';

import * as sdk from '../sdk';
import { Incident as BackendIncident } from '../../common/incident';

import { Card, CardHeader, ButtonGroup, Avatar, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check'
import { formatTime } from '../clock';

// a component for displaying an incident
// allows tally/dismiss/resolve via props.onTally, props.onDismiss, props.onResolve
// prop: incident, a record for an incident including its resolution state
export default function Incident(props: {
  incident: BackendIncident
}) {
  const car = props.incident.data.car;

  // call back to main process, which calls irsdk to jump to correct car/time
  const showReplay = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.replay(props.incident.data)
  }

  const acknowledgeIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.acknowledgeIncident(props.incident.id);
  }

  const dismissIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.dismissIncident(props.incident.id);
  }

  const unresolveIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.unresolveIncident(props.incident.id);
  }

  return <Card>
    <CardHeader
      avatar={
        <Avatar sx={{ color: "black" }} alt={props.incident.data.type}>{ getIncidentIcon(props.incident) }</Avatar>
      }
      title={`#${car.number} ${car.driverName}`}
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

export function getIncidentIcon(incident: BackendIncident) {
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