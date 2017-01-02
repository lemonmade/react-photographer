import {Viewport, Action} from '../types';
import {AnyComponent} from '../types/react';

export type SnapshotSource = AnyComponent<any, any>;

export interface Descriptor {
  groups: string[],
  name: string,
  case: string,
  action: Action,
  element: React.ReactNode,
  record: boolean,
  skip: boolean,
  only: boolean,
  threshold: number,
  viewport: Viewport,
  hasMultipleViewports: boolean,
}
