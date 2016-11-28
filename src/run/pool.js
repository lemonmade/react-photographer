// @flow

type Options = {
  limit: number,
};

type Creator<T> = (id: string) => T | (id: string) => Promise<T>;

class Pool<T> {
  limit: number;
  creator: Creator<T>;
  queue: ((T) => T)[] = [];
  available: T[] = [];

  constructor(creator: Creator<T>, {limit}: Options) {
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

  release(object: T) {
    const nextQueued = this.queue.shift();

    if (nextQueued) {
      nextQueued(object);
    } else {
      this.available.push(object);
    }
  }
}

export type {Pool};

export default function createPool<T>(creator: Creator<T>, options: Options): Pool<T> {
  return new Pool(creator, options);
}
