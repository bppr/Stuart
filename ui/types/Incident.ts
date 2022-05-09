import { Incident } from '../../common/incident';

export type Resolution = "Unresolved" | "Acknowledged" | "Dismissed" | "Penalized" | "Deleted";

export type IncidentRecord = {
  // a unique ID for this incident
  id: number;
  // the current status of this incident
  resolution: Resolution;
  // the details of this incident
  data: Incident;
  // changes the resolution of this incident to the given value, updating any state as necessary.
  resolve: (_: Resolution) => void;
};
