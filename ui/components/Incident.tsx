import React from 'react';

import { IncidentData } from '@common/index';
import * as sdk from '@ui/sdk';

// turns 0.78658 to 75.66%
function formatPct(lapPct: number, decimals: number = 2) {
  const rounded = (lapPct * 100).toLocaleString('en-US', { 
    maximumSignificantDigits: 2 + decimals 
  })
  
  return `${rounded}%`
}

export default function Incident(props: { incident: IncidentData }) {
  const car = props.incident.car;

  let incidentTypeStr = "";
  if(props.incident.type) {
    incidentTypeStr = ": " + props.incident.type;
  }
  
  const showReplay = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.replay(props.incident)
  }

  return <div className="incident">
    <div className="incident-header">
      <div className="incident-deets">
        <h2>Car #{ car.number }{ incidentTypeStr }</h2>
        <h4 className="incident-count">{ car.incidentCount }x</h4>
        <h5>Lap { car.currentLap } / { formatPct(car.currentLapPct) }</h5>
      </div>

      <div className="incident-controls">
        <a title="Show Replay" onClick={ showReplay }>🎥</a>
        <a title="Tally Incident">➕</a>
        <a title="Dismiss Incident">🙈</a>
      </div>
    </div>

    <h5>Team: { car.teamName }, Driver: { car.driverName }.</h5>
  </div>
}