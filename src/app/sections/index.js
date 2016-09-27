// @flow

import React from 'react';
import Route from 'react-router/lib/Route';

import {ViewerQuery} from 'relay/queries';

import App from './App';
import NotFound from './NotFound';

import HomeRoutes from './Home';
import SnapshotRoutes from './Snapshot';

const routes = (
  <Route path="/" component={App} queries={ViewerQuery}>
    {HomeRoutes}
    {SnapshotRoutes}
    <Route path="*" component={NotFound} />
  </Route>
);

export default routes;
