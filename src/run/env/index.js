// @flow

import createClient from './client';
import createServer from './server';

class Connection {
  constructor(socket, page) {
    this.socket = socket;
    this.page = page;
  }

  send(message: Object) {
    this.socket.send(JSON.stringify(message));
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
  limit = 5;
  queue = [];
  pool = [];

  constructor(client, server) {
    this.server = server;
    this.client = client;
  }

  async connect(callback) {
    const connection = await this.createConnection();
    const result = await callback(connection);
    this.releaseConnection(connection);
    return result;
  }

  async createConnection() {
    let connection = this.pool.pop();

    if (connection == null) {
      if (this.limit > 0) {
        this.limit -= 1;

        const connectionPromise = new Promise((resolve) => {
          this.server.once('connection', (connection) => resolve(connection));
        });
        const page = await this.client.open(this.server.address);
        const connection = await connectionPromise;
        return new Connection(connection, page);
      } else {
        return await new Promise((resolve) => {
          this.queue.push(resolve);
        });
      }
    } else {
      return connection;
    }
  }

  releaseConnection(connection) {
    connection.socket.removeAllListeners();
    const next = this.queue.shift();

    if (next) {
      next(connection);
    } else {
      this.pool.push(connection);
    }
  }

  close() {
    this.server.close();
    this.client.close();
  }
}

export default async function createEnv(config) {
  const [client, server] = await Promise.all([createClient(config), createServer(config)]);
  return new Env(client, server);
}
