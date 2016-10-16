import fs from 'fs-extra';
import EventEmitter from 'events';

import runTest from './test';
import createServer from '../server';
import {debug} from '../utilities/console';
import Database from '../../database';

class Component {
  count = 0;
  total = 0;
  passCount = 0;
  failCount = 0;
  skipCount = 0;

  add(result) {
    const {skipped, passed} = result;

    if (skipped) {
      this.skipCount += 1;
    } else if (passed) {
      this.passCount += 1;
    } else {
      this.failCount += 1;
    }

    this.count += 1;
  }

  get skipped() {
    return this.skipCount === this.total;
  }

  get passed() {
    return this.complete && this.failCount === 0 && this.passCount > 0;
  }

  get failed() {
    return this.complete && this.failCount > 0;
  }

  get complete() {
    return this.count === this.total;
  }
}

class Progress {
  testsPassed = 0;
  testsFailed = 0;
  testsSkipped = 0;
  componentsPassed = 0;
  componentsFailed = 0;
  componentsSkipped = 0;

  constructor(tests) {
    this.testsTotal = tests.length;

    this.components = tests.reduce((all, {component}) => {
      all[component] = all[component] || new Component();
      all[component].total += 1;
      return all;
    }, {});

    this.componentsTotal = Object.keys(this.components).length;
  }

  add(snapshot) {
    const {component, result} = snapshot;
    const {skipped, passed} = result;
    const componentDetails = this.components[component];

    if (skipped) {
      this.testsSkipped += 1;
    } else if (passed) {
      this.testsPassed += 1;
    } else {
      this.testsFailed += 1;
    }

    if (!componentDetails.complete) {
      componentDetails.add(result);

      if (componentDetails.skipped) {
        this.componentsSkipped += 1;
      } else if (componentDetails.passed) {
        this.componentsPassed += 1;
      } else if (componentDetails.failed) {
        this.componentsFailed += 1;
      }
    }
  }

  get componentsCompleted() {
    return this.componentsPassed + this.componentsSkipped + this.componentsFailed;
  }

  get testsCompleted() {
    return this.testsPassed + this.testsSkipped + this.testsFailed;
  }
}

class Runner extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
  }

  async run() {
    const {config} = this;
    const database = new Database(config);
    const server = await createServer(config);
    const cleanup = server.close.bind(server);
    debug('Created server');

    process.on('SIGINT', cleanup);
    process.on('uncaughtException', cleanup);
    process.on('unhandledRejection', cleanup);

    const tests = await getTests(server);
    const progress = new Progress(tests);
    debug(`Received test details: ${JSON.stringify(tests, null, 2)}`);

    this.emit('start', progress);

    const env = {server, config};

    await Promise.all(
      tests.map(async (test) => {
        const existingSnapshot = await database.get({id: test.id});
        const snapshot = getSnapshotDetailsFromTest(test, existingSnapshot);
        const result = await runTest(test, env);

        snapshot.result = result;

        if (test.record) {
          snapshot.image = result.image;
          delete result.image;
        }

        progress.add(snapshot);
        this.emit('test', snapshot, progress);

        await database.set(snapshot);
      }),
    );

    this.emit('end', progress);
    return database;
  }
}

export default function createRunner(config) {
  return new Runner(config);
}

async function getTests(server) {
  const initialConnection = await server.connect();
  const messagePromise = initialConnection.awaitMessage('TEST_DETAILS');
  initialConnection.send({type: 'SEND_DETAILS'});
  const {tests} = await messagePromise;
  initialConnection.release();
  return tests;
}

function getSnapshotDetailsFromTest({
  id,
  name,
  component,
  groups,
  viewport,
  hasMultipleViewports,
}, {image} = {}) {
  return {
    id,
    name,
    component,
    groups,
    viewport,
    hasMultipleViewports,
    image,
  };
}
