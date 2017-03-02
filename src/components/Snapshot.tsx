import * as React from 'react';

import {Descriptor} from './types';
import {AnyComponent} from '../types/react';

interface Case {
  name: Descriptor['name'],
  action?: Descriptor['action'],
}

export interface Props {
  name?: Descriptor['name'],
  component?: string | AnyComponent<any, any>,
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
