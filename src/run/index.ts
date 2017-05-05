import {resolve} from 'path';
import {EventEmitter} from 'events';
import {mkdirp, remove, symlink, exists, writeFile, copy} from 'fs-extra';

import createEnvironment, {Environment} from './environment';
import createPhantom from './browsers/phantom';
import generateAssets from './assets';

import {Workspace} from '../workspace';
import {Snapshot, CaptureResult, CaptureStatus, CompareResult, CompareStatus, Step} from '../types';

interface Run {
  id: string,
  outputDirectory: string,
  snapshots: {
    [key: string]: {
      description: Snapshot,
      captureResult: CaptureResult,
      compareResult: CompareResult,
    },
  },
}

export default class Runner extends EventEmitter {
  private currentStep = 0;

  async run(workspace: Workspace) {
    const id = String(Date.now());
    const output = resolve(workspace.directories.runs, id);

    this.emit('start');

    this.emit('setup:start', 3);
    await this.runSetupStep('Building assets', () => generateAssets(workspace));
    const environment = await this.runSetupStep('Starting test server', () => createEnvironment(workspace, createPhantom));

    const results: Run['snapshots'] = {};
    let snapshots: Snapshot[] = [];

    try {
      snapshots = await this.runSetupStep('Figuring out what tests to run', () => getSnapshots(environment));
      this.emit('setup:end', 3);

      await mkdirp(output);
      this.emit('debug', `Created output directory (${output})`);

      const allResults = await Promise.all(
        snapshots.map((snapshot) => this.runSnapshot(snapshot, output, environment, workspace))
      );

      allResults.forEach(({snapshot, compareResult, captureResult}) => {
        results[snapshot.id] = {
          description: snapshot,
          compareResult,
          captureResult,
        }
      });

      this.emit('end', {
        id,
        outputDirectory: output,
        snapshots: results,
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

  emit(event: 'start'): boolean
  emit(event: 'setup:step:start', step: Step): boolean
  emit(event: 'setup:step:end', step: Step): boolean
  emit(event: 'setup:start', steps: number): boolean
  emit(event: 'setup:end', steps: number): boolean
  emit(event: 'snapshot:start', snapshot: Snapshot): boolean
  emit(event: 'snapshot:capture:start', snapshot: Snapshot): boolean
  emit(event: 'snapshot:capture:end', snapshot: Snapshot, result: CaptureResult): boolean
  emit(event: 'snapshot:compare:start', snapshot: Snapshot): boolean
  emit(event: 'snapshot:compare:end', snapshot: Snapshot, result: CompareResult): boolean
  emit(event: 'snapshot:end', snapshot: Snapshot, captureResult: CaptureResult, compareResult: CompareResult): boolean
  emit(event: 'end', run: Run): boolean
  emit(event: 'debug', message: string): boolean
  emit(event: string, ...payload: any[]): boolean {
    return super.emit(event, ...payload);
  }

  on(event: 'start', handler: () => void): this
  on(event: 'setup:step:start', handler: (step: Step) => void): this
  on(event: 'setup:step:end', handler: (step: Step) => void): this
  on(event: 'setup:start', handler: (steps: number) => void): this
  on(event: 'setup:end', handler: (steps: number) => void): this
  on(event: 'snapshot:start', handler: (snapshot: Snapshot) => void): this
  on(event: 'snapshot:capture:start', handler: (snapshot: Snapshot) => void): this
  on(event: 'snapshot:capture:end', handler: (snapshot: Snapshot, result: CaptureResult) => void): this
  on(event: 'snapshot:compare:start', handler: (snapshot: Snapshot) => void): this
  on(event: 'snapshot:compare:end', handler: (snapshot: Snapshot, result: CompareResult) => void): this
  on(event: 'snapshot:end', handler: (snapshot: Snapshot, captureResult: CaptureResult, compareResult: CompareResult) => void): this
  on(event: 'end', handler: (run: Run) => void): this
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

  private async runSnapshot(
    snapshot: Snapshot,
    outputDirectory: string,
    environment: Environment,
    workspace: Workspace,
  ) {
    const connection = await environment.connect();
    const {directories} = workspace;

    const captureStart = Date.now();
    this.emit('snapshot:start', snapshot);
    this.emit('snapshot:capture:start', snapshot);

    const {client} = connection;
    const snapshotPathSegments = [
      ...snapshot.groups,
      `${snapshot.name}${snapshot.case ? `-${snapshot.case}` : ''}@${snapshot.viewport.width}x${snapshot.viewport.height}.png`,
    ]
    const snapshotPath = resolve(outputDirectory, ...snapshotPathSegments);

    connection.send({type: 'RUN_TEST', id: snapshot.id});

    const message = await connection.awaitMessage('READY_FOR_MY_CLOSEUP');
    const {position} = message;

    await client.snapshot({
      rect: position,
      output: snapshotPath,
    });

    connection.close();

    const captureResult: CaptureResult = {
      status: CaptureStatus.Success,
      imagePath: snapshotPath,
      duration: Date.now() - captureStart,
    };

    this.emit('snapshot:capture:end', snapshot, captureResult);

    const compareStart = Date.now();
    this.emit('snapshot:compare:start', snapshot);

    const referencePath = resolve(directories.reference, ...snapshotPathSegments);
    const hasReference = await exists(referencePath);
    let compareResult: CompareResult;

    if (!hasReference) {
      await copy(snapshotPath, referencePath);
      compareResult = {
        status: CompareStatus.Reference,
        referencePath,
        duration: Date.now() - compareStart,
      };
    } else {
      compareResult = {
        status: CompareStatus.Success,
        threshold: snapshot.threshold,
        mismatch: 0,
        referencePath,
        imagePath: snapshotPath,
        duration: Date.now() - compareStart,
      }
    }

    this.emit('snapshot:compare:end', snapshot, compareResult);
    this.emit('snapshot:end', snapshot, captureResult, compareResult);

    return {snapshot, captureResult, compareResult};
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
