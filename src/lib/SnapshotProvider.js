// @flow

import React, {Component, Children} from 'react';

import SnapshotRenderer from './SnapshotRenderer';

type Props = {
  children?: any,
};

function allChildrenAreSnapshots(element: React.Element): boolean {
  let allSnapshots = true;

  Children.forEach(element.props.children, (child) => {
    allSnapshots = allSnapshots && (child != null) && (child.type.name === 'Snapshot');
  });

  return allSnapshots;
}

function getSnapshots(element: React.Element, stack = []) {
  const {component, name, children, action, cases} = element.props;
  const snapshotName = component ? component.name : name;

  if (allChildrenAreSnapshots(element)) {
    const currentStack = [...stack, snapshotName];
    const snapshots = [];

    Children.forEach(children, (child) => {
      snapshots.push(...getSnapshots(child, currentStack));
    });

    return snapshots;
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

export default class SnapshotProvider extends Component {
  props: Props;
  snapshots: Object[];

  render() {
    return <SnapshotRenderer snapshots={getSnapshots(Children.only(this.props.children))} />;
  }
}
