import React from 'react';
import Snapshot from 'react-photographer';
import Button from './Button';

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

      <Snapshot
        name="full-width"
        viewports={[
          {height: 200, width: 400},
          {height: 200, width: 200},
        ]}
      >
        <Button fullWidth>Button</Button>
      </Snapshot>
    </Snapshot>
  );
}
