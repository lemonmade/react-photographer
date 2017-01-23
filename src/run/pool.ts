const DEFAULT_LIMIT = 5;

export default class Pool<T> {
  private queue: ((object: T) => void)[] = [];
  private available: T[] = [];
  private limit: number;

  constructor(private builder: (id: number) => T | Promise<T>, {limit = DEFAULT_LIMIT} = {}) {
    this.limit = limit;
  }

  async get(): Promise<T> {
    const available = this.available.pop();

    if (available) {
      return available;
    }

    if (this.limit > 0) {
      this.limit -= 1;
      return this.builder(this.limit);
    } else {
      return new Promise<T>((resolve) => {
        this.queue.push(resolve);
      });
    }
  }

  release(object: T) {
    const nextQueued = this.queue.shift();

    if (nextQueued) {
      nextQueued(object);
    } else {
      this.available.push(object);
    }
  }
}
