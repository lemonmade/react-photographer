// @flow

import path from 'path';

import http from 'http';
import type {Server as HTTPServer} from 'http';

import express from 'express';
import {Server as WebSocketServer} from 'ws';
import EventEmitter from 'events';

import generateAssets from './assets';
import type {ConfigType} from '../../../config';

export class App extends EventEmitter {
  httpServer: HTTPServer;
  webSocketServer: WebSocketServer;
  closed: boolean = false;
  address = 'http://localhost:3000/';

  constructor(
    httpServer: HTTPServer,
    webSocketServer: WebSocketServer,
  ) {
    super();
    this.httpServer = httpServer;
    this.webSocketServer = webSocketServer;
    this.webSocketServer.on('connection', this.emit.bind(this, 'connection'));
  }

  close() {
    if (this.closed) { return; }

    this.closed = true;
    this.httpServer.close();
  }
}

export default async function createApp(config: ConfigType): Promise<App> {
  await generateAssets(config);

  const app = express();

  app.use(config.webpack.output.publicPath, express.static(config.assetPath));

  app.get('/', (req, res) => {
    res.sendFile(path.join(config.buildPath, 'index.html'));
  });

  const httpServer = http.createServer();
  httpServer.on('request', app);

  await new Promise((resolve) => {
    httpServer.on('listening', () => resolve());
    httpServer.listen(config.port);
  });

  const webSocketServer = new WebSocketServer({server: httpServer});
  return new App(httpServer, webSocketServer);
}
