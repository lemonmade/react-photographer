// @flow

import React, {Component, Children} from 'react';
import SnapshotRenderer from './SnapshotRenderer';
import type {Props as SnapshotProps} from './Snapshot';
import type {SnapshotDescriptorType, ViewportType} from '../types';

type Props = {
  tests: ReactClass[] | React.Element[],
  children?: any,
};

type BaseDescriptorType = {
  record: boolean,
  skip: boolean,
  exclusive: boolean,
  groups: string[],
  threshold: number,
  viewports: ViewportType[],
  component?: string,
}

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
  groups: [],
  threshold: 0,
  viewports: [{height: 400, width: 400}],
};

function getSnapshots(
  element: React.Element<{props: SnapshotProps}>,
  base: BaseDescriptorType = DEFAULT_CONFIG
): SnapshotDescriptorType[] {
  if (element.type.name !== 'Snapshot') {
    return [];
  }

  const {component, name, children, action, cases, record, skip, exclusive, viewports, threshold} = element.props;
  const finalViewports = viewports || base.viewports;
  const hasMultipleViewports = (finalViewports.length > 1);

  const newBase = {
    component: component == null ? base.component : component.name,
    record: record == null ? base.record : record,
    skip: skip == null ? base.skip : skip,
    exclusive: exclusive == null ? base.exclusive : exclusive,
    threshold: threshold == null ? base.threshold : threshold,
    groups: base.groups,
  };

  if (allChildrenAreSnapshots(element)) {
    newBase.groups = name == null ? base.groups : [...base.groups, name];
    const snapshots = [];

    Children.forEach(children, (child) => {
      snapshots.push(...getSnapshots(child, {...newBase, viewports: finalViewports}));
    });

    return snapshots;
  }

  if (cases != null) {
    const hasName = (name != null);

    if (hasName) {
      newBase.groups = [...base.groups, name];
    }

    const starterCases = hasName
      ? finalViewports.map((viewport) => {
        return {
          name: 'base',
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
          ...aCase,
          children,
          viewport,
          hasMultipleViewports,
          ...newBase,
        };
      });
    }));
  }

  return finalViewports.map((viewport) => {
    return {
      name,
      action,
      children,
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
