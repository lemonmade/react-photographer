import {Rect} from '../../../types';

export function createNodeWithPosition(position: Rect): HTMLElement {
  return {
    offsetLeft: position.x,
    offsetWidth: position.width,
    offsetTop: position.y,
    offsetHeight: position.height,
  } as HTMLElement;
}
