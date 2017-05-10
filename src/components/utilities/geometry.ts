import {Point, Rect} from '../../types';

export function getCenterForNode(node: HTMLElement): Point {
  const box = node.getBoundingClientRect();
  return {
    x: box.left + (box.width / 2),
    y: box.top + (box.height / 2),
  };
}

export function getRectForNode(node: HTMLElement): Rect {
  return {
    x: node.offsetLeft,
    y: node.offsetTop,
    width: node.offsetWidth,
    height: node.offsetHeight,
  };
}
