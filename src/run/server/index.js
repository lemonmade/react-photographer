// @flow

import fs from 'fs-extra';
import path from 'path';

import http from 'http';
import type {Server as HTTPServer} from 'http';

import express from 'express';
import {Server as WebSocketServer} from 'ws';
import {EventEmitter} from 'events';

import webpack from 'webpack';

import generateAssets from './assets';
import type {ConfigType} from '../config';

type ServerComponentsType = {
  httpServer: HTTPServer,
  webSocketServer: WebSocketServer,
};

export class Server extends EventEmitter {
  httpServer: HTTPServer;
  webSocketServer: WebSocketServer;

  constructor({httpServer, webSocketServer}: ServerComponentsType) {
    super();
    this.httpServer = httpServer;
    this.webSocketServer = webSocketServer;
    this.webSocketServer.on('connection', (...args) => {
      this.emit('connection', ...args);
    });
  }

  close() {
    this.httpServer.close();
  }
}

export default async function createServer(config: ConfigType): Promise<Server> {
  await generateAssets(config);

  const app = express();

  app.use(config.webpack.output.publicPath, express.static(config.assetPath));

  app.get('/run', (req, res) => {
    res.sendFile(path.join(config.buildPath, 'index.html'));
  });

  const httpServer = http.createServer();
  httpServer.on('request', app);

  await new Promise((resolve) => {
    httpServer.listen(3000, () => { resolve(); });
  });

  const webSocketServer = new WebSocketServer({server: httpServer});
  const server = new Server({httpServer, webSocketServer});
  return server;
}
