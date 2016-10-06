// @flow

import {createUniversalReactAppMiddleware} from '@lemonmade/react-universal/server';
import express from 'express';
import path from 'path';
import graphql from 'express-graphql';
import compression from 'compression';

import type {ConfigType} from '@lemonmade/react-universal-config';

import schema from 'data/schema';
import routes from 'sections';
import createStore from 'store';

import type {ConfigType as SnapshotConfigType} from '../../config';

export default function createServer(config: ConfigType, {snapshotRoot}: SnapshotConfigType) {
  const store = createStore();
  const {publicPath, buildDir} = config;
  const universalReactAppMiddleware = createUniversalReactAppMiddleware({schema, routes, store}, config);

  // Create our express based server.
  const app = express();

  // Response compression.
  app.use(compression());

  app.use('/graphql', graphql({schema, pretty: true, graphiql: true}));

  app.use(
    `/${path.basename(snapshotRoot)}`,
    express.static(snapshotRoot)
  );

  app.use(
    publicPath,
    express.static(path.join(buildDir, 'client'), {maxAge: '365d'})
  );

  app.get('*', universalReactAppMiddleware);

  return app;
}
