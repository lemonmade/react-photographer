// @flow

import fs from 'fs-extra';
import path from 'path';

import type {ConfigType} from '../config';
import createRunner from './runner';
import dotReporter from './reporters/dot';
import {createLogger, debug} from './utilities/console';

export default async function run(config: ConfigType) {
  const start = Date.now();
  const logger = createLogger(dotReporter());

  logger.clear();
  logger.title('React Photographer', {icon: '📷'});

  const runner = await createRunner(config);
  runner.on('start', logger.start.bind(logger));
  runner.on('test', logger.test.bind(logger));

  const results = await runner.run();

  await results.dump();
  debug(`Finished running in ${Date.now() - start} with ${config.workers} workers`);

  logger.end();
}
