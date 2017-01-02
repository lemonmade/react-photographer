import {create as createPhantom, WebPage, PhantomJS} from 'phantom';

interface Point {
  x: number,
  y: number,
}

interface Rect extends Point {
  height: number,
  width: number,
}

abstract class Device {
  constructor(protected client: Client) {}

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

  async hover(position: Point) {
    await this.move(position);
  }
}

export class Client {
  mouse: Mouse;
  keyboard: Keyboard;

  constructor(private page: WebPage) {
    this.keyboard = new Keyboard(this);
    this.mouse = new Mouse(this);
  }

  async snapshot({output, clip}: {output: string, clip: Rect}) {
    if (clip) {
      await this.set({clipRect: clip});
    }

    await this.page.render(output);
  }

  set(props: {[key: string]: any}) {
    return Promise.all(
      Object
        .keys(props)
        .map((prop) => this.page.property(prop, props[prop])),
    );
  }

  async performAction(action: string, {x, y}: Partial<Point> = {}) {
    await this.page.sendEvent(action, x, y);
  }
}

export class Browser {
  private closed = false;

  constructor(private phantom: PhantomJS) {}

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

export default async function createBrowser() {
  const phantom = await createPhantom();
  return new Browser(phantom);
}
