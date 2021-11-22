import React, { useEffect, useState } from 'react';

import sdk from '@ui/sdk';
import Incident from '@ui/components/Incident';
import { IncidentData } from '@common/index';

export function App() {
  const [incidents, setIncidents] = useState<IncidentData[]>([]);

  function listen() {
    sdk.receive('incident', (message: IncidentData) => {
      setIncidents(prev => [...prev, message]);
    });
  }

  useEffect(listen, []);

  return <div>
    {incidents.map(incident => <Incident incident={incident} />)}
  </div>;
}
