import React, { useEffect, useState } from 'react';

import sdk from '@ui/sdk';
import Incident from '@ui/components/Incident';
import { IncidentData } from '@common/index';

const INITIAL_INCIDENTS: IncidentData[] = [] /* [ test data for faster styling feedback
  {
    sessionNum: 0,
    sessionTime: 45.5016098234,
    car: {
      index: 0,
      driverName: 'Brian Pratt2',
      number: '21',
      teamName: 'Powell Autosport',
      incidentCount: 3,
      currentLap: 4,
      currentLapPct: 0.4205678
    }
  },
  {
    sessionNum: 0,
    sessionTime: 58.591304598,
    car: {
      index: 1,
      driverName: 'Mike Racecar',
      number: '18',
      teamName: 'Gabir Motors',
      incidentCount: 7,
      currentLap: 3,
      currentLapPct: 0.6958742
    }
  }
] */

function keyFor({sessionNum, car: { number, incidentCount }}: IncidentData): string {
  return `s${sessionNum}.c${number}.i${incidentCount}`
}

export function App() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);

  function listen() {
    sdk.receive('incident', (message: IncidentData) => {
      setIncidents(prev => [message, ...prev]);
    });
  }

  useEffect(listen, []);

  return <div className="app-main">
    <section className="incidents">
      <h1>Incidents</h1>
      { 
        incidents.map(incident => <Incident 
          key={keyFor(incident)} 
          incident={incident} />
        )
      }
    </section>
  </div>;
}
