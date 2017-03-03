import {Point, Rect} from '../types';

export function getCenterForNode(node: HTMLElement): Point {
  return {
    x: node.offsetLeft + (node.offsetWidth / 2),
    y: node.offsetTop + (node.offsetHeight / 2),
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
