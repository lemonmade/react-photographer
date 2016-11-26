// @flow

import chalk from 'chalk';
import {colorForResult, successColor, errorColor, pendingColor} from '../utilities/color';

import readline from 'readline';

const PASS = chalk.inverse.bold.green(' PASS ');
const FAIL = chalk.inverse.bold.red(' FAIL ');
const SKIP = chalk.inverse.bold.yellow(' SKIP ');

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
  clearTestUI = '';
  clearStepUI = '';
  lastStep = null;
  totalSteps = 0;
  currentStep = 0;

  title(title, {icon}) {
    console.log(`${icon}  ${chalk.bold(title)}\n`);
  }

  stepCount(count) {
    this.totalSteps = count;
  }

  step({message}) {
    this.currentStep += 1;

    const {currentStep, totalSteps, clearStepUI, lastStep} = this;
    const ui = `${chalk.dim(`[${currentStep}/${totalSteps}]`)} ${message}\n`;
    const clear = '\r\x1B[K\r\x1B[1A'.repeat(ui.split('\n').length - 1);

    process.stdout.write(clearStepUI);

    if (lastStep) {
      console.log(`${chalk.green(`[${currentStep - 1}/${totalSteps}]`)} ${lastStep}`);
    }

    process.stdout.write(ui);

    this.lastStep = message;
    this.clearStepUI = clear;
  }

  start() {
    process.stdout.write(this.clearStepUI);
    console.log(`${chalk.green(`[${this.currentStep}/${this.totalSteps}]`)} ${this.lastStep}\n`);
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

    process.stdout.write(this.clearTestUI);
    console.log(`${prefix} ${getTestString(snapshot)}`);
    process.stdout.write(ui);

    this.clearTestUI = clear;
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
