import {getCenterForNode} from './geometry';
import {ActionHelper, Messenger, Message} from '../../types';

interface PerformedActionMessage extends Message {
  type: 'PERFORMED_ACTION',
  action: string,
}

export default class Actions implements ActionHelper {
  constructor(public node: HTMLElement, private messenger: Messenger) {}

  mousedown(node?: HTMLElement) {
    return this.performAction('mousedown', node);
  }

  hover(node?: HTMLElement) {
    return this.performAction('mouseover', node);
  }

  private performAction(action: string, node = this.node) {
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
        position: getCenterForNode(node),
      });
    });
  }
}
