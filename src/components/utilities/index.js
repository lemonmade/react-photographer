// @flow

import {Rect} from '../../utilities/geometry';

export {default as getTestInformation} from './tests';

export function getPositionForNode(node: HTMLElement) {
  return new Rect({
    y: node.offsetTop,
    x: node.offsetLeft,
    height: node.offsetHeight,
    width: node.offsetWidth,
  });
}

export class ActionHelper {
  node: HTMLElement;
  websocket: WebSocket;

  constructor({node, websocket}: {node: HTMLElement, websocket: WebSocket}) {
    this.node = node;
    this.websocket = websocket;
  }

  get position(): Rect {
    return getPositionForNode(this.node);
  }

  performAction(action: string) {
    const {websocket} = this;

    return new Promise((resolve) => {
      websocket.addEventListener('message', function listener(message: Object) {
        const messageDetails = JSON.parse(message.data);
        if (messageDetails.action !== action) { return; }
        websocket.removeEventListener('message', listener);
        resolve();
      });

      websocket.send(JSON.stringify({
        type: 'REQUEST_ACTION',
        action,
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
