// @flow

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

type Props = {
  snapshots: Object[],
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
    const {snapshots} = this.props;
    const {currentSnapshot} = this.state;
    const {name, stack, action, children} = snapshots[currentSnapshot];

    console.log(`rendering ${[...stack, name].join(' > ')}`);

    if (typeof action === 'function') {
      action(new ActionManager(ReactDOM.findDOMNode(this).children[0]));
    }

    if (currentSnapshot < snapshots.length - 1) {
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
    const {snapshots} = this.props;
    const {currentSnapshot} = this.state;

    return <div>{snapshots[currentSnapshot].children}</div>;
  }
}
