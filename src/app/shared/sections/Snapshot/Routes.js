// @flow

import React from 'react';
import Route from 'react-router/lib/Route';

import Snapshot from './Snapshot';
import {SnapshotQuery} from '../../queries';

export default (
  <Route path="/snapshot">
    <Route
      path=":id"
      component={Snapshot}
      queries={SnapshotQuery}
    />
  </Route>
);
