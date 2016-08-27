/* eslint-env node */
/* eslint no-console: off */

import fs from 'fs';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import shell from 'shelljs';
import {EventEmitter} from 'events';

import createServer from './server';
import webpackConfig from '../../consumer/webpack.config';
import compareFiles from './resemble';
import * as Events from './events';
import dotReporter from './reporters/dot';

import handleAction from './actions';

class Runner extends EventEmitter {
  passCount = 0;
  failCount = 0;
  skipCount = 0;

  start() {
    this.emit(Events.start, this);
  }

  end() {
    this.emit(Events.end, this);
  }

  test(test) {
    if (test.passed) {
      this.passCount += 1;
    } else if (test.skipped) {
      this.skipCount += 1;
    } else {
      this.failCount += 1;
    }

    this.emit(Events.test, test);
  }
}

const app = express();
let server;

app.use(webpackDevMiddleware(webpack(webpackConfig), {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath,
}));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../consumer/index.html'));
});

async function cleanup() {
  await server.close();
  process.exit(0);
}

(async () => {
  let testCount = 0;
  let currentTestIndex = 0;
  let currentTest;
  let tests = [];
  const results = [];
  const runner = new Runner();

  dotReporter(runner);
  runner.start();

  server = await createServer();
  server.use(app);

  const {page} = server;

  const testPromise = new Promise((resolve) => {
    function runTest() {
      if (currentTestIndex >= testCount) {
        resolve();
        runner.end();
        return;
      }

      currentTest = tests[currentTestIndex];

      if (currentTest.skip) {
        currentTestIndex += 1;
        results.push(currentTest);
        runTest();
        return;
      }

      server.send({type: 'RUN_TEST', test: currentTestIndex});
      currentTestIndex += 1;
    }

    server.on('message', async (message) => {
      try {
        if (message.type === 'REQUEST_ACTION') {
          await handleAction(message, server);
          return;
        }

        if (message.type === 'TEST_DETAILS') {
          currentTestIndex = 0;
          tests = message.tests;
          testCount = message.tests.length;
          runTest();
          return;
        }

        if (message.type === 'READY_FOR_MY_CLOSEUP') {
          const {record, stack, name, threshold} = currentTest;
          const {position} = message;
          const testName = [...stack, name].join('/');

          const snapshotRoot = path.join(__dirname, '..', '..', 'snapshots');
          const dir = path.join(snapshotRoot, ...stack);
          shell.mkdir('-p', dir);

          const result = {
            ...currentTest,
            referenceImage: path.join('snapshots', ...stack, `${name}.reference.png`),
          };

          await page.property('clipRect', position);
          await page.render(path.join(dir, `${name}.${record ? 'reference' : 'compare'}.png`));
          await page.sendEvent('mousemove', 10000, 10000);
          await page.sendEvent('mouseup');

          if (!record) {
            const comparisonResult = await compareFiles(
              path.join(dir, `${name}.compare.png`),
              path.join(dir, `${name}.reference.png`)
            );
            const passed = (comparisonResult.misMatchPercentage <= threshold);
            await writeComparisonToFile(comparisonResult, path.join(dir, `${name}.diff.png`));

            result.mismatch = comparisonResult.misMatchPercentage;
            result.passed = passed;
            result.compareImage = path.join('snapshots', ...stack, `${name}.compare.png`);
            result.diffImage = path.join('snapshots', ...stack, `${name}.diff.png`);
          }

          runner.test(result);
          results.push(result);
          runTest();
        }
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    });
  });

  await page.open('http://localhost:3000/');
  await testPromise;
  fs.writeFileSync(path.join(__dirname, '..', '..', 'snapshots', 'data.json'), JSON.stringify({snapshots: results}));
})()
  .then(cleanup)
  .catch((err) => {
    console.error(err);
    cleanup();
  });

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

process.on('SIGINT', cleanup);
