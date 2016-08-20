// @flow

import React from 'react';
import {render} from 'react-dom';

import ButtonSnapshotTest from './components/Button/Button.snapshot';
import BadgeSnapshotTest from './components/Badge/Badge.snapshot';
import SnapshotProvider from '../src/lib/SnapshotProvider';

import './index.scss';

render((
  <SnapshotProvider
    tests={[
      ButtonSnapshotTest,
      BadgeSnapshotTest,
    ]}
  />
), document.getElementById('root'));
