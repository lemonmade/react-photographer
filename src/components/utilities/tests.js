// @flow

import {Children} from 'react';

import Snapshot from '../Snapshot';
import type {Props as SnapshotProps} from '../Snapshot';
import type {SnapshotDescriptor, Viewport} from '../../types';

export type TestSource = Object[];

type BaseDescriptor = {
  record: boolean,
  skip: boolean,
  exclusive: boolean,
  groups: string[],
  threshold: number,
  viewports: Viewport[],
  component?: string,
};

/* eslint-env node */

export default function getTestInformation(
  sources: TestSource,
  {record, threshold, viewports}: BaseDescriptor,
) {
  let hasExclusiveTest = false;
  const baseDescriptor = {
    record,
    threshold,
    viewports,
    skip: false,
    exclusive: false,
    groups: [],
  };

  const tests = sources.reduce((all, Test) => {
    const newTests = getTestInformationFromElement(getElement(Test), baseDescriptor);
    if (!hasExclusiveTest) {
      hasExclusiveTest = newTests.some((test) => test.exclusive);
    }
    return all.concat(newTests);
  }, []);

  if (hasExclusiveTest) {
    tests.forEach((test) => { test.skip = !test.exclusive; });
  }

  return tests;
}

function getTestInformationFromElement(
  element: React$Element<{props: SnapshotProps}>,
  base: BaseDescriptor,
): SnapshotDescriptor[] {
  if (element.type !== Snapshot) {
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
      snapshots.push(...getTestInformationFromElement(child, {...newBase, viewports: finalViewports}));
    });

    return snapshots;
  }

  if (cases != null) {
    const hasName = (name != null);

    if (hasName) {
      newBase.groups = [...base.groups, name];
    }

    const baseID = [newBase.component, ...newBase.groups].join('-');

    const starterCases = hasName
      ? finalViewports.map((viewport) => {
        return {
          id: `${baseID}-base-${viewport.width}x${viewport.height}`,
          name: 'base',
          element: children,
          viewport,
          hasMultipleViewports,
          ...newBase,
        };
      })
      : [];

    return starterCases.concat(...cases.map((aCase) => {
      return finalViewports.map((viewport) => {
        return {
          id: `${baseID}-${aCase.name}-${viewport.width}x${viewport.height}`,
          ...aCase,
          element: children,
          viewport,
          hasMultipleViewports,
          ...newBase,
        };
      });
    }));
  }

  const baseID = [newBase.component, ...newBase.groups, name].join('-');

  return finalViewports.map((viewport) => {
    return {
      id: `${baseID}-${viewport.width}x${viewport.height}`,
      name,
      action,
      element: children,
      viewport,
      hasMultipleViewports,
      ...newBase,
    };
  });
}

function getElement(Comp: any): React$Element<*> {
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

function allChildrenAreSnapshots(element: React$Element<>): boolean {
  if (Children.count(element.props.children) === 0) { return false; }

  let allSnapshots = true;

  Children.forEach(element.props.children, (child) => {
    allSnapshots = allSnapshots && (child != null) && (child.type === Snapshot);
  });

  return allSnapshots;
}
