// @flow

import 'core-js/modules/es6.array.find';
import React, {Component} from 'react';
import Tester from './Tester';

import {ActionHelper, getPositionForNode, getTestInformation} from './utilities';
import type {TestSource} from './utilities/tests';

type Props = {
  // TODO
  config: Object,
  tests: TestSource,
};

type ID = string;

type Test = {
  id: ID,
  action?: (actionHelper: ActionHelper) => void | Promise<any>,
  element: React$Element<any>,
};

type State = {
  test?: ?Test,
  tests: Test[],
};

type RunTestMessage = {
  type: 'RUN_TEST',
  test: ID,
};

type SendDetailsMessage = {
  type: 'SEND_DETAILS',
};

function getStateFromProps({tests: sources, config}) {
  return {tests: getTestInformation(sources, config)};
}

export default class Runner extends Component {
  props: Props;
  state: State;
  websocket: WebSocket;

  handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
  handleTestReady = this.handleTestReady.bind(this);

  constructor(props: Props) {
    super(props);
    this.websocket = new WebSocket(`ws://localhost:${props.config.port}${window.location.search}`);
    this.state = getStateFromProps(props);
  }

  send(message: Object) {
    this.websocket.send(JSON.stringify(message));
  }

  handleWebsocketMessage(message: {data: string}) {
    const messageData: RunTestMessage | SendDetailsMessage = JSON.parse(message.data);
    const {type, test} = messageData;
    const {tests} = this.state;

    if (type === 'RUN_TEST') {
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
      // $FlowIgnore: know this is non-null because of the check above
      promise = promise.then(() => test.action(new ActionHelper({node, websocket: this.websocket})));
    }

    promise.then(() => {
      this.send({
        type: 'READY_FOR_MY_CLOSEUP',
        position: getPositionForNode(node),
      });
    });
  }

  componentWillReceiveProps(props: Props) {
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
