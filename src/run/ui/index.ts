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
  private clearUI = '';
  private totalSteps = 0;

  title(title: string, {icon}: {icon: string}) {
    console.log(`${icon}  ${chalk.bold(title)}\n`);
  }

  setupStart(steps: number) {
    this.totalSteps = steps;
  }

  setupStepStart({message, step}: {message: string, step: number}) {
    const {totalSteps} = this;
    const ui = `${chalk.dim(`[${step}/${totalSteps}]`)} ${message}\n`;
    const clear = '\r\x1B[K\r\x1B[1A'.repeat(ui.split('\n').length - 1);

    process.stdout.write(ui);
    this.clearUI = clear;
  }

  setupStepEnd({message, step}: {message: string, step: number}) {
    process.stdout.write(this.clearUI);
    this.clearUI = '';

    console.log(`${chalk.green(`[${step}/${this.totalSteps}]`)} ${message}`);
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

    process.stdout.write(this.clearUI);
    console.log(`${prefix} ${getTestString(snapshot)}`);
    process.stdout.write(ui);

    this.clearUI = clear;
  }

  end() {
    console.log();
  }
}

export default function dotReporter() {
  return new Reporter();
}
