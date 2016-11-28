// @flow

import {start} from '@lemonmade/react-universal/server';
import type {Config} from '../config';

export default function report(config: Config) {
  start(config.report, config);
}
