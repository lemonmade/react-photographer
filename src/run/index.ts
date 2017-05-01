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

  runner.on('setup:start', logger.setupStart.bind(logger));
  runner.on('setup:step:start', logger.setupStepStart.bind(logger));
  runner.on('setup:step:end', logger.setupStepEnd.bind(logger));
  runner.on('setup:end', logger.setupEnd.bind(logger));
  runner.on('tests:start', logger.testsStart.bind(logger));
  runner.on('test:start', logger.testStart.bind(logger));
  runner.on('test:end', logger.testEnd.bind(logger));
  runner.on('tests:end', logger.testsEnd.bind(logger));
  runner.on('debug', logger.debug.bind(logger));

  const results = await runner.run();
  console.log(results);
  // logger.debug(`Finished running in ${Date.now() - start} with ${workspace.config.workers} workers`);
}
