import fs from 'fs-extra';
import EventEmitter from 'events';

import runTest from './test';
import Progress from './progress';
import createServer from './server';
import generateAssets from './assets';

import {debug} from '../utilities/console';
import Database from '../../database';

class Runner extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
  }

  async run() {
    const {config} = this;

    this.emit('step:count', 4);
    this.emit('step', {message: 'Trying to load existing snapshots'});
    const database = new Database(config);

    this.emit('step', {message: 'Building test bundles'});
    await generateAssets(config);

    this.emit('step', {message: 'Starting test server'});
    const server = await createServer(config);
    const cleanup = server.close.bind(server);

    process.on('SIGINT', cleanup);
    process.on('uncaughtException', cleanup);
    process.on('unhandledRejection', cleanup);

    this.emit('step', {message: 'Figuring out what tests to run'});
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
