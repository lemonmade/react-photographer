// @flow

import React from 'react';

import Button from '../../components/Button';
import Snapshot from '../../components/Snapshot';
import SnapshotGroup from '../../components/SnapshotGroup';
import SnapshotProvider from '../../components/SnapshotProvider';

export default function Home() {
  return (
    <SnapshotProvider>
      <Snapshot component={Button}>
        <Snapshot name="base">
          <Button>Button</Button>
        </Snapshot>

        <Snapshot name="primary">
          <Button primary>Button</Button>
        </Snapshot>

        <SnapshotGroup
          cases={[
            {name: 'destructive'},
            {name: 'destructive-focus', action: (button) => button.focus()},
          ]}
        >
          <Button destructive>Button</Button>
        </SnapshotGroup>
      </Snapshot>
    </SnapshotProvider>
  );
}
