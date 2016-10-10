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
  handleWebSocketMessage: () => void = this.handleWebSocketMessage.bind(this);

  makeProgress() {
    const {snapshots} = this.props;
    const {currentSnapshot} = this.state;
    const {websocket} = this;
    const snapshot = snapshots[currentSnapshot];
    const {action, component, name, groups} = snapshot;
    const node = ReactDOM.findDOMNode(this).children[0];

    const promise = Promise.resolve();
    const id = [component, ...groups, name].join('-');

    if (typeof action === 'function') {
      if (id === 'Button-base-hover') {
        console.log(action);
      }

      promise.then(() => action(new ActionManager({node, websocket, name: id})));
    }

    promise.catch((error) => {
      console.log(error);
    });

    if (id === 'Button-base-hover') {
      promise.then(() => console.log('FINISHED button-base-hover action'));
    }

    promise.then(() => {
      if (id === 'Button-base-hover') {
        console.log('FINISHED button-base-hover action');
      }

      websocket.send(JSON.stringify({
        type: 'READY_FOR_MY_CLOSEUP',
        position: getPositionForNode(node),
      }));
    });
  }

  handleWebSocketMessage(message: Object) {
    const messageDetails = JSON.parse(message.data);
    if (messageDetails.type === 'RUN_TEST') {
      this.setState({
        runningTest: true,
        currentSnapshot: messageDetails.test,
      });
    } else if (messageDetails.type === 'SEND_DETAILS') {
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
  }

  componentDidUpdate() {
    if (!this.state.runningTest) { return; }
    this.makeProgress();
  }

  componentDidMount() {
    const websocket = this.websocket = new WebSocket('ws://localhost:3000/');
    websocket.addEventListener('message', this.handleWebSocketMessage);
  }

  componentWillUnmount() {
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
