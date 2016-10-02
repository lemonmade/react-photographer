// @flow

import chalk from 'chalk';

export const successColor = chalk.green.bind(chalk);
export const pendingColor = chalk.yellow.bind(chalk);
export const errorColor = chalk.red.bind(chalk);

export function colorForTest({passed, skipped}: {passed: boolean, skipped: boolean}) {
  if (passed) {
    return successColor;
  } else if (skipped) {
    return pendingColor;
  } else {
    return errorColor;
  }
}
