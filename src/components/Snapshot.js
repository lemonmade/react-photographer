// @flow

import type {Viewport} from '../types';

type Case = {
  name: string,
  action?: () => void,
};

export type Props = {
  children?: any,
  component?: React$Component<*>,
  name?: string,
  record?: boolean,
  skip?: boolean,
  exclusive?: boolean,
  viewports?: Viewport[],
  action?: () => void,
  cases?: Case[],
};

// eslint-disable-next-line no-unused-vars
export default function Snapshot(props: Props) {
  return null;
}
