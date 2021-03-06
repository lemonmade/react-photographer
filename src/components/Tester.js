// @flow

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

type TestDetails = {
  node: HTMLElement,
};

type Props = {
  children?: React$Element<any>,
  onTestReady?: (details: TestDetails) => any,
};

export default class Tester extends Component {
  props: Props;

  performTest() {
    const {onTestReady, children} = this.props;

    if (children == null || onTestReady == null) {
      return;
    }

    onTestReady({node: ReactDOM.findDOMNode(this).children[0]});
  }

  componentDidMount() {
    this.performTest();
  }

  componentDidUpdate() {
    this.performTest();
  }

  render() {
    const {children} = this.props;
    if (children == null) { return null; }
    return <div>{children}</div>;
  }
}
