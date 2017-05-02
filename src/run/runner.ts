import {resolve} from 'path';
import {EventEmitter} from 'events';

import createEnvironment, {Environment} from './environment';
import createPhantom from './browsers/phantom';
import generateAssets from './assets';

import {Workspace} from '../workspace';

interface Step {
  message: string,
  duration: number,
  step: number,
}

export default class Runner extends EventEmitter {
  private currentStep = 0;

  async run(output: string, workspace: Workspace) {
    this.emit('setup:start', 3);
    await this.runSetupStep('Building assets', () => generateAssets(workspace));
    const environment = await this.runSetupStep('Starting test server', () => createEnvironment(workspace, createPhantom));

    try {
      const tests = await this.runSetupStep('Figuring out what tests to run', () => getTests(environment));
      this.emit('setup:end', 3);

      this.emit('run:start');
      await Promise.all(tests.map((test) => this.runTest(test, output, environment)));
      this.emit('run:end');
    } finally {
      environment.close();
    }
  }

  emit(event: 'setup:step:start', step: Step): boolean
  emit(event: 'setup:step:end', step: Step): boolean
  emit(event: 'setup:start', steps: number): boolean
  emit(event: 'setup:end', steps: number): boolean
  emit(event: 'run:start'): boolean
  emit(event: 'snapshot:start', snapshot: any): boolean
  emit(event: 'snapshot:end', snapshot: any): boolean
  emit(event: 'run:end'): boolean
  emit(event: 'debug', message: string): boolean
  emit(event: string, payload?: any): boolean {
    return super.emit(event, payload);
  }

  on(event: 'setup:step:start', handler: (step: Step) => void): this
  on(event: 'setup:step:end', handler: (step: Step) => void): this
  on(event: 'setup:start', handler: (steps: number) => void): this
  on(event: 'setup:end', handler: (steps: number) => void): this
  on(event: 'run:start', handler: () => void): this
  on(event: 'snapshot:start', handler: (snapshot: any) => void): this
  on(event: 'snapshot:end', handler: (snapshot: any) => void): this
  on(event: 'run:end', handler: () => void): this
  on(event: 'debug', handler: (message: string) => void): this
  on(event: string, handler: any): this {
    return super.on(event, handler);
  }

  private async runSetupStep<T>(message: string, step: () => T): Promise<T> {
    const start = Date.now();
    this.currentStep += 1;
    this.emit('setup:step:start', {message, step: this.currentStep, duration: 0});
    const result = await step();
    this.emit('setup:step:end', {message, step: this.currentStep, duration: Date.now() - start});
    return result;
  }

  private async runTest(snapshot: any, outputDirectory: string, environment: Environment) {
    const connection = await environment.connect();

    this.emit('snapshot:start', snapshot);

    const {client} = connection;
    const snapshotPath = resolve(outputDirectory, `${snapshot.id}.png`);

    connection.send({type: 'RUN_TEST', id: snapshot.id});

    const message = await connection.awaitMessage('READY_FOR_MY_CLOSEUP');
    const {position} = message;
    await client.snapshot({
      rect: position,
      output: snapshotPath,
    });

    connection.close();
    this.emit('snapshot:end', snapshot);
  }
}

async function getTests(environment: Environment): Promise<any[]> {
  const connection = await environment.connect();
  const messagePromise = connection.awaitMessage('TEST_DETAILS');
  connection.send({type: 'SEND_DETAILS'});
  const {tests} = await messagePromise;
  connection.close();
  return tests;
}
