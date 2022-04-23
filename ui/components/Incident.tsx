import React from 'react';

import * as sdk from '../sdk';
import { IncidentRecord } from "../types/Incident";

import { Card, CardHeader, ButtonGroup, Avatar, IconButton, Paper, Box, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check'

import { formatTime } from '../clock';

// a component for displaying an incident in the incident feed
// prop: incident, a record for an incident including its resolution state
export function FlexBoxIncident(props: {
  incident: IncidentRecord,
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
      width: "100%",
      boxSizing: "border-box",
      padding: "4px",
      margin: "4px",
      display: "flex",
      alignItems: "center",
      gap:1,
    }}>
    <Avatar>{getIncidentEmoji(incident)}</Avatar>
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      minWidth: 0,
    }}
    >
      <Box sx={{ 
        display: "flex",
        alignItems: "center", 
        gap: 1,
        }}>
        <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: car.class.color, color: "black" }} variant="rounded">
          {car.number}
        </Avatar>
        <Typography noWrap variant="subtitle1" sx={{flexGrow:1}}>{car.driverName}</Typography>
      </Box>
      <Typography noWrap variant="caption">{[props.incident.data.type, '/', formatTime(props.incident.data.time.time)].join(' ')}</Typography>
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

export function getIncidentAvatar(incident: IncidentRecord) {
  return <Avatar>{getIncidentEmoji(incident)}</Avatar>
}

export function getIncidentEmoji(incident: IncidentRecord) {
  let icon = "🚨";
  switch (incident.data.type) {
    case "Track Limits":
      icon = "⛐";
      break;
    case "Incident Count":
      icon = incident.data.description!;
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