// @flow

import React, {Children} from 'react';

import SnapshotRenderer from './SnapshotRenderer';

type Props = {
  children?: any,
};

function renderSnapshot(element: React.Element, stack = []) {
  const {props} = element;

  if (element.type.name !== 'Snapshot' || props == null) {
    return element;
  }

  const {children, name, component, action} = props;
  const currentStack = [
    ...stack,
    component ? component.name : name,
  ];

  return (
    <SnapshotRenderer path={currentStack} action={action}>
      {Children.map(children, (child) => renderSnapshot(child, currentStack))}
    </SnapshotRenderer>
  );
}

export default function SnapshotProvider({children}: Props) {
  return renderSnapshot(Children.only(children));
}
