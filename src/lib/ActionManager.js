import {getPositionForNode} from './dom';

export default class ActionManager {
  node: HTMLElement;
  websocket: WebSocket;

  constructor({node, websocket}) {
    this.node = node;
    this.websocket = websocket;
  }

  get position() {
    return getPositionForNode(this.node);
  }

  hover() {
    const {websocket} = this;

    return new Promise((resolve) => {
      function listener(message: Object) {
        const messageDetails = JSON.parse(message.data);
        if (messageDetails.performedAction !== 'hover') { return; }
        websocket.removeEventListener('message', listener);
        resolve();
      }

      websocket.addEventListener('message', listener);
      websocket.send(JSON.stringify({
        requestAction: 'hover',
        position: this.position,
      }));
    });
  }
}
