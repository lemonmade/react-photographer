import React from 'react';
import Button from './Button';
import Snapshot from '../../../src/lib/Snapshot';

export default function ButtonSnapshotTest() {
  return (
    <Snapshot component={Button}>
      <Snapshot
        name="base"
        cases={[
          {name: 'hover', action: (button) => button.hover()},
          {name: 'active', action: (button) => button.mousedown()},
        ]}
      >
        <Button>Button</Button>
      </Snapshot>

      <Snapshot
        name="primary"
        cases={[
          {name: 'hover', action: (button) => button.hover()},
          {name: 'active', action: (button) => button.mousedown()},
        ]}
      >
        <Button primary>Button</Button>
      </Snapshot>

      <Snapshot
        name="destructive"
        cases={[
          {name: 'hover', action: (button) => button.hover()},
          {name: 'active', action: (button) => button.mousedown()},
        ]}
      >
        <Button destructive>Button</Button>
      </Snapshot>

      <Snapshot
        skip
        name="disabled"
        cases={[
          {name: 'hover', action: (button) => button.hover()},
          {name: 'active', action: (button) => button.mousedown()},
        ]}
      >
        <Button disabled>Button</Button>
      </Snapshot>

      <Snapshot
        name="link"
        cases={[
          {name: 'hover', action: (button) => button.hover()},
          {name: 'active', action: (button) => button.mousedown()},
        ]}
      >
        <Button link>Button</Button>
      </Snapshot>

      <Snapshot name="full-width">
        <Button fullWidth>Button</Button>
      </Snapshot>
    </Snapshot>
  );
}
