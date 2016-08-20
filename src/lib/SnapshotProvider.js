// @flow

import React, {Component, Children} from 'react';

import SnapshotRenderer from './SnapshotRenderer';

type Props = {
  tests: ReactClass[] | React.Element[],
  children?: any,
};

function allChildrenAreSnapshots(element: React.Element): boolean {
  if (Children.count(element.props.children) === 0) { return false; }

  let allSnapshots = true;

  Children.forEach(element.props.children, (child) => {
    allSnapshots = allSnapshots && (child != null) && (child.type.name === 'Snapshot');
  });

  return allSnapshots;
}

type SnapshotDescriptorType = {
  name: string,
  stack: string[],
  children: React.Element,
  action?: (action: Object) => void | Promise,
};

function getSnapshots(element: React.Element, stack = []): SnapshotDescriptorType[] {
  const {component, name, children, action, cases} = element.props;
  const snapshotName = component ? component.name : name;

  if (allChildrenAreSnapshots(element)) {
    const currentStack = snapshotName
      ? [...stack, snapshotName]
      : stack;

    const snapshots = [];

    Children.forEach(children, (child) => {
      snapshots.push(...getSnapshots(child, currentStack));
    });

    return snapshots;
  }

  if (element.type.name !== 'Snapshot') {
    return [];
  }

  if (cases != null) {
    const hasName = (snapshotName != null);
    const currentStack = hasName ? [...stack, snapshotName] : stack;
    const starterCases = hasName
      ? [{name: 'base', stack: currentStack, children}]
      : [];

    return starterCases.concat(cases.map((aCase) => {
      return {
        ...aCase,
        stack: currentStack,
        children,
      };
    }));
  }

  return [{
    stack,
    action,
    children,
    name: snapshotName,
  }];
}

function getWrappedTests(Comp): React.Element {
  if (Comp.render) {
    return Comp.render();
  } else if (Comp.prototype.render) {
    return (new Comp()).render();
  } else if (typeof Comp === 'function') {
    return Comp();
  } else {
    return Comp;
  }
}

export default class SnapshotProvider extends Component {
  props: Props;

  render() {
    const {tests} = this.props;
    const snapshots = tests.reduce((all, Test) => {
      return [...all, ...getSnapshots(getWrappedTests(Test))];
    }, []);

    return <SnapshotRenderer snapshots={snapshots} />;
  }
}
