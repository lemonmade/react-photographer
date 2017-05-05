import {Workspace} from '../workspace';
import {TypeOrPromise} from './other';
import {Rect, Point} from './geometry';

interface SnapshotOptions {
  rect?: Rect,
  output: string,
}

export interface Mouse {
  up(position?: Point): TypeOrPromise<void>,
  down(position?: Point): TypeOrPromise<void>,
  move(position: Point): TypeOrPromise<void>,
  hover(position: Point): TypeOrPromise<void>,
}

export interface Keyboard {

}

export interface Client {
  mouse: Mouse,
  keyboard: Keyboard,
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
  mousedown(node?: HTMLElement): Promise<void>,
  hover(node?: HTMLElement): Promise<void>,
}

export interface Action {
  (actionHelper: ActionHelper): void | Promise<void>,
}
