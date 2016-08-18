// @flow

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

type Props = {
  children?: any,
  path: string[],
  action?: () => void,
  snapshots?: React.Element[],
};

type State = {
  currentSnapshot: number,
};

class ActionManager {
  node: HTMLElement;

  constructor(node: HTMLElement) {
    this.node = node;
  }

  hover() {
  }

  focus() {
    this.node.focus();
  }
}

export default class SnapshotRenderer extends Component {
  props: Props;
  state: State = {currentSnapshot: 0};

  makeProgress() {
    const {path, action, snapshots} = this.props;
    const {currentSnapshot} = this.state;

    if (snapshots == null) {
      console.log(`rendering ${path.join(' > ')}`);
    }

    if (typeof action === 'function') {
      action(new ActionManager(ReactDOM.findDOMNode(this).children[0]));
    }

    if (snapshots != null && currentSnapshot < snapshots.length - 1) {
      setTimeout(() => this.setState({currentSnapshot: currentSnapshot + 1}), 500);
    }
  }

  componentDidUpdate() {
    this.makeProgress();
  }

  componentDidMount() {
    this.makeProgress();
  }

  render() {
    const {children, snapshots} = this.props;

    if (snapshots == null) {
      return <div>{children}</div>;
    } else {
      return snapshots[this.state.currentSnapshot];
    }
  }
}
