import React from 'react';

import { IncidentData } from '@common/index';
import sdk from '@ui/sdk';

// turns 0.78658 to 75.66%
function formatPct(lapPct: number) {
  const rounded = (lapPct * 100).toLocaleString('en-US', { maximumSignificantDigits: 2 })
  return `${rounded}%`
}

export default function Incident(props: { incident: IncidentData }) {
  const { car, sessionTime, sessionNum } = props.incident;
  
  const showReplay = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.showReplay(car.number, sessionTime, sessionNum)
  }

  return <div className="incident">
    <h3>{ car.number } @ Lap { car.currentLap } { formatPct(car.currentLapPct) }</h3>
    <h5>{ car.teamName } / { car.driverName }</h5>
    <a onClick={ showReplay }>Replay</a>
  </div>
}