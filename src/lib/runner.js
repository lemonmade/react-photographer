/* eslint-env node */
/* eslint no-console: off */

import fs from 'fs';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import shell from 'shelljs';

import createServer from './server';
import webpackConfig from '../../consumer/webpack.config';
import compareFiles from './resemble';

import handleAction from './actions';

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
  console.log('Closing everything down!');
  await server.close();
  process.exit(0);
}

(async () => {
  let testCount = 0;
  let currentTest = 0;

  server = await createServer();
  server.use(app);

  const {page} = server;

  const testPromise = new Promise((resolve) => {
    function runTest() {
      if (currentTest >= testCount) {
        resolve();
        return;
      }

      server.send({type: 'RUN_TEST', test: currentTest});
      currentTest += 1;
    }

    server.on('message', async (message) => {
      try {
        if (message.type === 'REQUEST_ACTION') {
          await handleAction(message, server);
          return;
        }

        if (message.type === 'TEST_COUNT') {
          currentTest = 0;
          testCount = message.count;
          runTest();
          return;
        }

        if (message.type === 'READY_FOR_MY_CLOSEUP') {
          const {position, stack, name} = message;
          const snapshotRoot = path.join(__dirname, '..', '..', 'snapshots');
          const dir = path.join(snapshotRoot, ...stack);
          shell.mkdir('-p', dir);

          await page.property('clipRect', position);
          await page.render(path.join(dir, `${name}.compare.png`));
          await page.sendEvent('mousemove', 10000, 10000);
          const comparisonResult = await compareFiles(
            path.join(dir, `${name}.compare.png`),
            path.join(dir, `${name}.reference.png`)
          );
          await writeComparisonToFile(comparisonResult, path.join(dir, `${name}.diff.png`));

          runTest();
        }
      } catch (err) {
        console.error(err);
      }
    });
  });

  await page.open('http://localhost:3000/');
  await testPromise;
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
