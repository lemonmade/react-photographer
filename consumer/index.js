// @flow

import React from 'react';
import {render} from 'react-dom';

import Button from './components/Button';
import Snapshot from '../src/lib/Snapshot';
import SnapshotProvider from '../src/lib/SnapshotProvider';

import './index.scss';

render((
  <SnapshotProvider>
    <Snapshot component={Button}>
      <Snapshot
        name="base"
        cases={[{name: 'hover', action: (button) => button.hover()}]}
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
        cases={[{name: 'hover', action: (button) => button.hover()}]}
      >
        <Button destructive>Button</Button>
      </Snapshot>

      <Snapshot
        name="disabled"
        cases={[{name: 'hover', action: (button) => button.hover()}]}
      >
        <Button disabled>Button</Button>
      </Snapshot>

      <Snapshot
        name="link"
        cases={[{name: 'hover', action: (button) => button.hover()}]}
      >
        <Button link>Button</Button>
      </Snapshot>

      <Snapshot name="full-width">
        <Button fullWidth>Button</Button>
      </Snapshot>
    </Snapshot>
  </SnapshotProvider>
), document.getElementById('root'));
