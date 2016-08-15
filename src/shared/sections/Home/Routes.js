// @flow

import React from 'react';
import IndexRoute from 'react-router/lib/IndexRoute';

function resolveHomeComponent(nextState, cb) {
  System
    .import('./Home')
    .then((module) => cb(null, module.default));
}

export default (
  <IndexRoute
    getComponent={resolveHomeComponent}
  />
);
