import fs from 'fs-extra';
import path from 'path';
import {EventEmitter} from 'events';

import compareFiles from './utilities/compare';
import {Rect} from './utilities/geometry';

class Runner extends EventEmitter {
  tests = [];
  results = [];
  currentTestIndex = 0;

  constructor(connection, env) {
    super();

    this.connection = connection;
    this.env = env;

    connection.on('message', (message) => {
      env.logger.debug(`Received message: ${message}`);
      this.handleMessage(JSON.parse(message));
    });
  }

  get currentTest() {
    return this.tests[this.currentTestIndex];
  }

  get testCount() {
    return this.tests.length;
  }

  async runTest() {
    const {currentTest, currentTestIndex, connection, env: {client}} = this;

    if (currentTest == null) {
      this.emit('end');
      return;
    }

    if (currentTest.skip) {
      currentTest.skipped = true;
      this.emit('test', currentTest);
      this.results.push(currentTest);
      this.currentTestIndex += 1;
      this.runTest();
      return;
    }

    await client.set({viewportSize: currentTest.viewport});
    connection.send(JSON.stringify({type: 'RUN_TEST', test: currentTestIndex}));
  }

  async handleMessage(message) {
    switch (message.type) {
      case 'TEST_DETAILS': {
        const {tests} = message;
        this.tests = tests;
        this.results = [];
        this.currentTestIndex = 0;
        this.runTest();
        break;
      }
      case 'REQUEST_ACTION': {
        await handleAction(message, this.connection, this.env);
        break;
      }
      case 'READY_FOR_MY_CLOSEUP': {
        const {currentTest, env: {client}} = this;
        const {record, stack, name, threshold, viewport: {height, width}, hasMultipleViewports} = currentTest;
        const viewportString = hasMultipleViewports ? `@${width}x${height}` : '';
        const {position} = message;

        const snapshotRoot = path.join(__dirname, '..', '..', 'snapshots');
        const dir = path.join(snapshotRoot, ...stack);
        fs.mkdirpSync(dir);

        const result = {
          ...currentTest,
          referenceImage: path.join('snapshots', ...stack, `${name}${viewportString}.reference.png`),
        };

        await client.set({clipRect: position});
        await client.page.render(path.join(dir, `${name}${viewportString}.${record ? 'reference' : 'compare'}.png`));
        await client.page.sendEvent('mousemove', 10000, 10000);
        await client.page.sendEvent('mouseup');

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

        this.emit('test', result);
        this.results.push(result);
        this.currentTestIndex += 1;
        this.runTest();
        break;
      }
    }
  }
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

async function handleHoverAction({position: pos}, connection, env) {
  const center = new Rect(pos).center;
  await env.client.page.sendEvent('mousemove', center.x, center.y);
  connection.send(JSON.stringify({performedAction: 'hover'}));
}

handleHoverAction.applies = ({action}) => action === 'hover';

async function handleMousedownAction({position: pos}, connection, env) {
  const center = new Rect(pos).center;
  await env.client.page.sendEvent('mousedown', center.x, center.y);
  connection.send(JSON.stringify({performedAction: 'mousedown'}));
}

handleMousedownAction.applies = ({action}) => action === 'mousedown';

async function handleAction(message, ...args) {
  const action = [handleHoverAction, handleMousedownAction].find((anAction) => anAction.applies(message));
  if (action == null) { return; }
  await action(message, ...args);
}


export default function runner(...args) {
  return new Runner(...args);
}
