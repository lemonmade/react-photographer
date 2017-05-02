import 'babel-polyfill';
import * as React from 'react';
import {autobind} from 'core-decorators';

import Tester from './Tester';
// import Actions from './actions';
import getDescriptors from './utilities/descriptors';
import {getRectForNode} from './utilities/geometry';

import {Descriptor, SnapshotSource} from './types';
import {ID, Config, Messenger, Listener, Message} from '../types';

interface State {
  snapshotTests: Descriptor[],
  currentSnapshotTest: Descriptor | null,
}

interface Props {
  config: Config,
  sources: SnapshotSource[],
}

interface RunTestMessage extends Message {
  id: ID,
  type: 'RUN_TEST',
}

export default class Runner extends React.Component<Props, State> {
  private listener: Listener;
  private messenger: Messenger;

  constructor(props: Props) {
    super();
    this.state = {
      snapshotTests: props.sources.reduce((tests: Descriptor[], source) => {
        return tests.concat(getDescriptors(source, props.config));
      }, []),
      currentSnapshotTest: null,
    };
  }

  @autobind
  private handleWebsocketMessage(message: Message) {
    const {snapshotTests} = this.state;

    switch (message.type) {
      case 'RUN_TEST':
        const {id} = message as RunTestMessage;
        this.setState({
          currentSnapshotTest: snapshotTests.find((test) => test.id === id),
        } as State);
        break;
      case 'SEND_DETAILS':
        this.messenger.send({
          type: 'TEST_DETAILS',
          tests: snapshotTests.map(({element: _element, action: _action, ...rest}) => rest as {[key: string]: any}),
        });
        break;
    }
  }

  @autobind
  private async handleTestReady({node}: {node: HTMLElement}) {
    const {currentSnapshotTest} = this.state;
    if (currentSnapshotTest == null) { return; }

    if (typeof currentSnapshotTest.action === 'function') {
      // TODO
      // await currentSnapshotTest.action(new Actions(node, this.messenger));
    }

    this.messenger.send({
      type: 'READY_FOR_MY_CLOSEUP',
      position: getRectForNode(node),
    });
  }

  componentDidMount() {
    const {config} = this.props;

    this.messenger = new SocketMessenger(
      new WebSocket(`ws:${config.host}:${config.port}${window.location.search}`),
    );
    this.listener = this.messenger.listen(this.handleWebsocketMessage);
  }

  componentWillUnmount() {
    this.listener.stop();
  }

  render() {
    const {currentSnapshotTest} = this.state;
    if (currentSnapshotTest == null) { return null; }

    return (
      <Tester onReady={this.handleTestReady}>
        {currentSnapshotTest.element}
      </Tester>
    );
  }
}

class SocketMessenger implements Messenger {
  constructor(private socket: WebSocket) {}

  listen(callback: (message: Message) => void): Listener {
    const {socket} = this;

    function listener({data}: {data: string}) {
      const message = JSON.parse(data);
      if (message.photographer) {
        callback(message as Message);
      }
    }

    socket.addEventListener('message', listener);

    return {
      stop() {
        socket.removeEventListener('message', listener as any);
      },
    };
  }

  send(message: Message) {
    this.socket.send(JSON.stringify({
      photographer: true,
      ...message,
    }));
  }
}
