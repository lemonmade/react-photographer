import {join} from 'path';
import {EventEmitter} from 'events';
import {createServer, Server as HTTPServer} from 'http';
import {Server as WebSocketServer} from 'ws';
import express = require('express');

import {Workspace} from '../../workspace';

export class App extends EventEmitter {
  private closed = false;

  constructor(private httpServer: HTTPServer, private webSocketServer: WebSocketServer) {
    super();
    this.webSocketServer.on('connection', (connection) => this.emit('connection', connection));
  }

  on(event: 'connection', handler: (client: WebSocket) => void) {
    return super.on(event, handler);
  }

  close() {
    if (this.closed) { return; }

    this.closed = true;
    this.httpServer.close();
  }
}

export default async function createApp({config, directories}: Workspace) {
  const app = express();

  app.use(directories.public, express.static(directories.assets));

  app.get('/', (req, res) => {
    res.sendFile(join(directories.build, 'index.html'));
  });

  const httpServer = createServer();
  httpServer.on('request', app);

  await new Promise((resolve) => {
    httpServer.on('listening', () => resolve());
    httpServer.listen(config.port);
  });

  const webSocketServer = new WebSocketServer({server: httpServer});
  return new App(httpServer, webSocketServer);
}
