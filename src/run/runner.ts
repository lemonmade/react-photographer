import {mkdirpSync} from 'fs-extra';
import {resolve, dirname} from 'path';
import {EventEmitter} from 'events';

import Server from './server';
import Connector from './connector';
import createPhantomClient from './clients/phantom';
import generateAssets from './assets';
import Aggregate from './aggregate';

import {Workspace} from '../workspace';

interface Step {
  message: string,
  step: number,
}

export default class Runner extends EventEmitter {
  private currentStep = 0;

  constructor(private workspace: Workspace) {
    super();
  }

  async run() {
    const {workspace} = this;

    this.emit('setup:start', 4);
    await this.runSetupStep('Loading existing snapshots', () => {});
    await this.runSetupStep('Building assets', () => generateAssets(workspace));
    const {client, server, connector} = await this.runSetupStep('Starting test server', () => createTestPieces(workspace));
    const tests = await this.runSetupStep('Figuring out what tests to run', () => getTests(connector));
    this.emit('setup:end', 4);

    const progress = new Aggregate(tests);

    this.emit('tests:start', progress);

    // TODO
    await Promise.all(tests.map((test) => runTest(test, connector, workspace)));

    this.emit('tests:end', progress);

    client.close();
    server.close();
  }

  emit(event: 'setup:step:start', step: Step): boolean
  emit(event: 'setup:step:end', step: Step): boolean
  emit(event: 'setup:start', steps: number): boolean
  emit(event: 'setup:end', steps: number): boolean
  emit(event: 'tests:start', progress: Aggregate): boolean
  emit(event: 'test:start', payload: void): boolean
  emit(event: 'test:end', payload: void): boolean
  emit(event: 'tests:end', progress: Aggregate): boolean
  emit(event: 'debug', message: string): boolean
  emit(event: string, payload: any): boolean {
    return super.emit(event, payload);
  }

  on(event: 'setup:step:start', handler: (step: Step) => void): this
  on(event: 'setup:step:end', handler: (step: Step) => void): this
  on(event: 'setup:start', handler: (steps: number) => void): this
  on(event: 'setup:end', handler: (steps: number) => void): this
  on(event: 'tests:start', handler: (aggregate: Aggregate) => void): this
  on(event: 'test:start', handler: () => void): this
  on(event: 'test:end', handler: () => void): this
  on(event: 'tests:end', handler: (aggregate: Aggregate) => void): this
  on(event: 'debug', handler: (message: string) => void): this
  on(event: string, handler: any): this {
    return super.on(event, handler);
  }

  private async runSetupStep<T>(message: string, step: () => T): Promise<T> {
    this.currentStep += 1;
    this.emit('setup:step:start', {message, step: this.currentStep});
    const result = await step();
    this.emit('setup:step:end', {message, step: this.currentStep});
    return result;
  }
}

async function runTest(test: any, connector: Connector, workspace: Workspace) {
  console.log(`Running test id ${test.id}`);
  const connection = await connector.connect();
  const {page} = connection;

  console.log(`Connected for id ${test.id}`);

  const snapshotPath = resolve(workspace.directories.reference, `${test.id}.png`);
  mkdirpSync(dirname(snapshotPath));

  connection.send({type: 'RUN_TEST', id: test.id});

  const message = await connection.awaitMessage('READY_FOR_MY_CLOSEUP');
  const {position} = message;
  await page.snapshot({
    rect: position,
    output: snapshotPath,
  });

  connection.close();
}

async function createTestPieces(workspace: Workspace) {
  const client = await createPhantomClient(workspace);
  const server = new Server(workspace);
  const connector = new Connector(server, client, workspace);

  function cleanup() {
    client.close();
    server.close();
  }

  process.on('SIGINT', cleanup);
  process.on('uncaughtException', cleanup);
  process.on('unhandledRejection', cleanup);

  return {client, server, connector};
}

async function getTests(connector: Connector): Promise<any[]> {
  const connection = await connector.connect();
  const messagePromise = connection.awaitMessage('TEST_DETAILS');
  connection.send({type: 'SEND_DETAILS'});
  const {tests} = await messagePromise;
  connection.close();
  return tests;
}
