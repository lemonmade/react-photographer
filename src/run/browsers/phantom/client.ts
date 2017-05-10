import {PhantomJS, WebPage} from 'phantom';
import {Mouse, Keyboard} from './devices';
import {Client as ClientInterface, Rect, Point} from '../../../types';

export class Client implements ClientInterface {
  mouse: Mouse;
  keyboard: Keyboard;

  constructor(private page: WebPage) {
    this.keyboard = new Keyboard(this);
    this.mouse = new Mouse(this);
  }

  async navigate(url: string) {
    await this.page.open(url);
  }

  async snapshot({output, rect}: {output: string, rect?: Rect}) {
    if (rect) {
      await this.set({clipRect: rect});
    }

    await this.page.render(output);
  }

  async performAction(action: string, {x, y}: Partial<Point> = {}) {
    await this.page.sendEvent(action, x, y);
  }

  close() {
    this.page.close();
  }

  private async set(props: {[key: string]: any}) {
    await Promise.all(
      Object
        .keys(props)
        .map((prop) => this.page.property(prop, props[prop])),
    );
  }
}

export default async function createClient(phantom: PhantomJS) {
  const page = await phantom.createPage();
  await page.on('onConsoleMessage', function() { console.log.apply(console, arguments); });
  await page.on('onError', function() { console.log.apply(console, arguments); });
  return new Client(page);
}
