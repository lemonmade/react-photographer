// @flow

import React from 'react';
import Route from 'react-router/lib/Route';

import {SnapshotQuery} from '../../queries';

function resolveHomeComponent(nextState, cb) {
  System
    .import('./Snapshot')
    .then((module) => cb(null, module.default));
}

export default (
  <Route path="/snapshot">
    <Route
      path=":id"
      getComponent={resolveHomeComponent}
      queries={SnapshotQuery}
    />
  </Route>
);
