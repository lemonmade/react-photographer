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
  const runner = await createRunner(config);
  runner.on('test', logger.test.bind(logger));

  const results = await runner.run();

  writeResults(results, config);
  debug(`Finished running in ${Date.now() - start} with ${config.workers} workers`);
  logger.end();
}

function writeResults(tests, {detailsFile, resultsFile}) {
  const [details, results] = tests.reduce((everything, test) => {
    const {result, ...detail} = test;
    result.id = detail.id;
    everything[0].push(detail);
    everything[1].push(result);
    return everything;
  }, [[], []]);

  fs.mkdirpSync(path.dirname(detailsFile));
  fs.mkdirpSync(path.dirname(resultsFile));
  fs.writeFileSync(detailsFile, JSON.stringify({snapshots: details}, null, 2));
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
}
