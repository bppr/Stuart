import React from 'react';

import * as sdk from '../sdk';
import { Incident } from "../types/Incident";

import { Card, CardHeader, ButtonGroup, Avatar, IconButton, Paper, Box, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check'

import { formatTime } from '../clock';

// a component for displaying an incident in the incident feed
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

  return <Card sx={{

  }}>
    <CardHeader sx={{
      padding: "4px",
      width: "352px",
      height: "40px",
    }}
      avatar={
        <Avatar sx={{ color: "black" }} alt={props.incident.data.type}>{getIncidentEmoji(props.incident)}</Avatar>
      }
      title={`#${car.number} ${car.teamName}`}
      subheader={[props.incident.data.type, '/', formatTime(props.incident.data.sessionTime)].join(' ')}
      action={
        <ButtonGroup size="large" sx={{
          verticalAlign: "50%"
        }}>
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

export function FlexBoxIncident(props: {
  incident: Incident,
}) {

  const incident = props.incident;
  const car = incident.data.car;

  // call back to main process, which calls irsdk to jump to correct car/time
  const showReplay = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.replay(incident.data)
  }

  const acknowledgeIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    incident.resolve("Acknowledged");
  }

  const dismissIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    incident.resolve("Dismissed");
  }


  return <Paper
    sx={{
      width: "360px",
      boxSizing: "border-box",
      padding: "4px",
      margin: "4px",
      display: "flex",
    }}>
    <Avatar>{getIncidentEmoji(incident)}</Avatar>
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      minWidth: 0,
    }}
    >
      <Typography noWrap variant="subtitle1">{`#${car.number} ${car.teamName}`}</Typography>
      <Typography noWrap variant="caption">{[props.incident.data.type, '/', formatTime(props.incident.data.sessionTime)].join(' ')}</Typography>
    </Box>
    <IconButton onClick={showReplay} title="Show in Replay">
      <SearchIcon />
    </IconButton>
    <IconButton onClick={acknowledgeIncident} title="Acknowledge">
      <CheckIcon />
    </IconButton>
    <IconButton onClick={dismissIncident} title="Dismiss">
      <ClearIcon />
    </IconButton>
  </Paper>
}

export function getIncidentAvatar(incident: Incident) {
  return <Avatar>{getIncidentEmoji(incident)}</Avatar>
}

export function getIncidentEmoji(incident: Incident) {
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

export default React.memo(FlexBoxIncident);