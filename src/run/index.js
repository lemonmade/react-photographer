// @flow

import fs from 'fs-extra';
import path from 'path';
import yargs from 'yargs';

import type {ConfigType} from '../config';
import createEnv from './env';
import createLogger from './logger';

import * as Events from './events';
import dotReporter from './reporters/dot';

export default async function run(config: ConfigType) {
  let env;

  const argv = yargs.argv;
  const logger = createLogger({verbose: Boolean(argv.verbose)});

  process.on('SIGINT', cleanup);
  process.on('uncaughtException', cleanup);
  process.on('unhandledRejection', cleanup);

  function cleanup() {
    if (env) {
      env.close();
      logger.debug('closed connection');
    }
  }

  env = await createEnv(config);
  logger.debug('Created env');

  async function runTest(testDetail, index) {
    const id = [testDetail.component, ...testDetail.groups, testDetail.name].join('-');

    return await env.connect(async (connection) => {
      connection.send({type: 'RUN_TEST', test: index});

      if (id === 'Button-base-hover') {
        console.log(testDetail);
      }

      while (true) {
        const message = await connection.awaitMessage();

        switch (message.type) {
          case 'READY_FOR_MY_CLOSEUP': {
            if (id === 'Button-base-hover') {
              console.log('Finished button base hover');
            }
            return {id};
          }
          case 'REQUEST_ACTION': {
            if (id === 'Button-base-hover') {
              console.log(`Received action ${JSON.stringify(message)}`);
            }
            connection.send({type: 'PERFORMED_ACTION', action: message.action});
          }
        }
      }
    });
  }

  // client.on('onConsoleMessage', (arg) => logger.debug(`Client console message error: ${JSON.stringify(arg)}`));
  // client.on('onError', (arg) => logger.debug(`Received error: ${JSON.stringify(arg)}`));
  // client.on('message', (arg) => logger.debug(`Received message: ${JSON.stringify(arg)}`));

  const testDetails = await env.connect(async (connection) => {
    const messagePromise = connection.awaitMessage('TEST_DETAILS');
    connection.send({type: 'SEND_DETAILS'});
    logger.debug('Sent request for details');
    const message = await messagePromise;
    logger.debug('Received details');
    return message.tests;
  });

  logger.debug(`Received test details: ${JSON.stringify(testDetails)}`);

  const tests = await Promise.all(testDetails.map(runTest));
  logger.debug(`Finished all tests: ${JSON.stringify(tests)}`);

  writeResults(tests, config);
  logger.debug(`Wrote test results`);

  cleanup();
}

function writeResults(tests, {detailsFile, resultsFile}) {
  const [details, results] = tests.reduce((everything, test) => {
    const {result, ...detail} = test;
    everything[0].push(detail);
    everything[1].push(result);
    return everything;
  }, [[], []]);

  fs.mkdirpSync(path.dirname(detailsFile));
  fs.mkdirpSync(path.dirname(resultsFile));
  fs.writeFileSync(detailsFile, JSON.stringify({snapshots: details}, null, 2));
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
}
