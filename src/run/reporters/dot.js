// @flow

import chalk from 'chalk';
import {colorForResult, successColor, errorColor, pendingColor} from '../utilities/color';

import readline from 'readline';

const CLEAR_WHOLE_LINE = 0;
const PASS = chalk.inverse.bold.green(' PASS ');
const FAIL = chalk.inverse.bold.red(' FAIL ');
const SKIP = chalk.inverse.bold.yellow(' SKIP ');

function clearLine(stdout) {
  readline.clearLine(stdout, CLEAR_WHOLE_LINE);
  toStartOfLine(stdout);
}

export function toStartOfLine(stdout) {
  readline.cursorTo(stdout, 0);
}

function getUI({testsTotal, testsCompleted, testsPassed, testsFailed, testsSkipped, componentsTotal, componentsCompleted, componentsPassed, componentsFailed, componentsSkipped}) {
  const width = process.stdout.columns;
  const completeWidth = Math.round(width * (testsCompleted / testsTotal));

  const testString = [
    testsFailed > 0 && chalk.bold.red(`${testsFailed} failed`),
    testsSkipped > 0 && chalk.bold.yellow(`${testsSkipped} skipped`),
    testsPassed > 0 && chalk.bold.green(`${testsPassed} passed`),
    `${testsCompleted}/${testsTotal} total`,
  ].filter(Boolean).join(', ');

  const componentString = [
    componentsFailed > 0 && chalk.bold.red(`${componentsFailed} failed`),
    componentsSkipped > 0 && chalk.bold.yellow(`${componentsSkipped} skipped`),
    componentsPassed > 0 && chalk.bold.green(`${componentsPassed} passed`),
    `${componentsCompleted}/${componentsTotal} total`,
  ].filter(Boolean).join(', ');

  const progressBarColor = testsFailed > 0 ? chalk.red : chalk.green;

  return [
    '',
    `${chalk.bold('Components:')} ${componentString}`,
    `${chalk.bold('Tests:')}      ${testString}`,
    `${progressBarColor.inverse(' ').repeat(completeWidth)}${chalk.white.inverse(' ').repeat(width - completeWidth)}`,
  ].join('\n');
}

function getTestString({component, groups, name, hasMultipleViewports, viewport: {width, height}}) {
  return `${chalk.dim(`${[component, ...groups].join(' > ')} >`)} ${chalk.bold(name)}${hasMultipleViewports ? chalk.dim(` @ ${width}x${height}`) : ''}`;
}

class Reporter {
  clear = '';

  title(title, {icon}) {
    console.log(`${icon}  ${chalk.bold(title)}\n`);
  }

  test(snapshot, summary) {
    const ui = getUI(summary);
    const clear = '\r\x1B[K\r\x1B[1A'.repeat(ui.split('\n').length - 1);
    const {result: {failed, skipped}} = snapshot;

    let prefix = PASS;

    if (failed) {
      prefix = FAIL;
    } else if (skipped) {
      prefix = SKIP;
    }

    process.stdout.write(this.clear);
    console.log(`${prefix} ${getTestString(snapshot)}`);
    process.stdout.write(ui);

    this.clear = clear;
  }

  end() {
    console.log();
  }
}

export default function dotReporter() {
  // runner.on(Events.end, ({passCount, failCount, skipCount}) => {
  //   console.log('\n');
  //
  //   console.log(successColor(`${passCount} passes`));
  //   console.log(errorColor(`${failCount} failures`));
  //   console.log(pendingColor(`${skipCount} skipped`));
  // });

  return new Reporter();
}
