import React from 'react';

import * as sdk from '../sdk';
import { Incident as BackendIncident, IncidentClass } from '../../common/incident';

import { Card, CardHeader, ButtonGroup, Avatar, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check'


// turns 0.78658 to 75.66%
function formatPct(lapPct: number, decimals: number = 2) {
  const rounded = (lapPct * 100).toLocaleString('en-US', {
    maximumSignificantDigits: 2 + decimals
  })

  return `${rounded}%`
}

type IncidentHandler = () => void

// a component for displaying an incident
// allows tally/dismiss/resolve via props.onTally, props.onDismiss, props.onResolve
// prop: incident, a record for an incident including its resolution state
export default function Incident(props: {
  incident: BackendIncident
}) {
  const car = props.incident.data.car;
  const incidentType = props.incident.data.type ? `: ${props.incident.data.type}` : ''

  const isResolved = props.incident.resolution != "Unresolved";

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

  // compute classes for element styling (see styles/app.css)
  // filter conditional values
  const classNames = [
    'incident',
    isResolved && 'resolved',
    props.incident.resolution == 'Acknowledged' && 'tallied'
  ].filter(n => n)

  let icon = getIncidentIcon(props.incident);


  return <Card>
    <CardHeader
      avatar={
        <Avatar sx={{ color: "black" }}>{getIncidentIcon(props.incident)}</Avatar>
      }
      title={props.incident.data.type}
      subheader={"#" + car.number + " " + car.driverName}
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