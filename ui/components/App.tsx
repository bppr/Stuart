import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import sdk from '../sdk';
import Incident from './Incident';
import { IncidentData } from '../../common/index';
// import { TEST_INCIDENTS } from '../test-utils';

export type IncidentRecord = IncidentData & {
  resolved: boolean
  tallied: boolean
  key: number
}

type IncidentsByCar = { [car: string]: number }

function replace<T>(array: T[], index: number, element: T): T[] {
  const arr = [...array];
  arr.splice(index, 1, element);

  return arr;
}

const INITIAL_INCIDENTS: IncidentRecord[] = [];
// const INITIAL_INCIDENTS: IncidentRecord[] = TEST_INCIDENTS;

export function App() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);

  const incidentsByCar: IncidentsByCar = incidents.reduce((acc, {car, tallied}) => {
    const count = acc[car.number] ?? 0;
    return { ...acc, [car.number]: count + (tallied ? 1 : 0) }
  }, {} as IncidentsByCar)

  const [selectedCar, setSelectedCar] = useState<string | undefined>(undefined);

  const displayIncidents = selectedCar
    ? incidents.filter(i => i.car.number == selectedCar && i.tallied == true)
    : incidents;

  function listen() {
    let key = 1; // TODO: this is temporary

    sdk.receive('incident', (message: IncidentData) => {
      setIncidents(prev => [{ ...message, resolved: false, tallied: false, key }, ...prev]);
      key += 1 
    });
  }

  function resolveIncident(index: number) {
    return (tallied: boolean = false) => {
      const incident = displayIncidents[index];
      
      setIncidents(prev => replace(
        prev, 
        prev.findIndex(i => i.key === incident.key), 
        { ...incident, resolved: true, tallied }
      ));
    }
  }

  function unresolveIncident(index: number) {
    return () => {
      const incident = displayIncidents[index];

      setIncidents(prev => replace(
        prev,
        prev.findIndex(i => i.key === incident.key),
        { ...incident, resolved: false, tallied: false }
      ));
    }
  }
  
  function tallyIncident(index: number) {
    return () => resolveIncident(index)(true);
  }

  function dismissIncident(index: number) {
    return () => resolveIncident(index)(false);
  }

  function selectCar(number: string) {
    return () => setSelectedCar(selectedCar === number ? undefined : number)
  }

  function clearIncidents() {
    if(window.confirm("Are you sure? You should only do this when a session changes."))
      setIncidents([])
  }

  useEffect(listen, []);

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
        displayIncidents.map((incident, index) => <Incident
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
        _.toPairs(incidentsByCar)
          .sort((a, b) => a[1] < b[1] ? 1 : -1)
          .map(([carNumber, incidentCount]) => <IncidentCount
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

function IncidentCount(props: { carNumber: string, incidentCount: number, onSelectCar: () => void, isSelected: boolean }) {
  return <div className={`car-incident-count ${props.isSelected ? 'selected' : ''}`} onClick={props.onSelectCar}>
    <h4>Car #{props.carNumber}</h4>
    <h5>{props.incidentCount} Incidents</h5>
    <h5 className="tip">{ props.isSelected ? 'Show All Cars' : 'Show Only This Car' }</h5>
  </div>
}