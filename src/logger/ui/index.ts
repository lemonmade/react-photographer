import * as chalk from 'chalk';
import readline = require('readline');
import {Snapshot, Result, Status, Step} from '../../types';

const RUN = chalk.inverse.bold.gray(' RUNS ');

const indicators = {
  [Status.Skip]: chalk.inverse.bold.yellow(' SKIP '),
  [Status.Pass]: chalk.inverse.bold.green(' PASS '),
  [Status.Fail]: chalk.inverse.bold.red(' FAIL '),
  [Status.Error]: chalk.inverse.bold.red(' ERROR '),
  [Status.Reference]: chalk.inverse.bold.yellow(' REFS '),
}

function getTestString({
  groups,
  case: snapshotCase,
  name,
  hasMultipleViewports,
  viewport: {width, height},
}: Snapshot) {
  return `${chalk.dim(`${groups.join(' > ')} >`)} ${chalk.bold(name)}${snapshotCase ? chalk.dim(`:${snapshotCase}`) : ''}${hasMultipleViewports ? chalk.dim(` @ ${width}x${height}`) : ''}`;
}

class Reporter {
  private clearUI = '';
  private totalSteps = 0;
  private details: {
    [key: string]: {
      status: Status | null,
      message: string,
    },
  } = {};

  clear() {
    process.stdout.write('\x1B[2J\x1B[0f');
  }

  title(title: string, {icon}: {icon: string}) {
    console.log(`${icon}  ${chalk.bold(title)}\n`);
  }

  setupStart(steps: number) {
    this.totalSteps = steps;
  }

  setupStepStart({message, step}: Step) {
    const {totalSteps} = this;
    const ui = `${chalk.dim(`[${step}/${totalSteps}]`)} ${message}\n`;
    const clear = '\r\x1B[K\r\x1B[1A'.repeat(ui.split('\n').length - 1);

    process.stdout.write(ui);
    this.clearUI = clear;
  }

  setupStepEnd({message, step, duration}: Step) {
    process.stdout.write(this.clearUI);
    this.clearUI = '';

    console.log(`${chalk.green(`[${step}/${this.totalSteps}]`)} ${message} ${chalk.dim(`(${duration}ms)`)}`);
  }

  setupEnd() {
    console.log();
  }

  snapshotStart(snapshot: Snapshot) {
    this.updateUI(snapshot, null, getTestString(snapshot));
  }

  snapshotEnd(snapshot: Snapshot, result: Result) {
    const message = result.status === Status.Skip
      ? getTestString(snapshot)
      : `${getTestString(snapshot)} ${chalk.dim(`(${result.duration}ms)`)}`;

    this.updateUI(snapshot, result.status, message);
  }

  end() {
    console.log();
  }

  private updateUI(snapshot: Snapshot, status: Status | null, message: string) {
    this.details[snapshot.id] = {status, message};

    const ui = Object
      .keys(this.details)
      .map((key: string) => {
        const {status, message} = this.details[key];
        const indicator = status ? indicators[status] : RUN;
        return `${indicator} ${message}`;
      })
      .join('\n') + '\n';

    const clear = '\r\x1B[K\r\x1B[1A'.repeat(ui.split('\n').length - 1);
    process.stdout.write(this.clearUI);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(ui);
    this.clearUI = clear;
  }
}

export default function dotReporter() {
  return new Reporter();
}
