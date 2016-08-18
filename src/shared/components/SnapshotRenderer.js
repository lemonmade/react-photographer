// @flow

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

type Props = {
  children?: any,
  path: string[],
  action?: () => void,
};

class ActionManager {
  node: HTMLElement;

  constructor(node: HTMLElement) {
    this.node = node;
  }

  hover() {
  }

  focus() {
    console.log(this.node);
    this.node.focus();
  }
}

export default class SnapshotRenderer extends Component {
  props: Props;

  componentDidMount() {
    const {path, action} = this.props;
    if (typeof action === 'function') {
      action(new ActionManager(ReactDOM.findDOMNode(this).children[0]));
    }

    console.log(`rendering ${path.join(' > ')}`);
  }

  render() {
    const {children} = this.props;
    return <div>{children}</div>;
  }
}
