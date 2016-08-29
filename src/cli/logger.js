// @flow
/* eslint no-console: off */

import chalk from 'chalk';

class Logger {
  debug(message: string) {
    console.log(`${chalk.gray('[debug]')} ${message}`);
  }
}

export default function logger() {
  return new Logger();
}
