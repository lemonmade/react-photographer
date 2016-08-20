import React from 'react';
import {render} from 'react-dom';

import Button from './components/Button';
import Snapshot from '../src/lib/Snapshot';
import SnapshotProvider from '../src/lib/SnapshotProvider';

import './index.scss';

render((
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
), document.getElementById('root'));
