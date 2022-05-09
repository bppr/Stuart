import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import sdk from '../sdk';
import IncidentView from './Incident';
import Header from './Header';
import Pacing from './Pacing';
import TelemetryViewer from './JSONViewer';

import { Incident } from '../../common/incident';
import { ClockState } from '../../common/ClockState';
import { PaceState } from '../../common/PaceState';

import { IncidentRecord, Resolution } from '../types/Incident';

import { Stack, Typography, IconButton, Tabs, Tab, Box, Collapse, Divider } from "@mui/material";
import CloseIcon from '@mui/icons-material/CancelOutlined';
import { TransitionGroup } from 'react-transition-group';

import DriverList from './DriverList';
import { DriverState } from '../../common/DriverState';
import { CameraState } from '../../common/CameraState';


const INITIAL_INCIDENTS: IncidentRecord[] = [];
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
const DEFAULT_DRIVERS: DriverState[] = [];
const DEFAULT_CAMERA: CameraState = {
  cameraGroups: [{
    cameras: [{
      name: "NONE",
      num: -1,
    }],
    name: "NONE",
    num: -1
  }],
  cars: [{
    class: {
      color: "#FFFFFF",
      name: "NONE",
    },
    color: {
      primary: "#000000",
      secondary: "#000000",
      tertiary: "#000000",
    },
    driverName: "NONE",
    idx: -1,
    number: "---",
    teamName: "NONE"
  }],
  current: {
    cameraGroupNum: -1,
    cameraNum: -1,
    carIdx: -1,
    speed: 0,
    isLive: true,
  },
  sessions: [{
    lapLimit: -1,
    name: "NONE",
    num: 0,
    timeLimt: -1,
    type: "NONE"
  }],
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
  const [drivers, setDrivers] = useState(DEFAULT_DRIVERS);
  const [camera, setCamera] = useState(DEFAULT_CAMERA);

  function addIncident(incident: Incident) {
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
    sdk.receive('clock-update', setClock);
    sdk.receive('telemetry-json', setTelemetryJson);
    sdk.receive('pace-state', setPaceState);
    sdk.receive('drivers', setDrivers);
    sdk.receive('camera', setCamera);
  }

  // clear all incidents, triggering a re-render
  function clearIncidents() {
    if (window.confirm("Are you sure? You should only do this when a session changes."))
      setIncidents([]);
  }

  // only listen on the first render
  useEffect(listen, []);

  let acknowledgedIncidents = _.filter(incidents, i => i.resolution == "Acknowledged" || i.resolution == "Penalized")

  let unresolvedIncidents = incidents.filter((inc) => {
    return inc.resolution == "Unresolved";
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabSwitch = (ev: React.SyntheticEvent, newTab: number) => {
    setSelectedTab(newTab);
  }

  return <Box>
    <Header camera={camera} />
    <Divider />
    <Box sx={{
      display: "flex",
      gap: 2
    }}>
      <Stack spacing={2} sx={{ width: 360 }}>
        <Box sx={{
          display: "flex",
          alignItems: "center",
        }}>
          <Typography sx={{ flexGrow: 1 }} variant="h4">Incident Feed</Typography>
          <IconButton
            title="Clear All Incidents"
            onClick={clearIncidents}>
            <CloseIcon sx={{ height: 32, width: 32 }} />
          </IconButton>
        </Box>
        <TransitionGroup>
          {
            unresolvedIncidents.map((incident) =>
              <Collapse key={incident.id}>
                <IncidentView
                  incident={incident} />
              </Collapse>
            )
          }
        </TransitionGroup>
      </Stack>
      <Divider orientation='vertical' flexItem />
      <Box sx={{
        flexGrow: 1,
      }}>
        <Tabs value={selectedTab} onChange={handleTabSwitch}>
          <Tab label="Drivers" />
          <Tab label="Pacing" />
          <Tab label="Telemetry" />
        </Tabs>
        <div hidden={selectedTab !== 0}> {/* Drivers */}
          <DriverList drivers={drivers} incidents={incidents} />
        </div>
        <div hidden={selectedTab !== 1}> {/* Pacing */}
          <Pacing paceOrder={paceState} />
        </div>
        <div hidden={selectedTab !== 2}> {/* Telemetry */}
          <TelemetryViewer sourceJson={telemetryJson} />
        </div>
      </Box>
    </Box>
  </Box>
}