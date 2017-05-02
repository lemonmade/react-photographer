import * as React from 'react';

import {Descriptor, SnapshotSource} from './types';

interface Case {
  name: Descriptor['name'],
  action?: Descriptor['action'],
}

export interface Props {
  name?: Descriptor['name'],
  component?: string | SnapshotSource,
  children?: Descriptor['element'],
  record?: Descriptor['record'],
  skip?: Descriptor['skip'],
  only?: Descriptor['only'],
  viewports?: Descriptor['viewport'][],
  viewport?: Descriptor['viewport'],
  action?: Descriptor['action'],
  cases?: Case[],
  threshold?: Descriptor['threshold'],
}

export default class Snapshot extends React.Component<Props, {}> {}
