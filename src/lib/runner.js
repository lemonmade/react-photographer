/* eslint-env node */
/* eslint no-console: off */

import fs from 'fs-extra';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import shell from 'shelljs';
import {EventEmitter} from 'events';

import createServer from './server';
import compareFiles from './resemble';
import * as Events from './events';
import dotReporter from './reporters/dot';
import getConfig from './config';

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

let server;

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
  const config = await getConfig();
  const app = express();

  dotReporter(runner);
  runner.start();

  server = await createServer();
  server.use(app);

  const {files} = config;
  const fileContents = `
var React = require('react');
var ReactDOM = require('react-dom');
var SnapshotProvider = snapshotInteropRequire(require('../src/lib/SnapshotProvider'));

${files.map((file, index) => `var SnapshotComponent${index} = snapshotInteropRequire(require('../${file}'));`).join('\n')}

function snapshotInteropRequire(mod) {
  return mod.__esModule ? mod.default : mod;
}

ReactDOM.render(
React.createElement(SnapshotProvider, {
  tests: [${files.map((_, index) => `SnapshotComponent${index}`).join(', ')}]
}),
document.getElementById('root')
);
`;

  fs.mkdirpSync('.snapshots');
  fs.writeFileSync('.snapshots/index.js', fileContents);
  fs.copySync(path.join(__dirname, './index.html'), '.snapshots/index.html');

  app.use(webpackDevMiddleware(webpack(config.webpack), {
    noInfo: true,
    publicPath: config.webpack.output.publicPath,
  }));

  app.get('/', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), './.snapshots/index.html'));
  });

  const {page} = server;

  const testPromise = new Promise((resolve) => {
    async function runTest() {
      if (currentTestIndex >= testCount) {
        resolve();
        runner.end();
        return;
      }

      currentTest = tests[currentTestIndex];

      if (currentTest.skip) {
        currentTestIndex += 1;
        currentTest.skipped = true;
        runner.test(currentTest);
        results.push(currentTest);
        runTest();
        return;
      }

      await page.property('viewportSize', currentTest.viewport);
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
          const {record, stack, name, threshold, viewport: {height, width}, hasMultipleViewports} = currentTest;
          const viewportString = hasMultipleViewports ? `@${width}x${height}` : '';
          const {position} = message;

          const snapshotRoot = path.join(__dirname, '..', '..', 'snapshots');
          const dir = path.join(snapshotRoot, ...stack);
          shell.mkdir('-p', dir);

          const result = {
            ...currentTest,
            referenceImage: path.join('snapshots', ...stack, `${name}${viewportString}.reference.png`),
          };

          await page.property('clipRect', position);
          await page.render(path.join(dir, `${name}${viewportString}.${record ? 'reference' : 'compare'}.png`));
          await page.sendEvent('mousemove', 10000, 10000);
          await page.sendEvent('mouseup');

          if (!record) {
            const comparisonResult = await compareFiles(
              path.join(dir, `${name}${viewportString}.compare.png`),
              path.join(dir, `${name}${viewportString}.reference.png`)
            );
            const passed = (comparisonResult.misMatchPercentage <= threshold);
            await writeComparisonToFile(comparisonResult, path.join(dir, `${name}${viewportString}.diff.png`));

            result.mismatch = comparisonResult.misMatchPercentage;
            result.passed = passed;
            result.compareImage = path.join('snapshots', ...stack, `${name}${viewportString}.compare.png`);
            result.diffImage = path.join('snapshots', ...stack, `${name}${viewportString}.diff.png`);
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
