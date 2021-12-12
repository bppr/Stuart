import React from 'react';

import * as sdk from '../sdk';
import { Incident, IncidentCar as Car } from '../../common/incident';
import { getIncidentIcon } from './Incident';

// Displays a list of incidents for a specific driver

export default function CarIncidents(props: {
    incidents: Incident[]
}) {

    let [collapsed, setCollapsed] = React.useState(true);
    let [showDismissed, setShowDismissed] = React.useState(false);

    let car = props.incidents[0].data.car;

    let incidents = props.incidents;
    incidents
        .sort((a, b) => {
            // sort by timestamp (i.e., sessionNum first, then sessionTime)

            let comp1 = a.data.sessionNum - b.data.sessionNum;
            if (comp1 != 0) return comp1;
            return a.data.sessionTime - b.data.sessionTime;
        });

    let acknowledgedIncidents = incidents.filter(
        (inc) => inc.resolution == "Acknowledged");

    const toggleExpander = (ev: React.MouseEvent) => {
        ev.preventDefault()
        setCollapsed(!collapsed);
    }

    // return <p>:)</p>;

    let childDivStyle = {
        display: "block"
    };
    if (collapsed) {
        childDivStyle.display = "none";
    }

    return <div className="carIncidents">
        <a title={collapsed ? "Expand" : "Collapse"} onClick={toggleExpander}>{collapsed ? "▶" : "▼"}</a>
        {car.driverName + " (" + acknowledgedIncidents.length + ")"}
        <div style={childDivStyle}>
            {
                acknowledgedIncidents.map((inc) => <CarIncident
                    key={inc.id}
                    incident={inc} />
                )
            }
        </div>
    </div>;
}

function CarIncident(props: {
    incident: Incident
}) {
    // call back to main process, which calls irsdk to jump to correct car/time
    const showReplay = (ev: React.MouseEvent) => {
        ev.preventDefault()
        sdk.replay(props.incident.data)
    }

    const unresolveIncident = (ev: React.MouseEvent) => {
        ev.preventDefault()
        sdk.unresolveIncident(props.incident.id);
    }

    let inc = props.incident;
    return <div className="carIncident">
        {
            <div>
                <p>{getIncidentIcon(inc) +
                    " " + inc.data.type +
                    " (Lap: " + inc.data.car.currentLap +
                    ")"}</p>
                <div className="incident-controls">
                    <a title="Show Replay" onClick={showReplay}>🔍</a>
                    <a onClick={unresolveIncident} title="Unresolve Incident">↩️</a>
                </div>
            </div>

        }
    </div>;
}