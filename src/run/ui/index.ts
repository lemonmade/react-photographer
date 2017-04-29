import * as chalk from 'chalk';
import {WriteStream} from 'tty';
import Aggregate from '../Aggregate';
import {Descriptor} from '../../types';

const PASS = chalk.inverse.bold.green(' PASS ');
const FAIL = chalk.inverse.bold.red(' FAIL ');
const SKIP = chalk.inverse.bold.yellow(' SKIP ');

function getUI({
  testsTotal,
  testsCompleted,
  testsPassed,
  testsFailed,
  testsSkipped,
  componentsTotal,
  componentsCompleted,
  componentsPassed,
  componentsFailed,
  componentsSkipped,
}: Aggregate) {
  const width = (process.stdout as WriteStream).columns;
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

function getTestString({
  groups,
  name,
  hasMultipleViewports,
  viewport: {width, height},
}: Descriptor) {
  return `${chalk.dim(`${groups.join(' > ')} >`)} ${chalk.bold(name)}${hasMultipleViewports ? chalk.dim(` @ ${width}x${height}`) : ''}`;
}

class Reporter {
  clearTestUI = '';
  clearStepUI = '';
  lastStep = '';
  totalSteps = 0;
  currentStep = 0;

  title(title: string, {icon}: {icon: string}) {
    console.log(`${icon}  ${chalk.bold(title)}\n`);
  }

  stepCount(count: number) {
    this.totalSteps = count;
  }

  step({message}: {message: string}) {
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

  // TODO
  test(snapshot: any, summary: Aggregate) {
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
  return new Reporter();
}
