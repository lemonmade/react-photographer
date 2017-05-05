import {resolve} from 'path';
import {EventEmitter} from 'events';
import {mkdirp, remove, symlink, exists, writeFile, copy, createWriteStream} from 'fs-extra';

import createEnvironment, {Environment} from './environment';
import createPhantom from './browsers/phantom';
import generateAssets from './assets';
import createCompare, {Compare} from './compare';

import {Workspace} from '../workspace';
import {Snapshot, Result, Status, Image, Step, Message} from '../types';

interface Run {
  id: string,
  outputDirectory: string,
  snapshots: {
    [key: string]: {
      description: Snapshot,
      result: Result,
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

      const compare = createCompare({workers: workspace.config.workers});

      const allResults = await Promise.all(
        snapshots.map((snapshot) => this.runSnapshot(snapshot, output, environment, compare, workspace))
      );

      allResults.forEach(({snapshot, result}) => {
        results[snapshot.id] = {
          description: snapshot,
          result,
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
  emit(event: 'snapshot:end', snapshot: Snapshot, result: Result): boolean
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
  on(event: 'snapshot:end', handler: (snapshot: Snapshot, result: Result) => void): this
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
    compare: Compare,
    workspace: Workspace,
  ) {
    if (snapshot.skip) {
      const result: Result = {status: Status.Skip};
      this.emit('snapshot:start', snapshot);
      this.emit('snapshot:end', snapshot, result);
      return {snapshot, result};
    }

    const connection = await environment.connect();
    const {directories} = workspace;

    const start = Date.now();
    this.emit('snapshot:start', snapshot);

    const {client} = connection;
    const snapshotPathSegments = [
      ...snapshot.groups,
      `${snapshot.name}${snapshot.case ? `-${snapshot.case}` : ''}@${snapshot.viewport.width}x${snapshot.viewport.height}.png`,
    ]
    const snapshotPath = resolve(outputDirectory, ...snapshotPathSegments);

    // RESET
    await client.mouse.move({x: 10000, y: 10000});
    await client.mouse.up();

    connection.send({type: 'RUN_TEST', id: snapshot.id});

    let message: Message;

    while (true) {
      message = await connection.awaitMessage();

      if (message.type === 'REQUEST_ACTION') {
        const {action, position} = message;
        this.emit('debug', `Performing action ${action} at position ${JSON.stringify(position)}`);

        switch (action) {
          case 'mousedown':
            await client.mouse.down(position);
            break;
          case 'mouseover':
            await client.mouse.move(position);
            break;
        }

        connection.send({type: 'PERFORMED_ACTION', action});
      } else {
        break;
      }
    }

    const {position} = message;

    await client.snapshot({
      rect: position,
      output: snapshotPath,
    });

    connection.close();

    const referencePath = resolve(directories.reference, ...snapshotPathSegments);
    const hasReference = await exists(referencePath);
    let result: Result;

    if (!hasReference) {
      await copy(snapshotPath, referencePath);
      result = {
        status: Status.Reference,
        image: {path: snapshotPath},
        referenceImage: {path: referencePath},
        duration: Date.now() - start,
      };
    } else {
      const {mismatch, getDiff} = await compare(snapshotPath, referencePath);
      let diffImage: Image | undefined;

      if (mismatch > 0) {
        const diffPath = snapshotPath.replace(/\.png$/, '.diff.png');
        const stream = createWriteStream(diffPath);

        await new Promise((resolve, reject) => {
          stream.on('error', reject);
          stream.on('close', resolve);
          getDiff().pipe(stream);
        });

        diffImage = {path: diffPath};
      }

      result = {
        status: mismatch > snapshot.threshold ? Status.Fail : Status.Pass,
        threshold: snapshot.threshold,
        mismatch,
        image: {path: snapshotPath},
        diffImage,
        referenceImage: {path: referencePath},
        duration: Date.now() - start,
      };
    }

    this.emit('snapshot:end', snapshot, result);

    return {snapshot, result};
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
