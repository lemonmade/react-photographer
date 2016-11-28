// @flow

import type {Point} from '../types';

export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor({x = 0, y = 0, width = 0, height = 0}: {x?: number, y?: number, width?: number, height?: number} = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get center(): Point {
    return {
      x: this.x + (this.width / 2),
      y: this.y + (this.height / 2),
    };
  }

  get origin(): Point {
    return {
      x: this.x,
      y: this.y,
    };
  }
}
