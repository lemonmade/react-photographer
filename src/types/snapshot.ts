import {ID} from '../id';

export {ID};

export interface Viewport {
  width: number,
  height: number,
}

export interface Snapshot {
  id: ID,
  groups: string[],
  name: string,
  case: string | null,
  record: boolean,
  skip: boolean,
  only: boolean,
  threshold: number,
  viewport: Viewport,
  hasMultipleViewports: boolean,
}

export enum Status {
  Error,
  Skip,
  Pass,
  Fail,
  Reference,
}

export interface Image {
  path: string,
}

export type Result = {
  status: Status.Error,
  error: string,
  duration: number,
} | {
  status: Status.Skip,
} | {
  status: Status.Reference,
  image: Image,
  referenceImage: Image,
  duration: number,
} | {
  status: Status.Pass | Status.Fail,
  duration: number,
  threshold: number,
  mismatch: number,
  image: Image,
  referenceImage: Image,
  diffImage?: Image,
};
