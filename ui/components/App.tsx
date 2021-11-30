import React, { useEffect, useState } from 'react';

import sdk from '@ui/sdk';
import Incident from '@ui/components/Incident';
import { IncidentData } from '@common/index';
import _ from 'lodash';

export type IncidentRecord = IncidentData & {
  resolved: boolean
}

type IncidentCounts = {
  [carNumber: string]: number
}

const INITIAL_INCIDENTS: IncidentRecord[] = [
  // {
  //   sessionNum: 0,
  //   sessionTime: 45.5016098234,
  //   resolved: false,
  //   car: {
  //     index: 0,
  //     driverName: 'Brian Pratt2',
  //     number: '21',
  //     teamName: 'Powell Autosport',
  //     incidentCount: 3,
  //     currentLap: 4,
  //     currentLapPct: 0.4205678
  //   }
  // },
  // {
  //   sessionNum: 0,
  //   sessionTime: 49.5016098234,
  //   resolved: false,
  //   car: {
  //     index: 0,
  //     driverName: 'Brian Pratt2',
  //     number: '21',
  //     teamName: 'Powell Autosport',
  //     incidentCount: 5,
  //     currentLap: 4,
  //     currentLapPct: 0.4405678
  //   }
  // },
  // {
  //   sessionNum: 0,
  //   sessionTime: 58.591304598,
  //   resolved: false,
  //   car: {
  //     index: 1,
  //     driverName: 'Mike Racecar',
  //     number: '18',
  //     teamName: 'Gabir Motors',
  //     incidentCount: 7,
  //     currentLap: 3,
  //     currentLapPct: 0.6958742
  //   }
  // }
]

function keyFor({sessionNum, car: { number, incidentCount }}: IncidentData): string {
  return `s${sessionNum}.c${number}.i${incidentCount}`
}

export function App() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [driverIncidentCounts, setDriverIncidentCounts] = useState<IncidentCounts>({});
  const [selectedCar, setSelectedCar] = useState<string | undefined>(undefined);

  function listen() {
    sdk.receive('incident', (message: IncidentData) => {
      setIncidents(prev => [{ ...message, resolved: false }, ...prev]);
    });
  }

  function dismissIncident(index: number) {
    return () => {
      const incident = incidents[index];
      const newIncidents = _.clone(incidents);
      newIncidents[index] = {...incident, resolved: true };

      setIncidents(newIncidents);
    }
  }

  function countIncident(index: number) {
    return () => {
      const carNumber = incidents[index].car.number

      setDriverIncidentCounts(prev => {
        const prevValue = prev[carNumber] ?? 0
        return {...prev, [carNumber]: prevValue + 1 }
      });

      dismissIncident(index)();
    }
  }

  function selectCar(carNumber: string) {
    return () => setSelectedCar(selectedCar === carNumber ? undefined : carNumber)
  }

  function clearIncidents() {
    if(window.confirm("Are you sure? You should only do this when a session changes."))
      setIncidents([])
  }

  useEffect(listen, []);

  const displayIncidents = selectedCar
    ? incidents.filter(i => i.car.number == selectedCar)
    : incidents;

  return <div className="app-main">
    <section className="incidents">
      <h1>Incidents <button onClick={clearIncidents}>Clear</button></h1>
      <p>
        { 
          selectedCar && 
            <span>{`Showing incidents for Car #${selectedCar} `}
            <button onClick={() => setSelectedCar(undefined)}>Show All</button></span>
        }
        { !selectedCar && 'Showing all incidents' }
      </p>
      { 
        displayIncidents.map((incident, idx) => <Incident
          onDismiss={dismissIncident(idx)}
          onAcknowledge={countIncident(idx)}
          key={keyFor(incident)} 
          incident={incident} />
        )
      }
    </section>

    <section className="incident-counts">
      <h1>Counts</h1>
      {
        _.toPairs(driverIncidentCounts)
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