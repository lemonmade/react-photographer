// @flow

import url from 'url';
import createClient from './client';
import createServer from './server';
import createPool from '../pool';

class Connection {
  constructor(socket, page, env) {
    this.socket = socket;
    this.page = page;
    this.env = env;
  }

  send(message: Object) {
    this.socket.send(JSON.stringify(message));
  }

  release() {
    this.env.release(this);
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

class Env {
  constructor(client, server) {
    this.server = server;
    this.client = client;

    this.connectionPool = createPool(async (id) => {
      return await createConnection(this, id);
    }, {
      limit: 5,
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
    this.server.close();
    this.client.close();
  }
}

async function createConnection(env, id) {
  const {server, client} = env;

  const socketPromise = new Promise((resolve) => {
    server.on('connection', function handleConnection(newConnection) {
      const {query} = url.parse(newConnection.upgradeReq.url, true);
      if (query.connection !== id) { return; }
      server.removeListener('connection', handleConnection);
      resolve(newConnection);
    });
  });

  const page = await client.open(`${server.address}?connection=${id}`);
  const socket = await socketPromise;

  return new Connection(socket, page, env);
}

export default async function createEnv(config) {
  const [client, server] = await Promise.all([createClient(config), createServer(config)]);
  return new Env(client, server);
}
