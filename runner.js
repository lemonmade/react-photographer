/* eslint-env node */
/* eslint no-console: off */

const http = require('http');
const path = require('path');
const webdriver = require('webdriverio');
const express = require('express');
const WebSocketServer = require('ws').Server;

const server = http.createServer();
const wss = new WebSocketServer({server});
const app = express();

server.on('request', app);

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'));
});

const client = webdriver.remote({
  desiredCapabilities: {browserName: 'firefox'},
});

function cleanup() {
  console.log('Closing everything down!');
  server.close();
  client.end();
}

(async () => {
  let testCount;
  let currentTest = 0;

  await Promise.all([
    client.init(),
    new Promise((resolve) => {
      server.listen(3000, () => {
        console.log('Server is listening on localhost:3000');
        resolve();
      });
    }),
  ]);

  const testRunnerPromise = new Promise((resolve) => {
    wss.on('connection', (ws) => {
      console.log('CONNECTED TO WEBSOCKET');

      function runTest() {
        if (currentTest >= testCount) { resolve(); }

        ws.send(JSON.stringify({runTest: currentTest}));
        currentTest += 1;
      }

      ws.on('message', async (message) => {
        const messageDetails = JSON.parse(message);
        if (messageDetails.testCount) {
          testCount = messageDetails.testCount;
          runTest();
        }

        if (messageDetails.readyForMyCloseup) {
          await client.saveScreenshot(`./test-${currentTest}.png`);
          runTest();
        }
      });
    });
  });

  await client.url('http://localhost:3000/');
  await testRunnerPromise;
  // await new Promise((resolve) => {
  //   setTimeout(resolve, 3000);
  // });
})()
  .then(cleanup)
  .catch((err) => {
    console.error(err);
    cleanup();
  });

process.on('SIGINT', cleanup);
