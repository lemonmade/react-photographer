import * as yargs from 'yargs';

import * as run from './commands/run';

const argv = yargs
  .usage('Usage: $0 [command] [options]')
  .options(run.builder)
  // .command(report)
  .help()
  .argv;

run.handler(argv);

// const possibleCommand = argv._[0];
// const shouldRunTests = [report].every(({command}) => possibleCommand !== command);

// if (shouldRunTests) {
//   run.handler(argv);
// }
