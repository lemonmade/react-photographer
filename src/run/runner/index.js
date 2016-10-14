import fs from 'fs-extra';
import EventEmitter from 'events';

import runTest from './test';
import createServer from '../server';
import {debug} from '../utilities/console';

class Progress {
  results = [];

  constructor(tests) {
    this.tests = tests;
  }

  add(result) {
    this.results.push(result);
  }

  get total() {
    return this.tests.length;
  }

  get complete() {
    return this.results.length;
  }

  get percentComplete() {
    return this.complete / this.total;
  }
}

class Runner extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
  }

  async run() {
    const {config} = this;
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

    const existingSnapshots = loadExistingSnapshots(config);
    const env = {server, config};

    const snapshots = await Promise.all(
      tests.map(async (test) => {
        const existingSnapshot = existingSnapshots[test.id];
        const snapshot = getSnapshotDetailsFromTest(test, existingSnapshot);
        const result = await runTest(test, env);

        if (test.record) {
          snapshot.image = result.image;
          result.image = null;
        }

        snapshot.result = result;
        progress.add(snapshot);
        this.emit('test', snapshot, progress);

        return snapshot;
      }),
    );

    debug(`Finished all tests: ${JSON.stringify(snapshots, null, 2)}`);
    this.emit('end', progress);
    return snapshots;
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

function loadExistingSnapshots({detailsFile}) {
  const existingSnapshots = {};

  try {
    for (const snapshot of fs.readJSONSync(detailsFile).snapshots) {
      existingSnapshots[snapshot.id] = snapshot;
    }
  } catch (error) {
    // no file, just return empty details
  }

  return existingSnapshots;
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
    result: null,
  };
}
