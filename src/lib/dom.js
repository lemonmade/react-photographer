export function getPositionForNode(node: HTMLElement) {
  return {
    y: node.offsetTop,
    x: node.offsetLeft,
    height: node.offsetHeight,
    width: node.offsetWidth,
  };
}
