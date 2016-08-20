// @flow

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

type Props = {
  snapshots: Object[],
};

type State = {
  currentSnapshot: number,
  runningTest: boolean,
};

function getPositionForNode(node: HTMLElement) {
  return {
    y: node.offsetTop,
    x: node.offsetLeft,
    height: node.offsetHeight,
    width: node.offsetWidth,
  };
}

class ActionManager {
  node: HTMLElement;
  websocket: WebSocket;

  constructor({node, websocket}) {
    this.node = node;
    this.websocket = websocket;
  }

  hover() {
    const {websocket} = this;

    return new Promise((resolve) => {
      const listener = (message: Object) => {
        const messageDetails = JSON.parse(message.data);
        if (messageDetails.performedAction !== 'hover') { return; }
        websocket.removeEventListener('message', listener);
        resolve();
      };

      websocket.addEventListener('message', listener);
      websocket.send(JSON.stringify({
        requestAction: 'hover',
      }));
    });
  }

  focus() {
    console.log(this.node);
    this.node.focus();
  }
}

export default class SnapshotRenderer extends Component {
  props: Props;
  state: State = {currentSnapshot: 0, runningTest: false};
  websocket: WebSocket;

  async makeProgress() {
    const {snapshots} = this.props;
    const {currentSnapshot} = this.state;
    const {websocket} = this;
    const {name, stack, action} = snapshots[currentSnapshot];
    const node = ReactDOM.findDOMNode(this).children[0];

    console.log(`rendering ${[...stack, name].join(' > ')}`);

    if (typeof action === 'function') {
      await action(new ActionManager({node, websocket}));
    }

    websocket.send(JSON.stringify({
      readyForMyCloseup: true,
      name,
      position: getPositionForNode(node),
    }));
  }

  componentDidUpdate() {
    if (!this.state.runningTest) { return; }
    this.makeProgress();
  }

  componentDidMount() {
    const websocket = this.websocket = new WebSocket('ws://localhost:3000/');

    websocket.addEventListener('open', () => {
      websocket.send(JSON.stringify({testCount: this.props.snapshots.length}));
    });

    websocket.addEventListener('message', (message: Object) => {
      console.log(`WEBSOCKET RECEIVED MESSAGE: ${message.data}`);
      const messageDetails = JSON.parse(message.data);
      if (messageDetails.runTest != null) {
        this.setState({
          runningTest: true,
          currentSnapshot: messageDetails.runTest,
        });
      }
    });
  }

  render() {
    const {snapshots} = this.props;
    const {currentSnapshot, runningTest} = this.state;

    if (!runningTest) {
      return <div id="SnapshotContainer" />;
    }

    return <div id="SnapshotContainer">{snapshots[currentSnapshot].children}</div>;
  }
}
