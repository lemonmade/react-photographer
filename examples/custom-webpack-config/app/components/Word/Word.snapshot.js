import React from 'react';
import Snapshot from 'react-snapshots';
import Word from './Word';

export default function WordSnapshotTest() {
  return (
    <Snapshot component={Word}>
      <Snapshot name="base">
        <Word>Hi!</Word>
      </Snapshot>
    </Snapshot>
  );
}
