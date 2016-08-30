// @flow

import {EventEmitter} from 'events';
import {create as createPhantom} from 'phantom';
import type {WebSocket} from 'ws';

export class Client extends EventEmitter {
  phantom: Object;
  page: Object;
  connection: ?WebSocket;

  constructor(phantom, page) {
    super();
    this.phantom = phantom;
    this.page = page;
  }

  async open(...args) {
    await this.page.open(...args);
  }

  async set(props) {
    await Promise.all(
      Object
        .keys(props)
        .map((prop) => this.page.property(prop, props[prop]))
    );
  }

  async close() {
    await this.page.close();
    await this.phantom.exit();
  }

  async connectToServer(server) {
    const connectionPromise = new Promise((resolve) => {
      server.on('connection', resolve);
    });

    await this.open('http://localhost:3000/');
    this.connection = await connectionPromise;
    this.connection.on('message', (message: string) => {
      this.emit('message', JSON.parse(message));
    });
  }

  send(message: Object) {
    if (this.connection == null) {
      throw new Error('Attempted to send message to a non-existant WebSocket connection.');
    }

    this.connection.send(JSON.stringify(message));
  }
}

export default async function createClient(): Promise<Client> {
  const phantom = await createPhantom();
  const page = await phantom.createPage();
  return new Client(phantom, page);
}
