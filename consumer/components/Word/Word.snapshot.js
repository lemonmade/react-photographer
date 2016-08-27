import React from 'react';
import Word from './Word';
import Snapshot from '../../../src/lib/Snapshot';

export default function WordSnapshotTest() {
  return (
    <Snapshot component={Word}>
      <Snapshot name="base">
        <Word>Hi!</Word>
      </Snapshot>
    </Snapshot>
  );
}
