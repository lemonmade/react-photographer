// @flow

import type {ViewportType} from '../types';

type CaseType = {
  name: string,
  action?: () => void,
}

export type Props = {
  children?: any,
  component?: React$Component<*>,
  name?: string,
  record?: boolean,
  skip?: boolean,
  exclusive?: boolean,
  viewports?: ViewportType[],
  action?: () => void,
  cases?: CaseType[],
};

// eslint-disable-next-line no-unused-vars
export default function Snapshot(props: Props) {
  return null;
}
