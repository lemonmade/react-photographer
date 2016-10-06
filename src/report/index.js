// @flow

import {start} from '@lemonmade/react-universal/server';
import type {ConfigType} from '../config';

export default function report(config: ConfigType) {
  start(config.report, config);
}
