import { Observer, Outbox, AppState } from '../state';

export class NotifyOfSessionChanged implements Observer {
  constructor(private outbox: Outbox) { }

  onUpdate(prevState: AppState, newState: AppState) {
    if (prevState.sessionNum < newState.sessionNum) {
      // TODO: we can look up the session types here so the UI can be smorter about practice, etc
      this.outbox.send('session-changed', {
        previous: prevState.sessionNum,
        current: newState.sessionNum
      });
    }
  }
}
