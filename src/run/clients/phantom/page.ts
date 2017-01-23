import {WebPage} from 'phantom';
import {Mouse, Keyboard} from './devices';
import {Page as PageInterface, Rect, Point} from '../../../types';

export default class Page implements PageInterface {
  mouse: Mouse;
  keyboard: Keyboard;

  constructor(private page: WebPage) {
    this.keyboard = new Keyboard(this);
    this.mouse = new Mouse(this);
  }

  async snapshot({output, rect}: {output: string, rect?: Rect}) {
    if (rect) {
      await this.set({clipRect: rect});
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

  async performAction(action: string, {x, y}: Partial<Point> = {}) {
    await this.page.sendEvent(action, x, y);
  }
}
