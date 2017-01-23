import {Point} from '../../../types';
import Page from './page';

abstract class Device {
  constructor(protected page: Page) {}

  async performAction(action: string, position?: Point) {
    return await this.page.performAction(action, position);
  }
}

export class Keyboard extends Device {

}

export class Mouse extends Device {
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
