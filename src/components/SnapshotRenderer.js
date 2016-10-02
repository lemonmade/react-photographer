// @flow

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import ActionManager from './utilities/ActionManager';
import {getPositionForNode} from './utilities/dom';

type Props = {
  snapshots: Object[],
};

type State = {
  currentSnapshot: number,
  runningTest: boolean,
};

export default class SnapshotRenderer extends Component {
  props: Props;
  state: State = {currentSnapshot: 0, runningTest: false};
  websocket: WebSocket;
  handleWebSocketOpen: () => void = this.handleWebSocketOpen.bind(this);
  handleWebSocketMessage: () => void = this.handleWebSocketMessage.bind(this);

  makeProgress() {
    const {snapshots} = this.props;
    const {currentSnapshot} = this.state;
    const {websocket} = this;
    const {action} = snapshots[currentSnapshot];
    const node = ReactDOM.findDOMNode(this).children[0];

    const promise = Promise.resolve();

    if (typeof action === 'function') {
      promise.then(() => action(new ActionManager({node, websocket})));
    }

    promise.then(() => {
      websocket.send(JSON.stringify({
        type: 'READY_FOR_MY_CLOSEUP',
        position: getPositionForNode(node),
      }));
    });
  }

  handleWebSocketOpen() {
    const snapshots = this.props.snapshots.map((snapshot) => {

      // We want to leave these unused because we just want to extract the
      // serializable parts of the config for the test.
      // eslint-disable-next-line no-unused-vars
      const {children, action, ...rest} = snapshot;

      return rest;
    });

    this.websocket.send(JSON.stringify({
      type: 'TEST_DETAILS',
      tests: snapshots,
    }));
  }

  handleWebSocketMessage(message: Object) {
    const messageDetails = JSON.parse(message.data);
    if (messageDetails.type === 'RUN_TEST') {
      this.setState({
        runningTest: true,
        currentSnapshot: messageDetails.test,
      });
    }
  }

  componentDidUpdate() {
    if (!this.state.runningTest) { return; }
    this.makeProgress();
  }

  componentDidMount() {
    const websocket = this.websocket = new WebSocket('ws://localhost:3000/');

    websocket.addEventListener('open', this.handleWebSocketOpen);
    websocket.addEventListener('message', this.handleWebSocketMessage);
  }

  componentWillUnmount() {
    this.websocket.removeEventListener('open', this.handleWebSocketOpen);
    this.websocket.removeEventListener('message', this.handleWebSocketMessage);
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
