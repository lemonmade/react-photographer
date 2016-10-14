// @flow

import fs from 'fs-extra';
import path from 'path';
import yargs from 'yargs';
import getImageSize from 'image-size';

import type {ConfigType} from '../config';
import createEnv from './env';
import createLogger from './logger';
import compareFiles from './utilities/compare';

import * as Events from './events';
import dotReporter from './reporters/dot';

import {Rect} from '../utilities/geometry';

const actionHandlers = {
  async hover({position}, {page}) {
    const center = new Rect(position).center;
    await page.performAction('mousemove', center);
  },

  async mousedown({position}, {page}) {
    const center = new Rect(position).center;
    await page.performAction('mousemove', center);
  },
};


export default async function run(config: ConfigType) {
  let env;

  const argv = yargs.argv;
  const logger = createLogger({verbose: Boolean(argv.verbose)});
  logger.reporter = dotReporter();

  process.on('SIGINT', cleanup);
  process.on('uncaughtException', cleanup);
  process.on('unhandledRejection', cleanup);

  function cleanup() {
    if (env == null) { return; }

    env.close();
    logger.debug('closed env');
  }

  env = await createEnv(config);
  logger.debug('Created env');

  let currentSnapshotDetails;

  try {
    currentSnapshotDetails = fs.readJSONSync(config.detailsFile).snapshots;
  } catch (error) {
    currentSnapshotDetails = [];
  }

  async function runTest(test) {
    const {id, name, component, groups, viewport, hasMultipleViewports, threshold, record, skip} = test;
    const currentSnapshotDetail = currentSnapshotDetails.find((snapshotDetail) => snapshotDetail.id === id) || {};

    const result = {
      passed: !record,
      failed: false,
      skipped: skip,
      recorded: record,
      mismatch: 0,
      duration: 0,
      threshold,
      reason: null,
      details: null,
      image: null,
      diff: null,
    };

    const snapshot = {
      id,
      name,
      component,
      groups,
      viewport,
      hasMultipleViewports,
      result,
      image: currentSnapshotDetail.image,
    };

    let duration = 0;

    if (skip) { return snapshot; }

    const viewportString = `@${viewport.width}x${viewport.height}`;

    const {snapshotRoot} = config;
    const snapshotPath = path.join(component, ...groups);
    const paths = {
      reference: path.join(snapshotRoot, 'reference', snapshotPath, `${name}${viewportString}.reference.png`),
      compare: path.join(snapshotRoot, 'compare', snapshotPath, `${name}${viewportString}.compare.png`),
      diff: path.join(snapshotRoot, 'diff', snapshotPath, `${name}${viewportString}.diff.png`),
    };

    let missingReference = !record;

    if (missingReference) {
      try {
        missingReference = !fs.statSync(paths.reference).isFile();
      } catch (error) {
        // still missing
      }
    }

    if (missingReference) {
      result.passed = false;
      result.failed = true;
      result.reason = 'Missing reference snapshot';
      return snapshot;
    }

    const connection = await env.connect();
    logger.debug(`Started running test: ${JSON.stringify(test)}`);

    const start = Date.now();

    const {page} = connection;
    await page.set({viewportSize: test.viewport});
    logger.debug(`Set viewport for ${id} to ${JSON.stringify(test.viewport)}`);

    await page.performAction('mousemove', {x: 10000, y: 10000});
    logger.debug('Did a clearing mousemove');
    await page.performAction('mouseup');
    logger.debug('Did a clearing mouseup');

    connection.send({type: 'RUN_TEST', test: id});

    while (true) {
      // TODO: async iterator
      const message = await connection.awaitMessage();
      const {type} = message;

      if (type === 'READY_FOR_MY_CLOSEUP') {
        const {position} = message;
        logger.debug(`Requested snapshot for: ${id}, at position ${JSON.stringify(position)}`);

        fs.mkdirpSync(path.dirname(record ? paths.reference : paths.compare));
        await page.set({clipRect: position});
        await page.render(record ? paths.reference : paths.compare);
        const imageSize = getImageSize(record ? paths.reference : paths.compare);

        const newImage = {
          src: path.relative(path.dirname(config.snapshotRoot), paths.reference),
          height: imageSize.height,
          width: imageSize.width,
        };

        if (record) {
          snapshot.image = newImage;
        } else {
          result.image = newImage;
        }

        duration += (Date.now() - start);

        break;
      } else if (type === 'REQUEST_ACTION') {
        logger.debug(`Received action request: ${message.action}, ${id}`);

        const {action} = message;
        const handler = actionHandlers[action];

        // TODO: handle unavailable actions
        if (typeof handler === 'function') {
          await handler(message, connection);
        }

        connection.send({type: 'PERFORMED_ACTION', action: message.action, id});
      }
    }

    connection.release();
    logger.debug(`Finished with connection for ${id}`);

    if (!record) {
      const compareStart = Date.now();
      const comparisonResult = await compareFiles(paths.compare, paths.reference);
      const passed = (comparisonResult.misMatchPercentage <= threshold);
      fs.mkdirpSync(path.dirname(paths.diff));
      await writeComparisonToFile(comparisonResult, paths.diff);

      result.mismatch = comparisonResult.misMatchPercentage;
      result.passed = passed;
      result.failed = !passed;

      const imageSize = getImageSize(paths.compare);
      result.image = {
        src: path.relative(path.dirname(config.snapshotRoot), paths.compare),
        height: imageSize.height,
        width: imageSize.width,
      };

      const diffImageSize = getImageSize(paths.diff);
      result.diff = {
        src: path.relative(path.dirname(config.snapshotRoot), paths.diff),
        height: diffImageSize.height,
        width: diffImageSize.width,
      };

      duration += (compareStart - Date.now());
    }

    result.duration = duration;
    return snapshot;
  }

  // client.on('onConsoleMessage', (arg) => logger.debug(`Client console message error: ${JSON.stringify(arg)}`));
  // client.on('onError', (arg) => logger.debug(`Received error: ${JSON.stringify(arg)}`));
  // client.on('message', (arg) => logger.debug(`Received message: ${JSON.stringify(arg)}`));

  const initialConnection = await env.connect();
  const messagePromise = initialConnection.awaitMessage('TEST_DETAILS');
  initialConnection.send({type: 'SEND_DETAILS'});
  const testDetails = (await messagePromise).tests;
  initialConnection.release();

  logger.debug(`Received test details: ${JSON.stringify(testDetails, null, 2)}`);

  const tests = await Promise.all(testDetails.map(async (detail) => {
    const test = await runTest(detail);
    logger.test(test);
    return test;
  }));

  logger.end();
  logger.debug(`Finished all tests: ${JSON.stringify(tests, null, 2)}`);

  writeResults(tests, config);
  logger.debug('Wrote test results');

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

async function writeComparisonToFile(comparison, file) {
  await new Promise((resolve) => {
    const writeStream = fs.createWriteStream(file);
    writeStream.on('close', resolve);

    comparison
      .getDiffImage()
      .pack()
      .pipe(writeStream);
  });
}
