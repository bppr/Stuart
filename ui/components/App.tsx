import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import sdk from '../sdk';
import IncidentView from './Incident';
import CarIncidents from './CarIncidents';
import Header from './Header';
import Pacing from './Pacing';
import TelemetryViewer from './JSONViewer';

import { IncidentData, Resolution } from '../../common/incident';
import { ClockState } from '../../common/ClockState';
import { PaceState } from '../../common/PaceState';

import { Incident } from '../types/Incident';

import { Grid, Stack, Typography, IconButton, Tabs, Tab } from "@mui/material";
import CloseIcon from '@mui/icons-material/CancelOutlined';

import { TEST_CLOCK_STATE, TEST_INCIDENTS } from '../test-utils';


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
const DEFAULT_PACE_STATE: PaceState = {
  grid: [],
  pits: [],
  oneToGo: false,
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

/**
 * App is the main UI component. In addition to organizing the layout and other sub components, 
 * it is also responsible for:
 * - Maintaining a "database" of incidents and allowing for their resolution (see "addIncident")
 * - setting up listeners for new incident events and state changes from the backend (see "listen")
 * 
 */
export function App() {
  // any time we call a setter here, getter is updated and App re-renders 
  // any child components with changed props also re-render
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [clock, setClock] = useState(DEFAULT_CLOCK);
  const [telemetryJson, setTelemetryJson] = useState(DEFAULT_TELEMETRY_JSON);
  const [paceState, setPaceState] = useState(DEFAULT_PACE_STATE);

  function addIncident(incident: IncidentData) {
    setIncidents((prevIncidents) => {
      const id = Math.max(0, ...(prevIncidents.map(inc => inc.id))) + 1;

      let resolveIncident = (res: Resolution) => {
        setIncidents((incs) => {
          return incs.map((inc) => {
            if (inc.id === id) {
              return { ...inc, resolution: res }
            } else {
              return inc;
            }
          })
        })
      }

      return [...prevIncidents, {
        data: incident,
        id: id,
        resolution: 'Unresolved',
        resolve: resolveIncident,
      }]
    });
  }

  function listen() {
    sdk.receive('incident-data', addIncident);
    sdk.receive('clock-update', (message: ClockState) => setClock(message));
    sdk.receive('telemetry-json', (message: any) => setTelemetryJson(message));
    sdk.receive('pace-state', (message: PaceState) => setPaceState(message));
  }

  // clear all incidents, triggering a re-render
  function clearIncidents() {
    if (window.confirm("Are you sure? You should only do this when a session changes."))
      setIncidents([]);
  }

  // only listen on the first render
  useEffect(listen, []);

  // FOR TESTING!
  useEffect(() => {
    for(let incident of TEST_INCIDENTS) {
      addIncident(incident);
    }
    setClock(TEST_CLOCK_STATE);
  }, []);

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
            unresolvedIncidents.map((incident) => {
              return <IncidentView
                key={incident.id}
                incident={incident} />
            }
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
          <Pacing paceOrder={paceState} />
        </div>
        <div hidden={selectedTab !== 2}> {/* Telemetry */}
          <TelemetryViewer sourceJson={telemetryJson} />
        </div>
      </Grid>
    </Grid>
  </Stack>
}