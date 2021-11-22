import watch, { notifyOfIncident, notifyOfSessionChanged } from './state';

const mockOutbox = { 
  send(channel: string, msg: any) { console.log(channel, msg) }
}

const config = {
  minPitStopTime: 35,
  observers: [notifyOfIncident, notifyOfSessionChanged]
}

const mockSDK = {
  on(s: string, fn: any) {}
}

const [onTelemetryUpdate, onSessionUpdate] = watch(mockOutbox, config);

mockSDK.on('Telemetry', onTelemetryUpdate);
mockSDK.on('SessionInfo', onSessionUpdate)
