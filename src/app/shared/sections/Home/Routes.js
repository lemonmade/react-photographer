// @flow

import React from 'react';
import IndexRoute from 'react-router/lib/IndexRoute';

import {ViewerQuery} from '../../queries';

function resolveHomeComponent(nextState, cb) {
  System
    .import('./Home')
    .then((module) => cb(null, module.default));
}

export default (
  <IndexRoute
    getComponent={resolveHomeComponent}
    queries={ViewerQuery}
  />
);
