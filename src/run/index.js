// @flow

import fs from 'fs-extra';
import path from 'path';
import yargs from 'yargs';
import createDebug from 'debug';

import type {ConfigType} from '../config';
import createEnv from './env';
import createLogger from './logger';
import runTests from './runner';
import {debug} from './utilities/console';

import dotReporter from './reporters/dot';

export default async function run(config: ConfigType) {
  let server;

  const argv = yargs.argv;
  const logger = createLogger({verbose: Boolean(argv.verbose)});
  logger.reporter = dotReporter();

  process.on('SIGINT', cleanup);
  process.on('uncaughtException', cleanup);
  process.on('unhandledRejection', cleanup);

  function cleanup() {
    if (server == null) { return; }

    server.close();
    debug('closed env');
  }

  server = await createEnv(config);
  debug('Created server');

  const initialConnection = await server.connect();
  const messagePromise = initialConnection.awaitMessage('TEST_DETAILS');
  initialConnection.send({type: 'SEND_DETAILS'});
  const testDetails = (await messagePromise).tests;
  initialConnection.release();

  debug(`Received test details: ${JSON.stringify(testDetails, null, 2)}`);

  const tests = await runTests(testDetails, {
    config,
    server,
    logger,
  });
  debug(`Finished all tests: ${JSON.stringify(tests, null, 2)}`);

  writeResults(tests, config);
  debug('Wrote test results');

  logger.end();

  cleanup();
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
