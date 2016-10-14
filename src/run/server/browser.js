// @flow

import {create as createPhantom} from 'phantom';

class Device {
  constructor(client) {
    this.client = client;
  }

  async performAction(...args) {
    return await this.client.performAction(...args);
  }
}

class Keyboard extends Device {

}

class Mouse extends Device {
  async down(position) {
    await this.performAction('mousedown', position);
  }

  async up(position) {
    await this.performAction('mouseup', position);
  }

  async move(position) {
    await this.performAction('mousemove', position);
  }

  async hover(position) {
    await this.move(position);
  }
}

class Client {
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

  async performAction(action, {x, y} = {}) {
    await this.page.sendEvent(action, x, y);
  }

  on(...args) {
    return this.page.on(...args);
  }
}

export class Browser {
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

export default async function createBrowser(): Promise<Browser> {
  const phantom = await createPhantom();
  return new Browser(phantom);
}
