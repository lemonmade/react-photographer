export class Rect {
  constructor({x = 0, y = 0, width = 0, height = 0} = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get center() {
    return {
      x: this.x + (this.width / 2),
      y: this.y + (this.height / 2),
    };
  }

  get origin() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}
