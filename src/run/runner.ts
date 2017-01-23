import {EventEmitter} from 'events';

import Server from './server';
import Connector from './connector';
import createPhantomClient from './clients/phantom';
import generateAssets from './assets';
import Aggregate from './aggregate';

import {Workspace} from '../workspace';

export default class Runner extends EventEmitter {
  constructor(private workspace: Workspace) {
    super();
  }

  async run() {
    const {workspace} = this;

    this.emit('step:count', 4);

    this.emit('step', {message: 'Loading existing snapshots'});
    // TODO

    this.emit('step', {message: 'Building assets'});
    await generateAssets(workspace);

    this.emit('step', {message: 'Starting test server'});
    const {client, server, connector} = await createTestPieces(workspace);

    this.emit('step', {message: 'Figuring out what tests to run'});
    const tests = await getTests(connector);
    const progress = new Progress([]);

    this.emit('start', progress);

    // TODO

    this.emit('end');
  }

  emit(event: 'step', step: {message: string}): boolean
  emit(event: 'step:count', count: number): boolean
  emit(event: 'start', progress: Aggregate): boolean
  emit(event: 'test', progress?: any): boolean
  emit(event: 'end', progress: Aggregate): boolean
  emit(event: 'debug', message: string): boolean
  emit(event: string, payload: any): boolean {
    return super.emit(event, payload);
  }

  on(event: 'step', handler: (details: {message: string}) => void): this
  on(event: 'step:count', handler: (count: number) => void): this
  on(event: 'start', handler: (aggregate: Aggregate) => void): this
  on(event: 'test', handler: () => void): this
  on(event: 'end', handler: (aggregate: Aggregate) => void): this
  on(event: 'debug', handler: (message: string) => void): this
  on(event: string, handler: any): this {
    return super.on(event, handler);
  }
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

async function getTests(connector: Connector) {
  const connection = await connector.connect();
  const messagePromise = connection.awaitMessage('TEST_DETAILS');
  connection.send({type: 'SEND_DETAILS'});
  const {tests} = await messagePromise;
  connection.close();
  return tests;
}
