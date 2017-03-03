import {Viewport, Action, ID} from '../types';
import {AnyComponent} from '../types/react';

export type SnapshotSource = AnyComponent<any, any>;

export interface Descriptor {
  id: ID,
  groups: string[],
  name: string,
  case: string | null,
  action: Action | null,
  element: React.ReactNode,
  record: boolean,
  skip: boolean,
  only: boolean,
  threshold: number,
  viewport: Viewport,
  hasMultipleViewports: boolean,
}
