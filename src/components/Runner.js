import 'core-js/modules/es6.array.find';
import React, {Component} from 'react';
import Tester from './Tester';

import {ActionHelper, getPositionForNode, getTestInformation} from './utilities';
import type {TestSourceType} from './utilities/tests';

type Props = {
  config: Object, // TODO
  tests: TestSourceType,
};

function getStateFromProps({tests: sources, config}) {
  return {tests: getTestInformation(sources, config)};
}

export default class Runner extends Component {
  props: Props;

  handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
  handleTestReady = this.handleTestReady.bind(this);

  constructor(props) {
    super(props);
    this.websocket = new WebSocket(`ws://localhost:${props.config.port}${window.location.search}`);
    this.state = getStateFromProps(props);
  }

  send(message) {
    this.websocket.send(JSON.stringify(message));
  }

  handleWebsocketMessage(message) {
    const {type, test} = JSON.parse(message.data);
    const {tests} = this.state;
    console.log(`Received message on client: ${message.data}`);

    if (type === 'RUN_TEST') {
      window.CURRENT_TEST = test;
      this.setState({
        test: tests.find(({id}) => id === test),
      });
    } else if (type === 'SEND_DETAILS') {
      this.send({
        type: 'TEST_DETAILS',
        // eslint-disable-next-line no-unused-vars
        tests: tests.map(({element, action, ...rest}) => rest),
      });
    }
  }

  handleTestReady({node}: {node: HTMLElement}) {
    const {test} = this.state;
    if (test == null) { return; }

    let promise = Promise.resolve();

    if (typeof test.action === 'function') {
      promise = promise.then(() => test.action(new ActionHelper({node, websocket: this.websocket})));
    }

    promise.then(() => {
      this.send({
        type: 'READY_FOR_MY_CLOSEUP',
        position: getPositionForNode(node),
      });
    });
  }

  componentWillReceiveProps(props) {
    this.setState(getStateFromProps(props));
  }

  componentDidMount() {
    this.websocket.addEventListener('message', this.handleWebsocketMessage);
  }

  componentWillUnmount() {
    this.websocket.removeEventListener('message', this.handleWebsocketMessage);
  }

  render() {
    const {test} = this.state;

    if (test == null) { return null; }

    return (
      <Tester onTestReady={this.handleTestReady}>
        {test.element}
      </Tester>
    );
  }
}
