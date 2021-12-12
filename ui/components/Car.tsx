import React from 'react';

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

       return <div>
           <a title={collapsed ? "Expand" : "Collapse"} onClick={toggleExpander}>{collapsed ? "▶" : "▼"}</a>
           {car.driverName + " (" + acknowledgedIncidents.length + ")"}
           {!collapsed && createIncidentList(acknowledgedIncidents)}
       </div>;
}

function createIncidentList(incidents: Incident[]) {
    return <div>
        {
            incidents.map((inc) => {
                <p>{getIncidentIcon(inc) +
                    " " + inc.data.type +
                    " (Lap: " + inc.data.car.currentLap +
                    ")"}</p>
            })
        }
    </div>;
}