// @flow

export type Point = {
  x: number,
  y: number,
};

export type Message = {
  type: string,
  [key: string]: any,
};

export type Viewport = {
  height: number,
  width: number,
};

export type Image = {
  src: string,
  height: number,
  width: number,
};

export type Snapshot = {
  id: string,
  name: string,
  component: string,
  groups: string[],
  viewport: Viewport,
  hasMultipleViewports: boolean,
};

export type SnapshotTestDescriptor = Snapshot & {
  element: React$Element<any>,
  action?: (action: Object) => void | Promise<any>,
};

export type Result = {
  passed: boolean,
  failed: boolean,
  recorded: boolean,
  skipped: boolean,
  threshold: number,
  mismatch: number,
  duration: number,
  reason: string,
  details: string,
  image: Image,
  diff: Image,
};
