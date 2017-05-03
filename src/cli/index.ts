import * as yargs from 'yargs';
import * as run from './commands/run';

const argv = yargs
  .usage('Usage: $0 [command] [options]')
  .options(run.builder)
  .help()
  .argv;

run.handler(argv);

// const possibleCommand = argv._[0];
// const shouldRun = [test].every(({command}) => possibleCommand !== command);

// if (shouldRun) {
//   run.handler(argv);
// }
