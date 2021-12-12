import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import sdk from '../sdk';
import Incident from './Incident';
import CarIncidents from './Car';
import { Incident as BackendIncident } from '../../common/incident';


// return a copy of array with element at index replaced by supplied element
function replace<T>(array: T[], index: number, element: T): T[] {
  return _.tap([...array], arr => arr.splice(index, 1, element));
}

// use ./test-utils/TEST_INCIDENT for ui work
const INITIAL_INCIDENTS: BackendIncident[] = [];

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

    sdk.connect();
  }

  // clear all incidents, triggering a re-render
  function clearIncidents() {
    if (window.confirm("Are you sure? You should only do this when a session changes."))
      sdk.clearIncidents();
  }

  // only listen on the first render
  useEffect(listen, []);

  const incidentsByCarNumber = _(incidents)
    .groupBy(i => i.data.car.number)
    .toPairs()
    .sortBy(n => n[0]);


  console.log("incidents by car number: " + JSON.stringify(incidentsByCarNumber));

  // define the element returned from our component
  return <div className="app-main">
    <section className="incidents">
      <h1>Incidents <button onClick={clearIncidents}>Clear</button></h1>
      {
        incidents.map((incident, index) => <Incident
          key={incident.id}
          incident={incident} />
        )
      }
    </section>

    <section className="drivers">
      <h1>Drivers:</h1>
      {
        incidentsByCarNumber.map(([num, incs]) => <CarIncidents
          key={num}
          incidents={incs} />
        )
      }
    </section>
  </div>;
}