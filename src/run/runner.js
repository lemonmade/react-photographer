// @flow

import fs from 'fs-extra';
import path from 'path';
import EventEmitter from 'events';

import * as Events from './events';
import compareFiles from './utilities/compare';
import {Rect} from '../utilities/geometry';
import type {EnvType, MessageType, TestType, TestResultType} from '../types';

export class Runner extends EventEmitter {
  instructions = [];
  tests = [];
  currentTestIndex: number = 0;
  env: EnvType;

  end = () => { throw new Error('Tried to end before starting!'); };

  handleMessage = this.handleMessage.bind(this);

  constructor(env: EnvType) {
    super();

    this.env = env;
    env.client.on('message', this.handleMessage);
  }

  async run() {
    return new Promise((resolve) => {
      this.end = () => {
        this.emit(Events.end, calculateResults(this.tests));
        resolve();
      };
    });

    await Promise.all()
  }

  addResult(details, result: TestResultType) {
    this.details.push(details);
    this.results[details.id] = result;
    this.emit(Events.test, result);
  }

  get currentTest(): ?TestType {
    return this.tests[this.currentTestIndex];
  }

  async runTest() {
    const {currentTest, currentTestIndex, env: {client, config}} = this;

    if (currentTest == null) {
      this.end();
      return;
    }

    if (currentTest.skip) {
      this.addResult(baseDetailsForTest(currentTest, config), baseResultForTest(currentTest));
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
        this.instructions = tests;
        this.tests = [];
        this.currentTestIndex = 0;
        this.runTest();
        break;
      }
      case 'REQUEST_ACTION': {
        await handleAction(message, this.env);
        break;
      }
      case 'READY_FOR_MY_CLOSEUP': {
        const {currentTest, env: {client, config}} = this;

        if (currentTest == null) { return; }

        const {record, groups, component, name, threshold, viewport} = currentTest;
        const viewportString = `@${viewport.width}x${viewport.height}`;
        const {position} = message;

        const {snapshotRoot} = config;
        const snapshotPath = path.join(component, ...groups);
        const paths = {
          reference: path.join(snapshotRoot, 'reference', snapshotPath, `${name}${viewportString}.reference.png`),
          compare: path.join(snapshotRoot, 'compare', snapshotPath, `${name}${viewportString}.compare.png`),
          diff: path.join(snapshotRoot, 'diff', snapshotPath, `${name}${viewportString}.diff.png`),
        };

        const details = baseDetailsForTest(currentTest, config);
        const result = baseResultForTest(currentTest);

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
          await client.set({clipRect: position});
          await client.page.render(record ? paths.reference : paths.compare);
          details.image = {src: path.relative(path.dirname(config.snapshotRoot), paths.reference)};
        }

        await client.page.sendEvent('mousemove', 10000, 10000);
        await client.page.sendEvent('mouseup');

        if (!record && referenceExists) {
          const comparisonResult = await compareFiles(paths.compare, paths.reference);
          const passed = (comparisonResult.misMatchPercentage <= threshold);
          fs.mkdirpSync(path.dirname(paths.diff));
          await writeComparisonToFile(comparisonResult, paths.diff);

          result.mismatch = comparisonResult.misMatchPercentage;
          result.passed = passed;
          result.failed = !passed;
          result.image = {src: path.relative(path.dirname(config.snapshotRoot), paths.compare)};
          result.diff = {src: path.relative(path.dirname(config.snapshotRoot), paths.diff)};
        }

        this.addResult(details, result);
        this.currentTestIndex += 1;
        this.runTest();
        break;
      }
    }
  }
}

function calculateResults(testResults) {
  return Object
    .keys(testResults)
    .map((id) => testResults[id])
    .reduce((results, {passed, skipped}) => {
      if (skipped) {
        results.skipCount += 1;
      } else if (passed) {
        results.passCount += 1;
      } else {
        results.failCount += 1;
      }

      return results;
    }, {passCount: 0, failCount: 0, skipCount: 0});
}

function baseResultForTest({record, skip, threshold}: TestType) {
  return {
    recorded: record,
    skipped: skip,
    passed: false,
    failed: false,
    threshold,
    mismatch: 0,
  };
}

function baseDetailsForTest(test: TestType, config): TestResultType {
  const {name, component, groups, viewport, hasMultipleViewports} = test;
  const parts = [component, ...groups, `${name}@${viewport.width}x${viewport.height}`];

  return {
    id: parts.join('-'),
    name,
    component,
    groups,
    viewport,
    hasMultipleViewports,
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

export default function runner(env: EnvType) {
  return new Runner(env);
}
