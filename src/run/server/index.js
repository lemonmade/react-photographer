// @flow

import url from 'url';
import createBrowser from './browser';
import createApp from './app';
import createPool from '../pool';

class Connection {
  constructor(socket, client, release) {
    this.socket = socket;
    this.client = client;
    this.handleRelease = release;
  }

  send(message: Object) {
    this.socket.send(JSON.stringify(message));
  }

  release() {
    this.handleRelease(this);
  }

  awaitMessage(type) {
    const {socket} = this;

    return new Promise((resolve) => {
      socket.on('message', function handleMessage(messageJSON) {
        const message = JSON.parse(messageJSON);
        if (type == null || type === message.type) {
          socket.removeListener('message', handleMessage);
          resolve(message);
        }
      });
    });
  }
}

class Server {
  constructor(browser, app, {workers}) {
    this.app = app;
    this.browser = browser;

    this.connectionPool = createPool(async (id) => {
      return await createConnection(this, id);
    }, {
      limit: workers,
    });
  }

  async connect() {
    return await this.connectionPool.get();
  }

  release(connection) {
    connection.socket.removeAllListeners();
    this.connectionPool.release(connection);
  }

  close() {
    this.app.close();
    this.browser.close();
  }
}

async function createConnection(server, id) {
  const {app, browser} = server;

  const socketPromise = new Promise((resolve) => {
    app.on('connection', function handleConnection(newConnection) {
      const {query} = url.parse(newConnection.upgradeReq.url, true);
      if (query.connection !== id) { return; }
      app.removeListener('connection', handleConnection);
      resolve(newConnection);
    });
  });

  const page = await browser.open(`${app.address}?connection=${id}`);
  const socket = await socketPromise;

  return new Connection(socket, page, server.release.bind(server));
}

export default async function createServer(config) {
  const [browser, app] = await Promise.all([
    createBrowser(config),
    createApp(config),
  ]);

  return new Server(browser, app, config);
}
