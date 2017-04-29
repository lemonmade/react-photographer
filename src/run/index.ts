import Runner from './runner';
import Logger from './logger';
import ui from './ui';
import {Workspace} from '../workspace';

export default async function run(workspace: Workspace) {
  const runner = new Runner(workspace);
  const logger = new Logger(ui());
  // const start = Date.now();

  logger.clear();
  logger.title('React Photographer', {icon: '📷'});

  runner.on('step:count', logger.stepCount.bind(logger));
  runner.on('step', logger.step.bind(logger));
  runner.on('start', logger.start.bind(logger));
  runner.on('test', logger.test.bind(logger));
  runner.on('end', logger.end.bind(logger));
  runner.on('debug', logger.debug.bind(logger));

  const results = await runner.run();
  console.log(results);
  // logger.debug(`Finished running in ${Date.now() - start} with ${workspace.config.workers} workers`);
}
