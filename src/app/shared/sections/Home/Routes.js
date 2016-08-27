// @flow

import React from 'react';
import IndexRoute from 'react-router/lib/IndexRoute';

import Home from './Home';
import {ViewerQuery} from '../../queries';

export default (
  <IndexRoute
    component={Home}
    queries={ViewerQuery}
  />
);
