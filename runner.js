/* eslint-env node */
/* eslint no-console: off */

const http = require('http');
const path = require('path');
// const webdriver = require('webdriverio');
const {create: phantom} = require('phantom');
const express = require('express');
const WebSocketServer = require('ws').Server;
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
// const gm = require('gm');

const webpackConfig = require('./webpack.config');

const server = http.createServer();
const wss = new WebSocketServer({server});
const app = express();
let client;
let page;

server.on('request', app);

app.use(webpackDevMiddleware(webpack(webpackConfig), {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath,
}));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'));
});

export class Rect {
  constructor({x = 0, y = 0, width = 0, height = 0} = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get center() {
    return {
      x: this.x + (this.width / 2),
      y: this.y + (this.height / 2),
    };
  }

  get origin() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}


async function cleanup() {
  console.log('Closing everything down!');
  server.close();
  await page.close();
  await client.exit();
  process.exit(0);
}

(async () => {
  let testCount;
  let currentTest = 0;

  const result = await Promise.all([
    phantom(),
    new Promise((resolve) => {
      server.listen(3000, () => {
        console.log('Server is listening on localhost:3000');
        resolve();
      });
    }),
  ]);

  client = result[0];

  const testRunnerPromise = new Promise((resolve) => {
    wss.on('connection', (ws) => {
      currentTest = 0;
      console.log('CONNECTED TO WEBSOCKET');

      function runTest() {
        if (currentTest >= testCount) {
          resolve();
          return;
        }

        ws.send(JSON.stringify({runTest: currentTest}));
        currentTest += 1;
      }

      ws.on('message', async (message) => {
        const messageDetails = JSON.parse(message);

        if (messageDetails.requestAction === 'hover') {
          const position = new Rect(messageDetails.position);
          const {center} = position;
          await page.sendEvent('mousemove', center.x, center.y);
          ws.send(JSON.stringify({performedAction: 'hover'}));
        }

        if (messageDetails.testCount) {
          testCount = messageDetails.testCount;
          runTest();
          return;
        }

        if (messageDetails.readyForMyCloseup) {
          console.log(`TAKING SNAPSHOT WITH DETAILS: ${message}`);
          const {position, name} = messageDetails;
          try {
            await page.property('clipRect', position);
            await page.render(path.join(__dirname, `snapshots/${name}.png`));
          } catch (err) {
            console.error(err);
          }

          runTest();
        }
      });
    });
  });

  page = await client.createPage();
  await page.property('onError', (msg, trace) => {
    console.error(msg, trace);
  });

  await page.property('onConsoleMessage', (msg) => {
    console.log(msg);
  });

  await page.open('http://localhost:3000/');

  await testRunnerPromise;
  // await new Promise((resolve) => {
  //   setTimeout(resolve, 3000);
  // });
})()
  // .then(cleanup)
  .catch((err) => {
    console.error(err);
    cleanup();
  });

process.on('SIGINT', cleanup);
