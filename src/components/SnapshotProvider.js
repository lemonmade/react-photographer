// @flow

import React, {Component, Children} from 'react';
import SnapshotRenderer from './SnapshotRenderer';

type Props = {
  tests: ReactClass[] | React.Element[],
  children?: any,
};

type SnapshotDescriptorType = {
  name: string,
  stack: string[],
  children: React.Element,
  action?: (action: Object) => void | Promise,
};

function allChildrenAreSnapshots(element: React.Element): boolean {
  if (Children.count(element.props.children) === 0) { return false; }

  let allSnapshots = true;

  Children.forEach(element.props.children, (child) => {
    allSnapshots = allSnapshots && (child != null) && (child.type.name === 'Snapshot');
  });

  return allSnapshots;
}

const DEFAULT_CONFIG = {
  record: false,
  skip: false,
  exclusive: false,
  threshold: 0,
  viewports: [{height: 400, width: 400}],
};

function getSnapshots(element: React.Element, stack = [], base = DEFAULT_CONFIG): SnapshotDescriptorType[] {
  if (element.type.name !== 'Snapshot') {
    return [];
  }

  const {component, name, children, action, cases, record, skip, exclusive, viewports, threshold} = element.props;
  const finalViewports = viewports || base.viewports;
  const hasMultipleViewports = (finalViewports.length > 1);
  const snapshotName = component ? component.name : name;
  const newBase = {
    record: record == null ? base.record : record,
    skip: skip == null ? base.skip : skip,
    exclusive: exclusive == null ? base.exclusive : exclusive,
    threshold: threshold == null ? base.threshold : threshold,
  };

  if (allChildrenAreSnapshots(element)) {
    const currentStack = [...stack, snapshotName];
    const snapshots = [];

    Children.forEach(children, (child) => {
      snapshots.push(...getSnapshots(child, currentStack, {...newBase, viewports: finalViewports}));
    });

    return snapshots;
  }

  if (cases != null) {
    const hasName = (snapshotName != null);
    const currentStack = hasName ? [...stack, snapshotName] : stack;
    const starterCases = hasName
      ? finalViewports.map((viewport) => {
        return {
          id: [...currentStack, 'base'].join('-'),
          name: 'base',
          stack: currentStack,
          children,
          viewport,
          hasMultipleViewports,
          ...newBase,
        };
      })
      : [];

    return starterCases.concat(...cases.map((aCase) => {
      return finalViewports.map((viewport) => {
        return {
          id: [...currentStack, aCase.name].join('-'),
          stack: currentStack,
          children,
          viewport,
          hasMultipleViewports,
          ...aCase,
          ...newBase,
        };
      });
    }));
  }

  return finalViewports.map((viewport) => {
    return {
      stack,
      action,
      children,
      name: snapshotName,
      id: [...stack, snapshotName].join('-'),
      viewport,
      hasMultipleViewports,
      ...newBase,
    };
  });
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
    let hasExclusiveTest = false;
    const {tests} = this.props;
    const snapshots = tests.reduce((all, Test) => {
      const newSnapshots = getSnapshots(getWrappedTests(Test));
      if (!hasExclusiveTest) {
        hasExclusiveTest = newSnapshots.some((snapshot) => snapshot.exclusive);
      }
      return [...all, ...newSnapshots];
    }, []);

    if (hasExclusiveTest) {
      snapshots.forEach((snapshot) => {
        snapshot.skip = !snapshot.exclusive;
      });
    }

    return <SnapshotRenderer snapshots={snapshots} />;
  }
}
