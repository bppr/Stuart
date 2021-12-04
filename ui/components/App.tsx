import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import sdk from '../sdk';
import Incident from './Incident';
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
  const [selectedCar, setSelectedCar] = useState<string | undefined>(undefined);

  // if a car is selected, only show tallied incidents for that car
  // else, show all incidents
  const displayedIncidents = selectedCar
    ? incidents.filter(i => i.data.car.number == selectedCar && i.resolution == 'Acknowledged')
    : incidents;

  // list of [carNumber, incidentCount][] for tallied incidents
  const incidentsByCar = _(incidents)
    .filter(i => i.resolution == 'Acknowledged')
    .countBy('car.number')
    .toPairs()
    .sortBy(n => [n[1]])

  function listen() {
    sdk.receive('incident-created', (message: BackendIncident) => {
      setIncidents(prev => [ message, ...prev]);
    });

    sdk.receive('incident-resolved', (message: BackendIncident) => {
      console.log("got incident resolved: " + message.id);

      // this doesn't seem to work
      setIncidents((prev) => {
        return prev.map((inc) => {
          if(inc.id == message.id) {
            return message;
          } else {
            return inc;
          }
        })
      });
    });
  }

  // return void function that selects car with given number, triggering re-render
  // if given number is currently selected, clear selection (aka toggle)
  function selectCar(number: string) {
    return () => setSelectedCar(selectedCar !== number ? number : undefined);
  }

  // clear all incidents, triggering a re-render
  function clearIncidents() {
    if(window.confirm("Are you sure? You should only do this when a session changes."))
      setIncidents([])
  }

  // only listen on the first render
  useEffect(listen, []);

  // define the element returned from our component
  return <div className="app-main">
    <section className="incidents">
      <h1>Incidents <button onClick={clearIncidents}>Clear</button></h1>

      <p>
        { 
          selectedCar && 
            <span>{`Showing only counted incidents for Car #${selectedCar} `}
            <button onClick={() => setSelectedCar(undefined)}>Show All</button></span>
        }
        { !selectedCar && 'Showing all incidents' }
      </p>

      { 
        displayedIncidents.map((incident, index) => <Incident
          key={incident.id} 
          incident={incident} />
        )
      }
    </section>

    <section className="incident-counts">
      <h1>Counts</h1>
      {
        incidentsByCar.map(([carNumber, incidentCount]) => <IncidentCount
            key={carNumber}
            isSelected={selectedCar === carNumber}
            onSelectCar={selectCar(carNumber)}
            carNumber={carNumber} 
            incidentCount={incidentCount} />
          )
      }
    </section>
  </div>;
}

type IncidentCountProps = { 
  carNumber: string
  incidentCount: number
  onSelectCar: () => void
  isSelected: boolean 
}

// component for an incident count display for a given car
// allows for selection filter via props.onSelectCar
function IncidentCount({carNumber, incidentCount, isSelected, onSelectCar}: IncidentCountProps) {
  const classes = `car-incident-count ${isSelected ? 'selected' : ''}`

  // define the element returned from our component
  return <div className={classes} onClick={onSelectCar}>
    <h4>Car #{carNumber}</h4>
    <h5>{incidentCount} Incidents</h5>
    <h5 className="tip">{ isSelected ? 'Show All Cars' : 'Show Only This Car' }</h5>
  </div>
}