// @flow

import React, {Children} from 'react';

import SnapshotRenderer from './SnapshotRenderer';

type Props = {
  children?: any,
};

const SNAPSHOT_NAMES = ['Snapshot', 'SnapshotGroup'];

function allChildrenAreSnapshots(element: React.Element): boolean {
  let allSnapshots = true;

  Children.forEach(element.props.children, (child) => {
    allSnapshots = allSnapshots && (child != null) && (SNAPSHOT_NAMES.includes(child.type.name));
  });

  return allSnapshots;
}

function flatten(array) {
  return array.reduce((all, item) => {
    if (Array.isArray(item)) {
      return [...all, ...item];
    }

    return [...all, item];
  }, []);
}

function renderSnapshot(element: React.Element, stack = []) {
  const {children, name, component, action, cases} = element.props;
  const currentStack = [
    ...stack,
    component ? component.name : name,
  ];

  if (allChildrenAreSnapshots(element)) {
    return (
      <SnapshotRenderer
        path={currentStack}
        snapshots={flatten(Children.map(children, (child) => renderSnapshot(child, currentStack)))}
      />
    );
  }

  if (element.type.name === 'SnapshotGroup') {
    return cases.map(({name, action}) => (
      <SnapshotRenderer path={[...stack, name]} action={action}>
        {children}
      </SnapshotRenderer>
    ));
  }

  return (
    <SnapshotRenderer path={currentStack} action={action}>
      {children}
    </SnapshotRenderer>
  );
}

export default function SnapshotProvider({children}: Props) {
  return renderSnapshot(Children.only(children));
}
