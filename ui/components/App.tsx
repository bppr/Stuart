import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import sdk from '../sdk';
import Incident from './Incident';
import CarIncidents from './Car';
import { Incident as BackendIncident } from '../../common/incident';
import { ReplayTime } from '../../common/index';

import { Grid, Stack, Typography } from "@mui/material";


// return a copy of array with element at index replaced by supplied element
function replace<T>(array: T[], index: number, element: T): T[] {
  return _.tap([...array], arr => arr.splice(index, 1, element));
}

// use ./test-utils/TEST_INCIDENT for ui work
const INITIAL_INCIDENTS: BackendIncident[] = [];
const DEFAULT_CLOCK: ReplayTime = {
  liveSessionNum: 0,
  liveSessionTime: 0,
  camSessionNum: 0,
  camSessionTime: 0,
  camCarNumber: "---",
  camDriverName: "None"
}

function formatTime(seconds: number) {
  seconds = Math.round(seconds);
  let hours = (seconds / (60 * 60)) | 0;
  seconds -= (hours * 60 * 60);
  let minutes = (seconds / 60) | 0;
  seconds -= minutes * 60

  return hours + ":" +
    (minutes.toString().padStart(2, "0")) + ":" +
    (seconds.toString().padStart(2, "0"));
}

// App - the main UI component - takes no props
// has state for incidents and selected car - re-renders on state changes
// listens for new incidents (listener bound on first render) - changes incident state
// listens for click events to select car - changes selected car state
// renders many Incidents
// renders many IncidentCounts
export function App() {
  // any time we call a setter here, getter is updated and App re-renders 
  // any child components with changed props also re-render
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [clock, setClock] = useState(DEFAULT_CLOCK);

  function listen() {
    sdk.receive('incident-created', (message: BackendIncident) => {
      setIncidents((prev) => {
        return [message, ...prev].filter((inc) => {
          return inc.resolution != "Deleted";
        });
      });
    });

    sdk.receive('incident-resolved', (message: BackendIncident) => {
      console.log("got incident resolved: " + message.id);

      setIncidents((prev) => {
        return prev.map((inc) => {
          if (inc.id == message.id) {
            return message;
          } else {
            return inc;
          }
        }).filter((inc) => {
          return inc.resolution != "Deleted";
        });;
      });
    });

    sdk.receive('clock-update', (message: ReplayTime) => {
      setClock((prev) => message);
    })

    sdk.connect();
  }

  // clear all incidents, triggering a re-render
  function clearIncidents() {
    if (window.confirm("Are you sure? You should only do this when a session changes."))
      sdk.clearIncidents();
  }

  // only listen on the first render
  useEffect(listen, []);

  let acknowledgedIncidents = _.filter(incidents, i => i.resolution == "Acknowledged" || i.resolution == "Penalized")
  let acknowledgedIncidentsByCarNumber = _.groupBy(acknowledgedIncidents, i => i.data.car.number);

  let resolvedIncidents = incidents.filter((inc) => {
    return inc.resolution != "Unresolved" && inc.resolution != "Deleted";
  });

  let unresolvedIncidents = incidents.filter((inc) => {
    return inc.resolution == "Unresolved";
  });

  const playPause = (ev: React.MouseEvent) => {
    ev.preventDefault();
    // sdk.camPlayToggle();
  }

  const liveReplay = (ev: React.MouseEvent) => {
    ev.preventDefault();
    // sdk.camLive();
  }

  return <Grid container spacing={2}>
    <Grid item xs={4} sx={{ minWidth: 400 }}>
      <Stack spacing={2}>
        <Typography>Incident Feed</Typography>
        {
          unresolvedIncidents.map((incident) => <Incident
            key={incident.id}
            incident={incident} />
          )
        }
      </Stack>
    </Grid>
    <Grid item xs={4} sx={{ minWidth: 400 }}>
      <Stack spacing={2}>
        <Typography>Drivers</Typography>
        {
          Object.keys(acknowledgedIncidentsByCarNumber).map(num => <CarIncidents
            key={num}
            incidents={acknowledgedIncidentsByCarNumber[num]} />
          )
        }
      </Stack>
    </Grid>
    <Grid item xs={4}>

    </Grid>
  </Grid>
}