import 'core-js/modules/es6.array.find';
import * as React from 'react';
import {autobind} from 'core-decorators';

import Tester from './Tester';
import {Descriptor, SnapshotSource} from './types';
import {ID, Config, Messenger, Listener} from '../types';

interface ActionDescriptor {
  id: ID,
  action: Descriptor['action'],
  element: Descriptor['element'],
}

interface State {
  snapshotTests: ActionDescriptor[],
  currentSnapshotTest: ActionDescriptor | null,
}

interface Props {
  config: Config,
  sources: SnapshotSource[],
  messenger: Messenger,
}

export default class Runner extends React.Component<Props, State> {
  listener: Listener;

  @autobind
  private handleWebsocketMessage() {

  }

  @autobind
  private handleTestReady() {

  }

  componentDidMount() {
    this.listener = this.props.messenger.listen(this.handleWebsocketMessage);
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
