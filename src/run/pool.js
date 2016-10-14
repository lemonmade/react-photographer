class Pool {
  queue = [];
  available = [];

  constructor(creator, {limit}) {
    this.limit = limit;
    this.creator = creator;
  }

  async get() {
    const object = this.available.pop();

    if (object == null) {
      if (this.limit > 0) {
        this.limit -= 1;
        const id = this.limit.toString();
        return await this.creator(id);
      } else {
        return await new Promise((resolve) => {
          this.queue.push(resolve);
        });
      }
    } else {
      return object;
    }
  }

  release(object) {
    const nextQueued = this.queue.shift();

    if (nextQueued) {
      nextQueued(object);
    } else {
      this.available.push(object);
    }
  }
}

export default function createPool(creator, options) {
  return new Pool(creator, options);
}
