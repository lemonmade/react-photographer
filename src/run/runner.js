// flow

import fs from 'fs-extra';
import path from 'path';
import {EventEmitter} from 'events';

import * as Events from './events';
import compareFiles from './utilities/compare';
import {Rect} from './utilities/geometry';
import type {EnvType, MessageType, TestType, TestResultType} from '../types';

class Runner extends EventEmitter {
  tests: TestType[] = [];
  results: TestResultType[] = [];
  currentTestIndex: number = 0;
  passCount: number = 0;
  failCount: number = 0;
  skipCount: number = 0;
  env: EnvType;

  constructor(env: EnvType) {
    super();

    this.env = env;
    env.client.on('message', (message) => {
      env.logger.debug(`Received message: ${JSON.stringify(message)}`);
      this.handleMessage(message);
    });
  }

  addResult(result: TestResultType) {
    if (result.passed) {
      this.passCount += 1;
    } else if (result.skipped) {
      this.skipCount += 1;
    } else {
      this.failCount += 1;
    }

    this.results.push(result);
    this.emit(Events.test, result);
  }

  get currentTest(): ?TestType {
    return this.tests[this.currentTestIndex];
  }

  async runTest() {
    const {currentTest, currentTestIndex, env: {client}} = this;

    if (currentTest == null) {
      fs.writeFileSync(path.join(__dirname, '../../snapshots/data.json'), JSON.stringify({snapshots: this.results}, null, 2));
      this.emit(Events.end, this);
      return;
    }

    if (currentTest.skip) {
      const result = baseResultForTest(currentTest);
      this.addResult(result);
      this.currentTestIndex += 1;
      this.runTest();
      return;
    }

    await client.set({viewportSize: currentTest.viewport});
    client.send({type: 'RUN_TEST', test: currentTestIndex});
  }

  async handleMessage(message: MessageType) {
    switch (message.type) {
      case 'TEST_DETAILS': {
        const {tests} = message;
        this.tests = tests;
        this.results = [];
        this.currentTestIndex = 0;
        this.passCount = 0;
        this.failCount = 0;
        this.skipCount = 0;
        this.runTest();
        break;
      }
      case 'REQUEST_ACTION': {
        await handleAction(message, this.env);
        break;
      }
      case 'READY_FOR_MY_CLOSEUP': {
        const {currentTest, env: {client}} = this;

        if (currentTest == null) { return; }

        const {record, groups, component, name, threshold} = currentTest;
        const viewportString = viewportStringForTest(currentTest);
        const {position} = message;

        const snapshotRoot = path.join(__dirname, '../../snapshots');
        const snapshotPath = path.join(component, ...groups);
        const dir = path.join(snapshotRoot, snapshotPath);
        fs.mkdirpSync(dir);

        const result = baseResultForTest(currentTest);

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
          result.failed = !passed;
          result.compareImage = path.join('snapshots', snapshotPath, `${name}${viewportString}.compare.png`);
          result.diffImage = path.join('snapshots', snapshotPath, `${name}${viewportString}.diff.png`);
        }

        this.addResult(result);
        this.currentTestIndex += 1;
        this.runTest();
        break;
      }
    }
  }
}

function viewportStringForTest({hasMultipleViewports, viewport: {height, width}}: TestType): string {
  return hasMultipleViewports ? `@${width}x${height}` : '';
}

function baseResultForTest(test: TestType): TestResultType {
  const {record, groups, component, name, threshold, viewport, skip, hasMultipleViewports} = test;
  const viewportString = viewportStringForTest(test);

  return {
    id: [component, ...groups, name, viewportString.substring(1)].filter((part) => Boolean(part)).join('-'),
    name,
    component,
    groups,
    viewport,
    threshold,
    hasMultipleViewports,
    skipped: skip,
    passed: false,
    failed: false,
    recorded: record,
    referenceImage: path.join('snapshots', component, ...groups, `${name}${viewportString}.reference.png`),
  };
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

async function handleHoverAction({position: pos}, {client}) {
  const center = new Rect(pos).center;
  await client.page.sendEvent('mousemove', center.x, center.y);
  client.send({performedAction: 'hover'});
}

handleHoverAction.applies = ({action}) => action === 'hover';

async function handleMousedownAction({position: pos}, {client}) {
  const center = new Rect(pos).center;
  await client.page.sendEvent('mousedown', center.x, center.y);
  client.send({performedAction: 'mousedown'});
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
