// @flow

import fs from 'fs-extra';
import path from 'path';
import yargs from 'yargs';
import getImageSize from 'image-size';

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
      logger.debug('closed env');
    }
  }

  env = await createEnv(config);
  logger.debug('Created env');

  async function runTest(test) {
    const {id, name, component, groups, viewport, hasMultipleViewports, threshold, record, skip} = test;

    return await env.connect(async (connection) => {
      logger.debug(`Started running test: ${JSON.stringify(test)}`);

      const result = {
        passed: false,
        failed: false,
        skipped: skip,
        recorded: record,
        mismatch: 0,
        duration: 0,
        threshold,
      };

      const snapshot = {
        id,
        name,
        component,
        groups,
        viewport,
        hasMultipleViewports,
        result,
      };

      if (skip) { return snapshot; }

      const start = Date.now();

      const {page} = connection;
      await page.set({viewportSize: test.viewport});
      logger.debug(`Set viewport for ${id} to ${JSON.stringify(test.viewport)}`);

      connection.send({type: 'RUN_TEST', test: id});

      while (true) {
        // TODO: async iterator
        const message = await connection.awaitMessage();

        switch (message.type) {
          case 'READY_FOR_MY_CLOSEUP': {
            const {position} = message;
            logger.debug(`Requested snapshot for: ${id}, at position ${JSON.stringify(position)}`);

            const viewportString = `@${viewport.width}x${viewport.height}`;

            const {snapshotRoot} = config;
            const snapshotPath = path.join(component, ...groups);
            const paths = {
              reference: path.join(snapshotRoot, 'reference', snapshotPath, `${name}${viewportString}.reference.png`),
              compare: path.join(snapshotRoot, 'compare', snapshotPath, `${name}${viewportString}.compare.png`),
              diff: path.join(snapshotRoot, 'diff', snapshotPath, `${name}${viewportString}.diff.png`),
            };

            let referenceExists: boolean;

            try {
              referenceExists = fs.statSync(paths.reference).isFile();
            } catch (error) {
              referenceExists = false;
            }

            if (!record && !referenceExists) {
              result.passed = false;
              result.failed = true;
              result.reason = 'Missing reference snapshot';
            } else {
              fs.mkdirpSync(path.dirname(record ? paths.reference : paths.compare));
              await page.set({clipRect: position});
              await page.render(record ? paths.reference : paths.compare);
              const imageSize = getImageSize(record ? paths.reference : paths.compare);
              snapshot.image = {
                src: path.relative(path.dirname(config.snapshotRoot), paths.reference),
                height: imageSize.height,
                width: imageSize.width,
              };
            }

            result.passed = true;
            result.duration = Date.now() - start;

            return snapshot;
          }
          case 'REQUEST_ACTION': {
            logger.debug(`Received action request: ${message.action}, ${id}`);
            connection.send({type: 'PERFORMED_ACTION', action: message.action, id});
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
    const message = await messagePromise;
    return message.tests;
  });

  logger.debug(`Received test details: ${JSON.stringify(testDetails, null, 2)}`);

  const tests = await Promise.all(testDetails.map(runTest));
  logger.debug(`Finished all tests: ${JSON.stringify(tests, null, 2)}`);

  writeResults(tests, config);
  logger.debug('Wrote test results');

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
