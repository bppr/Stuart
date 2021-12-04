import React from 'react';

import * as sdk from '../sdk';
import { Incident as BackendIncident } from '../../common/incident';

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
  incident: BackendIncident
}) {
  const car = props.incident.data.car;
  const incidentType = props.incident.data.type ? `: ${props.incident.data.type}` : ''
  
  // call back to main process, which calls irsdk to jump to correct car/time
  const showReplay = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.replay(props.incident.data)
  }

  const acknowledgeIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.acknowledgeIncident(props.incident.id);
  }

  const dismissIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.dismissIncident(props.incident.id);
  }

  const unresolveIncident = (ev: React.MouseEvent) => {
    ev.preventDefault()
    sdk.unresolveIncident(props.incident.id);
  }

  // compute classes for element styling (see styles/app.css)
  // filter conditional values
  const classNames = [
    'incident', 
    props.incident.resolution != undefined && 'resolved', 
    props.incident.resolution == 'Acknowledged' && 'tallied'
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
        { props.incident.resolution == undefined && <a onClick={ acknowledgeIncident } title="Tally Incident">✔️</a> }
        { props.incident.resolution == undefined && <a onClick={ dismissIncident } title="Dismiss Incident">❌</a> }
        { props.incident.resolution != undefined && <a onClick={ unresolveIncident } title="Unresolve Incident">👀</a> }
      </div>
    </div>

    <h5>Team: { car.teamName }, Driver: { car.driverName }.</h5>
  </div>
}