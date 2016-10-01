// @flow

import React from 'react';
import Route from 'react-router/lib/Route';

import {SnapshotQuery} from 'relay/queries';

import Snapshot from './Snapshot';

export default (
  <Route path="/snapshot">
    <Route
      path=":id"
      component={Snapshot}
      queries={SnapshotQuery}
    />
  </Route>
);
