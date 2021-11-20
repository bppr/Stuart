window.api.receive('session-info', (message) => {
  console.log('session-info', message);
})

window.api.receive('telemetry', (message) => {
  console.log('telemetry', message);
})