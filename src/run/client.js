// @flow

import EventEmitter from 'events';
import {create as createPhantom} from 'phantom';
import type {WebSocket} from 'ws';
import type {Server} from './server';

export class Client extends EventEmitter {
  phantom: Object;
  page: Object;
  connection: ?WebSocket;
  closed: boolean = false;

  constructor(phantom: phantom$Phantom, page: phantom$Page) {
    super();
    this.phantom = phantom;
    this.page = page;
  }

  async open(url: string) {
    await this.page.open(url);
  }

  async set(props: {[key: string]: any}) {
    this.page.property('foo', 2);
    await Promise.all(
      Object
        .keys(props)
        .map((prop) => this.page.property(prop, props[prop]))
    );
  }

  close() {
    if (this.closed) { return; }

    this.closed = true;
    this.phantom.exit();
  }

  async connectToServer(server: Server) {
    const connectionPromise = new Promise((resolve) => {
      server.on('connection', resolve);
    });

    await this.open('http://localhost:3000/run');
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
