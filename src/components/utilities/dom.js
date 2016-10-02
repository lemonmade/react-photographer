// @flow

import {Rect} from '../../utilities/geometry';

export function getPositionForNode(node: HTMLElement) {
  return new Rect({
    y: node.offsetTop,
    x: node.offsetLeft,
    height: node.offsetHeight,
    width: node.offsetWidth,
  });
}
