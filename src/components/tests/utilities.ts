import {Rect} from '../../types';

export function createNodeWithPosition(position: Rect): HTMLElement {
  const node: any = document.createElement('div');

  node.offsetLeft = position.x;
  node.offsetWidth = position.width;
  node.offsetTop = position.y;
  node.offsetHeight = position.height;

  return node;
}
