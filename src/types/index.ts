import {Workspace} from '../workspace';

export {ID} from '../id';
export {Config} from '../workspace';

export interface Viewport {
  width: number,
  height: number,
}

export interface Point {
  x: number,
  y: number,
}

export interface Rect extends Point {
  height: number,
  width: number,
}

type TypeOrPromise<T> = T | Promise<T>;

interface Keyboard {

}

interface Mouse {
  down(position: Point): TypeOrPromise<void>,
  up(position: Point): TypeOrPromise<void>,
  move(position: Point): TypeOrPromise<void>,
  hover(position: Point): TypeOrPromise<void>,
}

interface SnapshotOptions {
  rect?: Rect,
  output: string,
}

export interface Page {
  snapshot(options: SnapshotOptions): TypeOrPromise<void>,
  set(options: {[key: string]: any}): TypeOrPromise<void>,
}

export interface Client {
  open(url: string): TypeOrPromise<Page>,
  close(): void,
}

export interface ClientCreator {
  (workspace: Workspace): TypeOrPromise<Client>,
}

export interface Action {
  (): void,
}

type Primitive = string | number | boolean;
type Serializable = Primitive | Primitive[] | {[key: string]: Serializable};

export interface Message {
  type: string,
  [key: string]: Serializable,
}

export interface Listener {
  stop(): void,
}

export interface Messenger {
  send(message: Message): void,
  listen(handler: (message: Message) => void): Listener,
}
