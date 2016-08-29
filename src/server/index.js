// @flow

// This grants us source map support, which is handy as our webpack bundling
// for the server will include source maps.  Therefore we will have nice stack
// traces again for our server.
import 'source-map-support/register';

import path from 'path';
import express from 'express';
import compression from 'compression';
import hpp from 'hpp';
import helmet from 'helmet';
import graphql from 'express-graphql';
import schema from '../data/schema';

import universalReactAppMiddleware from './middleware/universal-react-app';
import clientConfigBuilder from '../../../config/webpack.client.config';

// Create our express based server.
const app = express();

// Don't expose any software information to hackers.
app.disable('x-powered-by');

// Prevent HTTP Parameter pollution.
app.use(hpp());

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'"],
  imgSrc: ["'self'"],
  connectSrc: ["'self'", 'ws:'],
  fontSrc: ["'self'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'none'"],
  frameSrc: ["'none'"],
}));

app.use(helmet.xssFilter());
app.use(helmet.frameguard('deny'));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());

// Response compression.
app.use(compression());

// Configure static serving of our webpack bundled client files.
const webpackClientConfig = clientConfigBuilder({mode: process.env.NODE_ENV});

app.use('/graphql', graphql({schema, pretty: true, graphiql: true}));
app.use('/snapshots', express.static(path.join(__dirname, '../../../snapshots')));

app.use(
  webpackClientConfig.output.publicPath,
  express.static(webpackClientConfig.output.path)
);

app.get('*', universalReactAppMiddleware);

const listener = app.listen(parseInt(process.env.SERVER_PORT, 10));

if (process.env.NODE_ENV === 'development') {
  console.log(`==> 💚  HTTP Listener is running on port ${process.env.SERVER_PORT}`); // eslint-disable-line no-console
}

// We export the listener as it will be handy for our development hot reloader.
export default listener;
