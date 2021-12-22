import React from 'react';

import * as sdk from '../sdk';
import { Incident as BackendIncident, IncidentClass } from '../../common/incident';

import { Card, CardHeader, CardContent, Grid, Slider, Typography, ButtonGroup, Avatar, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import UndoIcon from '@mui/icons-material/Undo';
import { formatTime } from '../clock';

const CardContentNoPadding = styled(CardContent)(`
  padding-top: 0px;
  padding-left: 16px;
  padding-right: 16px;
  &:last-child {
    padding-bottom: 16px;
  }
`);

// a component for displaying an incident
// allows tally/dismiss/resolve via props.onTally, props.onDismiss, props.onResolve
// prop: incident, a record for an incident including its resolution state
const Incident = React.memo(function (props: {
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
        <Avatar sx={{ color: "black" }} alt={props.incident.data.type}>{getIncidentIcon(props.incident)}</Avatar>
      }
      title={`#${car.number} ${car.driverName}`}
      subheader={[props.incident.data.type].join(' ')}
      action={
        <ButtonGroup size="large">
          <IconButton onClick={showReplay} title="Show in Replay">
            <SearchIcon />
          </IconButton>
          {props.incident.resolution == "Unresolved" &&
            <IconButton onClick={acknowledgeIncident} title="Acknowledge">
              <CheckIcon />
            </IconButton>}
          {props.incident.resolution == "Unresolved" &&
            <IconButton onClick={dismissIncident} title="Dismiss">
              <ClearIcon />
            </IconButton>}
          {props.incident.resolution != "Unresolved" &&
            <IconButton edge="end"
              onClick={unresolveIncident}
              title="Undo">
              <UndoIcon />
            </IconButton>}
        </ButtonGroup>
      }
    />
    <CardContentNoPadding>
      <Grid container spacing={0} sx={{ marginBottom: 0, marginTop: 1, padding: 0 }}>
        <Grid item xs={2}>
          <Typography>Lap {props.incident.data.car.currentLap}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Slider size="small" sx={{ margin: 0, padding: 0 }} disabled defaultValue={100 * props.incident.data.car.currentLapPct} />
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ textAlign: "right" }}>{formatTime(props.incident.data.sessionTime)}</Typography>
        </Grid>
      </Grid>
    </CardContentNoPadding>
  </Card>

});

export default Incident;

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