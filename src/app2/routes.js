// @flow

import React from 'react';
import Route from 'react-router/lib/Route';

import App from './sections/App';
import NotFound from './sections/App/NotFound';
import {ViewerQuery} from './queries';

import HomeRoutes from './sections/Home/Routes';
import SnapshotRoutes from './sections/Snapshot/Routes';

const routes = (
  <Route path="/" component={App} queries={ViewerQuery}>
    {HomeRoutes}
    {SnapshotRoutes}
    <Route path="*" component={NotFound} />
  </Route>
);

export default routes;
