import {resolve} from 'path';
import {EventEmitter} from 'events';
import {mkdirp, remove, symlink, exists, writeFile, copy} from 'fs-extra';

import createEnvironment, {Environment} from './environment';
import createPhantom from './browsers/phantom';
import generateAssets from './assets';

import {Workspace} from '../workspace';

interface Step {
  message: string,
  duration: number,
  step: number,
}

enum Status {
  Snapshot,
  Reference,
  Passed,
  Failed,
}

interface Result {
  id: string,
  status: Status,
  duration: number,
}

interface Run {
  id: string,
  output: string,
  snapshots: any[],
  results: Result[],
}

export default class Runner extends EventEmitter {
  private currentStep = 0;

  async run(workspace: Workspace) {
    const id = String(Date.now());
    const output = resolve(workspace.directories.runs, id);

    this.emit('setup:start', 3);
    await this.runSetupStep('Building assets', () => generateAssets(workspace));
    const environment = await this.runSetupStep('Starting test server', () => createEnvironment(workspace, createPhantom));

    let results: Result[] = [];
    let snapshots: any[] = [];

    try {
      snapshots = await this.runSetupStep('Figuring out what tests to run', () => getSnapshots(environment));
      this.emit('setup:end', 3);

      this.emit('run:start');

      await mkdirp(output);
      this.emit('debug', `Created output directory (${output})`);

      results = (await Promise.all(
        snapshots.map((snapshot) => this.runSnapshot(snapshot, output, environment))
      ));

      this.emit('run:end', {
        id,
        output,
        snapshots,
        results,
      });
    } finally {
      environment.close();
    }

    await writeFile(resolve(output, 'details.json'), JSON.stringify({
      id,
      output,
      snapshots,
      results,
    }, null, 2));

    await mkdirp(workspace.directories.snapshots);
    this.emit('debug', `Created snapshots directory (${workspace.directories.snapshots})`)

    if (await exists(workspace.directories.reference)) {
      const symlinkDirectory = resolve(workspace.directories.snapshots, 'latest');

      if (await exists(symlinkDirectory)) {
        await remove(symlinkDirectory);
        this.emit('debug', `Removed existing latest symlink (${symlinkDirectory})`);
      }

      await symlink(output, symlinkDirectory);
      this.emit('debug', `Symlinked latest directory (${symlinkDirectory})`);
    } else {
      await copy(output, workspace.directories.reference);
    }
  }

  emit(event: 'setup:step:start', step: Step): boolean
  emit(event: 'setup:step:end', step: Step): boolean
  emit(event: 'setup:start', steps: number): boolean
  emit(event: 'setup:end', steps: number): boolean
  emit(event: 'run:start'): boolean
  emit(event: 'snapshot:start', snapshot: any): boolean
  emit(event: 'snapshot:end', snapshot: any, result: Result): boolean
  emit(event: 'run:end', run: Run): boolean
  emit(event: 'debug', message: string): boolean
  emit(event: string, ...payload: any[]): boolean {
    return super.emit(event, ...payload);
  }

  on(event: 'setup:step:start', handler: (step: Step) => void): this
  on(event: 'setup:step:end', handler: (step: Step) => void): this
  on(event: 'setup:start', handler: (steps: number) => void): this
  on(event: 'setup:end', handler: (steps: number) => void): this
  on(event: 'run:start', handler: () => void): this
  on(event: 'snapshot:start', handler: (snapshot: any) => void): this
  on(event: 'snapshot:end', handler: (snapshot: any, result: Result) => void): this
  on(event: 'run:end', handler: (run: Run) => void): this
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

  private async runSnapshot(snapshot: any, outputDirectory: string, environment: Environment) {
    const connection = await environment.connect();

    const start = Date.now();
    this.emit('snapshot:start', snapshot);

    const {client} = connection;
    const snapshotPath = resolve(outputDirectory, ...snapshot.groups, `${snapshot.name}${snapshot.case ? `-${snapshot.case}` : ''}@${snapshot.viewport.width}x${snapshot.viewport.height}.png`);

    connection.send({type: 'RUN_TEST', id: snapshot.id});

    const message = await connection.awaitMessage('READY_FOR_MY_CLOSEUP');
    const {position} = message;

    await client.snapshot({
      rect: position,
      output: snapshotPath,
    });
    this.emit('debug', `Generated snapshot for id ${snapshot.id} (${snapshotPath})`);

    connection.close();

    const result = {
      id: snapshot.id,
      status: Status.Snapshot,
      duration: Date.now() - start,
    };

    this.emit('snapshot:end', snapshot, result);

    return result;
  }
}

async function getSnapshots(environment: Environment): Promise<any[]> {
  const connection = await environment.connect();
  const messagePromise = connection.awaitMessage('TEST_DETAILS');
  connection.send({type: 'SEND_DETAILS'});
  const {tests} = await messagePromise;
  connection.close();
  return tests;
}
