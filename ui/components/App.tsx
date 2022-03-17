import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import sdk from '../sdk';
import IncidentView from './Incident';
import CarIncidents from './Car';
import Header from './Header';
import Pacing from './Pacing';
import TelemetryViewer from './TelemetryViewer';

import { IncidentData, Incident } from '../../common/incident';
import { ClockState } from '../../common/ClockState';

import { Grid, Stack, Typography, IconButton, Tabs, Tab } from "@mui/material";
import CloseIcon from '@mui/icons-material/CancelOutlined';


// return a copy of array with element at index replaced by supplied element
function replace<T>(array: T[], index: number, element: T): T[] {
  return _.tap([...array], arr => arr.splice(index, 1, element));
}

// use ./test-utils/TEST_INCIDENT for ui work
const INITIAL_INCIDENTS: Incident[] = [];
const DEFAULT_CLOCK: ClockState = {
  camCar: {
    driverName: "unknown",
    index: -1,
    number: "---",
  },
  camSpeed: 0,
  live: {
    num: -1,
    time: -1,
  },
  replay: {
    num: -1,
    time: -1,
  }
}
const DEFAULT_TELEMETRY_JSON: any = {};

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
  const [telemetryJson, setTelemetryJson] = useState(DEFAULT_TELEMETRY_JSON);

  function listen() {
    sdk.receive('incident-data', (message: IncidentData) => {

      setIncidents((prevIncidents) => {
        const maxId = Math.max(...(prevIncidents.map(inc=> inc.id)));

        return [...prevIncidents, {
          data: message,
          id: maxId + 1,
          resolution: 'Unresolved',
        }]
      });
    });

    sdk.receive('clock-update', (message: ClockState) => setClock(message));
    sdk.receive('telemetry-json', (message: any) => setTelemetryJson(message));
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

  let unresolvedIncidents = incidents.filter((inc) => {
    return inc.resolution == "Unresolved";
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabSwitch = (ev: React.SyntheticEvent, newTab: number) => {
    setSelectedTab(newTab);
  }

  return <Stack spacing={4}>
    <Header time={clock} />
    <Grid container spacing={2}>
      <Grid item xs={4} sx={{ minWidth: 400 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={2}>
            <Typography variant="h4">Incident Feed</Typography>
            <IconButton
              title="Clear All Incidents"
              onClick={clearIncidents}>
              <CloseIcon sx={{ height: 32, width: 32 }} />
            </IconButton>
          </Stack>
          {
            unresolvedIncidents.map((incident) => <IncidentView
              key={incident.id}
              incident={incident} />
            )
          }
        </Stack>
      </Grid>
      <Grid item xs={8} sx={{ minWidth: 400 }}>
        <Tabs value={selectedTab} onChange={handleTabSwitch}>
          <Tab label="Drivers" />
          <Tab label="Pacing" />
          <Tab label="Telemetry" />
        </Tabs>
        <div hidden={selectedTab !== 0}> {/* Drivers */}
          {
            Object.keys(acknowledgedIncidentsByCarNumber).map(num => <CarIncidents
              key={num}
              incidents={acknowledgedIncidentsByCarNumber[num]} />
            )
          }
        </div>
        <div hidden={selectedTab !== 1}> {/* Pacing */}
          <Pacing />
        </div>
        <div hidden={selectedTab !== 2}> {/* Telemetry */}
          <TelemetryViewer sourceJson={telemetryJson} />
        </div>
      </Grid>
    </Grid>
  </Stack>
}