// @flow

import {resolve} from 'path';
import type {ConfigType} from '../config';

export default function report({report: config}: ConfigType) {
  const server = require(
    resolve(__dirname, '../../../build/server/main')
  ).default;

  server(config).listen(config.serverPort);
}
