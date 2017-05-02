import {getCenterForNode} from './geometry';
import {ActionHelper, Messenger, Message} from '../../types';

interface PerformedActionMessage extends Message {
  type: 'PERFORMED_ACTION',
  action: string,
}

export default class Actions implements ActionHelper {
  constructor(public node: HTMLElement, private messenger: Messenger) {}

  mousedown() {
    return this.performAction('mousedown');
  }

  hover() {
    return this.performAction('mouseover');
  }

  private performAction(action: string) {
    const {messenger} = this;

    return new Promise<void>((resolve) => {
      const listener = messenger.listen((message) => {
        if (message.type !== 'PERFORMED_ACTION' || (message as PerformedActionMessage).action !== action) { return; }
        listener.stop();
        resolve();
      });

      messenger.send({
        type: 'REQUEST_ACTION',
        action,
        position: getCenterForNode(this.node),
      });
    });
  }
}
