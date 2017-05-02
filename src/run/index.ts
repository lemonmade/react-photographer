import {resolve} from 'path';
import {mkdirp, remove, symlink} from 'fs-extra';

import Runner from './runner';
import Logger from './logger';
import ui from './ui';

import {Workspace} from '../workspace';

export default async function run(workspace: Workspace) {
  const now = new Date();
  const dateString = now.toLocaleDateString(undefined, {hour: 'numeric', minute: 'numeric', second: 'numeric'});
  const directory = resolve(workspace.directories.snapshots, dateString);

  const runner = new Runner();
  const logger = new Logger(ui());

  logger.clear();
  logger.title('React Photographer', {icon: '📷'});

  runner.on('setup:start', logger.setupStart.bind(logger));
  runner.on('setup:step:start', logger.setupStepStart.bind(logger));
  runner.on('setup:step:end', logger.setupStepEnd.bind(logger));
  runner.on('setup:end', logger.setupEnd.bind(logger));
  runner.on('run:start', logger.runStart.bind(logger));
  runner.on('snapshot:start', logger.snapshotStart.bind(logger));
  runner.on('snapshot:end', logger.snapshotEnd.bind(logger));
  runner.on('run:end', logger.runEnd.bind(logger));
  runner.on('debug', logger.debug.bind(logger));

  await mkdirp(directory);
  await runner.run(directory, workspace);

  const symlinkDirectory = resolve(workspace.directories.snapshots, 'latest');
  await remove(symlinkDirectory);
  await symlink(directory, symlinkDirectory);
  // logger.debug(`Finished running in ${Date.now() - start} with ${workspace.config.workers} workers`);
}
