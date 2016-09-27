// @flow

import React from 'react';
import IndexRoute from 'react-router/lib/IndexRoute';

import {ViewerQuery} from 'relay/queries';

import Home from './Home';

export default (
  <IndexRoute
    component={Home}
    queries={ViewerQuery}
  />
);
