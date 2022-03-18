import { IncidentData, Resolution } from '../../common/incident';

export type Incident = {
  // a unique ID for this incident
  id: number;
  // the current status of this incident
  resolution: Resolution;
  // the details of this incident
  data: IncidentData;
  // changes the resolution of this incident to the given value, updating any state as necessary.
  resolve: (_: Resolution) => void;
};
