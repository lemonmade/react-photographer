// @flow

import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';

import http from 'http';
import type {Server as HTTPServer} from 'http';

import express from 'express';
import {Server as WebSocketServer} from 'ws';
import {EventEmitter} from 'events';

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';

import type {ConfigType} from './config';

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

  async close() {
    this.httpServer.close();
  }
}

function renderTemplate(template, data) {
  return ejs.render(
    fs.readFileSync(path.join(__dirname, `templates/${template}`), 'utf8'),
    data
  );
}

export default async function createServer(config: ConfigType): Promise<Server> {
  fs.mkdirpSync('.snapshots');
  fs.writeFileSync('.snapshots/index.js', renderTemplate(
    'test.js.ejs',
    {
      testComponents: config.files.map((test, index) => ({
        name: `SnapshotTestComponent${index}`,
        path: path.relative(path.resolve('./.snapshots'), test),
      })),
    }
  ));
  fs.writeFileSync('.snapshots/index.html', renderTemplate(
    'test.html.ejs',
    {scripts: ['<script type="text/javascript" src="/static/main.js"></script>'], styles: ['<link rel="stylesheet" href="/static/main.css"></link>']}
  ));

  const app = express();

  app.use(webpackDevMiddleware(webpack(config.webpack), {
    noInfo: true,
    publicPath: config.webpack.output.publicPath,
  }));

  app.get('/', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), './.snapshots/index.html'));
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
