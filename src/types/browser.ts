import {Workspace} from '../workspace';
import {TypeOrPromise} from './other';
import {Rect, Point} from './geometry';

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

export interface Client {
  navigate(url: string): TypeOrPromise<void>,
  snapshot(options: SnapshotOptions): TypeOrPromise<void>,
  close(): void,
}

export interface Browser {
  open(url: string): TypeOrPromise<Client>,
  close(): void,
}

export interface BrowserCreator {
  (workspace: Workspace): TypeOrPromise<Browser>,
}

export interface ActionHelper {
  node: HTMLElement,
  mousedown(): Promise<void>,
  hover(): Promise<void>,
}

export interface Action {
  (actionHelper: ActionHelper): void | Promise<void>,
}
