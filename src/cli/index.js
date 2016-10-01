// @flow

import yargs from 'yargs';

import * as run from './commands/run';
import * as report from './commands/report';

const argv = yargs
  .usage('Usage: $0 [command] [options]')
  .options(run.builder)
  .command(report)
  .help()
  .argv;

const possibleCommand = argv._[0];
const shouldRunTests = [report].every(({command}) => possibleCommand !== command);

if (shouldRunTests) {
  run.handler(argv);
}
