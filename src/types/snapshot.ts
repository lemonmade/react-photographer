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

export enum CaptureStatus {
  Skipped,
  Error,
  Success,
}

export type CaptureResult = {
  status: CaptureStatus.Success,
  imagePath: string,
  duration: number,
} | {
  status: CaptureStatus.Skipped,
} | {
  status: CaptureStatus.Error,
  error: string,
  duration: number,
}

export enum CompareStatus {
  Reference,
  Skipped,
  Success,
  Failure,
  Error,
}

export type CompareResult = {
  status: CompareStatus.Error,
  error: string,
  duration: number,
} | {
  status: CompareStatus.Reference,
  referencePath: string,
  duration: number,
} | {
  status: CompareStatus.Skipped,
  referencePath: string,
  threshold: number,
  duration: number,
} | {
  status: CompareStatus.Success | CompareStatus.Failure,
  referencePath: string,
  imagePath: string,
  diffPath?: string,
  threshold: number,
  mismatch: number,
  duration: number,
};
