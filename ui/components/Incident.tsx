import React from 'react';

import * as sdk from '../sdk';
import { IncidentRecord } from './App';

// turns 0.78658 to 75.66%
function formatPct(lapPct: number, decimals: number = 2) {
  const rounded = (lapPct * 100).toLocaleString('en-US', { 
    maximumSignificantDigits: 2 + decimals 
  })
  
  return `${rounded}%`
}

type IncidentHandler = () => void

// a component for displaying an incident
// allows tally/dismiss/resolve via props.onTally, props.onDismiss, props.onResolve
// prop: incident, a record for an incident including its resolution state
export default function Incident(props: { 
  incident: IncidentRecord, 
  onTally: IncidentHandler, 
  onDismiss: IncidentHandler,
  unresolve: IncidentHandler
}) {
  const car = props.incident.car;
  const incidentType = props.incident.type ? `: ${props.incident.type}` : ''
  
  // call back to main process, which calls irsdk to jump to correct car/time
  const showReplay = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.replay(props.incident)
  }

  // compute classes for element styling (see styles/app.css)
  // filter conditional values
  const classNames = [
    'incident', 
    props.incident.resolved && 'resolved', 
    props.incident.tallied && 'tallied'
  ].filter(n => n)

  // define the element returned by our component
  return <div className={classNames.join(' ')}>
    <div className="incident-header">
      <div className="incident-deets">
        <h2>Car #{ car.number }{ incidentType }</h2>
        <h4 className="incident-count">{ car.incidentCount }x</h4>
        <h5>Lap { car.currentLap } / { formatPct(car.currentLapPct) }</h5>
      </div>

      <div className="incident-controls">
        <a title="Show Replay" onClick={ showReplay }>🎥</a>
        { !props.incident.resolved && <a onClick={props.onTally} title="Tally Incident">➕</a> }
        { !props.incident.resolved && <a onClick={props.onDismiss} title="Dismiss Incident">🙈</a> }
        { props.incident.resolved && <a onClick={props.unresolve} title="Unresolve Incident">👀</a>}
      </div>
    </div>

    <h5>Team: { car.teamName }, Driver: { car.driverName }.</h5>
  </div>
}