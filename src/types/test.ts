export {ID} from '../id';

export interface Viewport {
  width: number,
  height: number,
}

export interface Descriptor {
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
