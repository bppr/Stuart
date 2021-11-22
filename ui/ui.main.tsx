import React from 'react';
import ReactDOM from 'react-dom';

type DriverData = { index: number, name: string, team: string, carNumber: string, incidents: number }
type IncidentData = { timestamp: Date, sessionTime: number, sessionNum: number, driver: DriverData, lapPct: number }

declare var window: WindowWithSDK 

window.api.receive('incident', (message: IncidentData) => {
  console.log('incident', message);
})

function App() {
  return <div>Hello!</div>
}

const element = document.getElementById('application');

console.log(element);

ReactDOM.render(<App />, element);