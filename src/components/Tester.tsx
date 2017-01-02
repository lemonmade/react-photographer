import * as React from 'react';
import {findDOMNode} from 'react-dom';

interface TestDetails<E extends Element> {
  node: E,
}

interface Props {
  children?: React.ReactNode,
  onReady: <E extends Element>(details: TestDetails<E>) => void,
}

export default class Tester extends React.Component<Props, {}> {
  private performTest() {
    const {onReady, children} = this.props;

    if (children == null) { return; }

    onReady({
      node: findDOMNode(this).children[0],
    })
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
