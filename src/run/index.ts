import Runner from './runner';
import Logger from './logger';
import ui from './ui';
import {Workspace} from '../workspace';

export default async function run(workspace: Workspace) {
  const runner = new Runner(workspace);
  const logger = new Logger(ui(workspace));
  const start = Date.now();

  logger.clear();
  logger.title('React Photographer', {icon: '📷'});

  runner.on('step:count', logger.stepCount.bind(this));
  runner.on('step', logger.step.bind(this));
  runner.on('start', logger.start.bind(this));
  runner.on('test', logger.test.bind(this));
  runner.on('end', logger.end.bind(this));
  runner.on('debug', logger.debug.bind(this));

  const results = await runner.run();
  logger.debug(`Finished running in ${Date.now() - start} with ${workspace.config.workers} workers`);
}
