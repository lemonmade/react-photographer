// @flow

import React from 'react';

import Button from '../../components/Button';
import Snapshot from '../../components/Snapshot';
import SnapshotProvider from '../../components/SnapshotProvider';

export default function Home() {
  return (
    <SnapshotProvider>
      <Snapshot component={Button}>
        <Snapshot name="base">
          <Button>Button</Button>
        </Snapshot>

        <Snapshot
          cases={[
            {name: 'primary'},
            {name: 'primary-hover', action: (button) => button.hover()},
            {name: 'primary-focus', action: (button) => button.focus()},
          ]}
        >
          <Button primary>Button</Button>
        </Snapshot>

        <Snapshot
          cases={[
            {name: 'destructive'},
            {name: 'destructive-hover', action: (button) => button.hover()},
            {name: 'destructive-focus', action: (button) => button.focus()},
          ]}
        >
          <Button destructive>Button</Button>
        </Snapshot>
      </Snapshot>
    </SnapshotProvider>
  );
}
