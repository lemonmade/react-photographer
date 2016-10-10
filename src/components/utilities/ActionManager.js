// @flow

import {getPositionForNode} from './dom';
import type {Rect} from '../../utilities/geometry';

export default class ActionManager {
  node: HTMLElement;
  websocket: WebSocket;

  constructor({node, websocket, name}: {node: HTMLElement, websocket: WebSocket}) {
    this.node = node;
    this.websocket = websocket;
    this.name = name;
  }

  get position(): Rect {
    return getPositionForNode(this.node);
  }

  performAction(action: string) {
    const {websocket, name} = this;

    return new Promise((resolve) => {
      function listener(message: Object) {
        const messageDetails = JSON.parse(message.data);
        if (messageDetails.action !== action) { return; }

        websocket.removeEventListener('message', listener);

        if (name === 'Button-base-hover') {
          console.log('Received action: ' + messageDetails.action + ' while waiting for ' + action);
        }

        resolve();

        if (name === 'Button-base-hover') {
          console.log('resolved');
        }
      }

      websocket.addEventListener('message', listener);
      websocket.send(JSON.stringify({
        type: 'REQUEST_ACTION',
        action,
        name,
        position: this.position,
      }));
    });
  }

  mousedown() {
    return this.performAction('mousedown');
  }

  hover() {
    return this.performAction('hover');
  }
}
