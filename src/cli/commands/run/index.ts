import {Options as BuilderOptions} from 'yargs';

import Logger from '../../../logger';
import Runner from '../../../run';
import loadWorkspace from '../../../workspace';

export const builder: {[key: string]: BuilderOptions} = {
  record: {
    alias: 'r',
    describe: 'Replace all of the reference snapshots with new ones based on the current snapshots.',
    type: 'boolean',
  },
  'snapshots-only': {
    alias: 's',
    describe: 'Generate a new set of snapshots, but don’t compare it against reference snapshots.',
    type: 'boolean',
  },
  'tests-only': {
    alias: 't',
    describe: 'Run tests on the latest set of snapshots against the reference snapshots, without generating new snapshots.',
    type: 'boolean',
  },
};

interface Options {
  record?: boolean,
  snapshotsOnly?: boolean,
  testsOnly?: boolean,
}

export async function handler(options: Options) {
  const workspace = await loadWorkspace(options);
  const logger = new Logger();
  const runner = new Runner();

  logger.clear();
  logger.title('React Photographer', {icon: '📷'});

  runner.on('start', logger.start.bind(logger));
  runner.on('setup:start', logger.setupStart.bind(logger));
  runner.on('setup:step:start', logger.setupStepStart.bind(logger));
  runner.on('setup:step:end', logger.setupStepEnd.bind(logger));
  runner.on('setup:end', logger.setupEnd.bind(logger));
  runner.on('snapshot:start', logger.snapshotStart.bind(logger));
  runner.on('snapshot:capture:start', logger.snapshotCaptureStart.bind(logger));
  runner.on('snapshot:capture:end', logger.snapshotCaptureEnd.bind(logger));
  runner.on('snapshot:compare:start', logger.snapshotCompareStart.bind(logger));
  runner.on('snapshot:compare:end', logger.snapshotCompareEnd.bind(logger));
  runner.on('snapshot:end', logger.snapshotEnd.bind(logger));
  runner.on('end', logger.end.bind(logger));
  runner.on('debug', logger.debug.bind(logger));

  await runner.run(workspace);
}
