import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import sdk from '../sdk';
import Incident from './Incident';
import { IncidentData } from '../../common/index';

export type IncidentRecord = IncidentData & {
  resolved: boolean
  tallied: boolean
  key: number
}

// return a copy of array with element at index replaced by supplied element
function replace<T>(array: T[], index: number, element: T): T[] {
  return _.tap([...array], arr => arr.splice(index, 1, element));
}

// use ./test-utils/TEST_INCIDENT for ui work
const INITIAL_INCIDENTS: IncidentRecord[] = [];

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
    ? incidents.filter(i => i.car.number == selectedCar && i.tallied)
    : incidents;

  // list of [carNumber, incidentCount][] for tallied incidents
  const incidentsByCar = _(incidents)
    .filter(i => i.tallied)
    .countBy('car.number')
    .toPairs()
    .sortBy(n => [n[1]])

  function listen() {
    let key = 1; // TODO: this is temporary; backend to assign keys

    sdk.receive('incident', (message: IncidentData) => {
      setIncidents(prev => [{ ...message, resolved: false, tallied: false, key }, ...prev]);
      key += 1 
    });
  }

  // update UI-local incident state by incident index
  // index is render-dependent, so displayedIncidents is the indexed collection
  // incident is then updated by key, triggering a re-render
  // ensures safe updates to 'global' list with filters applied
  function updateIncident(index: number, params: { tallied: boolean, resolved: boolean }) {
    const incident = displayedIncidents[index];

    setIncidents(prev => replace(
      prev,
      prev.findIndex(i => i.key === incident.key),
      { ...incident, ...params }
    ))
  }
  
  // the following incident functions take an index and return a void function
  // returned function is passed to child components as click handlers
  // handlers update the requested incident (triggering a re-render)
  function tallyIncident(index: number) {
    return () => updateIncident(index, { resolved: true, tallied: true });
  }

  function dismissIncident(index: number) {
    return () => updateIncident(index, { resolved: true, tallied: false });
  }

  function unresolveIncident(index: number) {
    return () => updateIncident(index, { resolved: false, tallied: false })
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
          onDismiss={dismissIncident(index)}
          onTally={tallyIncident(index)}
          unresolve={unresolveIncident(index)}
          key={incident.key} 
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