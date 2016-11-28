// @flow

import {create as createPhantom} from 'phantom';
import type {Point} from '../../../types';

class Device {
  client: Client;

  constructor(client) {
    this.client = client;
  }

  async performAction(action: string, position?: Point) {
    return await this.client.performAction(action, position);
  }
}

class Keyboard extends Device {

}

class Mouse extends Device {
  async down(position: Point) {
    await this.performAction('mousedown', position);
  }

  async up(position: Point) {
    await this.performAction('mouseup', position);
  }

  async move(position: Point) {
    await this.performAction('mousemove', position);
  }

  async hover(position) {
    await this.move(position);
  }
}

class Client {
  page: phantom$Page;
  mouse: Mouse;
  keyboard: Keyboard;

  constructor(page) {
    this.page = page;
    this.mouse = new Mouse(this);
    this.keyboard = new Keyboard(this);
  }

  async snapshot({output, clip}) {
    if (clip) {
      await this.set({clipRect: clip});
    }

    await this.page.render(output);
  }

  async set(props: {[key: string]: any}) {
    await Promise.all(
      Object
        .keys(props)
        .map((prop) => this.page.property(prop, props[prop])),
    );
  }

  async performAction(action, {x, y}: Point = {}) {
    await this.page.sendEvent(action, x, y);
  }

  on(...args) {
    return this.page.on(...args);
  }
}

class Browser {
  phantom: phantom$Phantom;
  closed = false;

  constructor(phantom: phantom$Phantom) {
    this.phantom = phantom;
  }

  async open(url: string) {
    const page = await this.phantom.createPage();
    await page.open(url);
    return new Client(page);
  }

  close() {
    if (this.closed) { return; }

    this.closed = true;
    this.phantom.exit();
  }
}

export type {Browser};

export default async function createBrowser(): Promise<Browser> {
  const phantom = await createPhantom();
  return new Browser(phantom);
}
