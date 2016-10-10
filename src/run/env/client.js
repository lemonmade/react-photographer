// @flow

import EventEmitter from 'events';
import {create as createPhantom} from 'phantom';
import type {WebSocket} from 'ws';
import type {Server} from './server';

class Page {
  constructor(page) {
    this.page = page;
  }

  async open(...args) {
    await this.page.open(...args);
  }

  async set(props: {[key: string]: any}) {
    await Promise.all(
      Object
        .keys(props)
        .map((prop) => this.page.property(prop, props[prop]))
    );
  }

  on(...args) {
    return this.page.on(...args);
  }
}

export class Client {
  phantom: Object;
  page: Object;
  closed = false;

  constructor(phantom: phantom$Phantom) {
    this.phantom = phantom;
  }

  async open(url: string) {
    const page = new Page(await this.phantom.createPage());
    page.page.on('onConsoleMessage', function(msg) { console.log('CONSOLE', msg); });
    await page.open(url);
    return page;
  }

  close() {
    if (this.closed) { return; }

    this.closed = true;
    this.phantom.exit();
  }
}

export default async function createClient(): Promise<Client> {
  const phantom = await createPhantom();
  return new Client(phantom);
}
