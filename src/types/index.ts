import {Workspace} from '../workspace';

export {ID} from '../id';
export {Config} from '../workspace';

export interface Viewport {
  width: number,
  height: number,
}

export interface Descriptor {
  groups: string[],
  name: string,
  case: string | null,
  record: boolean,
  skip: boolean,
  only: boolean,
  threshold: number,
  viewport: Viewport,
  hasMultipleViewports: boolean,
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

export interface Keyboard {

}

export interface Mouse {
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

export interface ActionHelper {
  node: HTMLElement,
  mousedown(): Promise<void>,
  hover(): Promise<void>,
}

export interface Action {
  (actionHelper: ActionHelper): void | Promise<void>,
}

export interface Message {
  type: string,
  [key: string]: any,
}

export interface Listener {
  stop(): void,
}

export interface Messenger {
  send(message: Message): void,
  listen(handler: (message: Message) => void): Listener,
}
