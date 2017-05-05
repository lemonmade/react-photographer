import * as chalk from 'chalk';
import {Snapshot, CaptureResult, CaptureStatus, CompareStatus, CompareResult, Step} from '../../types';

// const SNAPPIN = chalk.inverse.bold.gray(` SNAPPIN `);
const CAPTURING = chalk.inverse.bold.gray(' CAPTURING ');
const CAPTURED = chalk.inverse.bold.green(' CAPTURED ');
const SKIPPED = chalk.inverse.bold.yellow(' SKIPPED ');
const COMPARING = chalk.inverse.bold.gray(' COMPARING ');
const SUCCESS = chalk.inverse.bold.green(' SUCCESS ');
const REFERENCE = chalk.inverse.bold.yellow(' REFERENCE ');

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

  snapshotCaptureStart(snapshot: Snapshot) {
    console.log(`${CAPTURING} ${getTestString(snapshot)}`);
  }

  // TODO
  snapshotCaptureEnd(snapshot: Snapshot, result: CaptureResult) {
    if (result.status === CaptureStatus.Skipped) {
      console.log(`${SKIPPED} ${getTestString(snapshot)}`);
    } else {
      console.log(`${CAPTURED} ${getTestString(snapshot)} ${chalk.dim(`(${result.duration}ms)`)}`);
    }
  }

  snapshotCompareStart(snapshot: Snapshot) {
    console.log(`${COMPARING} ${getTestString(snapshot)}`);
  }

  snapshotCompareEnd(snapshot: Snapshot, result: CompareResult) {
    if (result.status === CompareStatus.Reference) {
      console.log(`${REFERENCE} ${getTestString(snapshot)} ${chalk.dim(`(${result.duration}ms)`)}`);
    } else {
      console.log(`${SUCCESS} ${getTestString(snapshot)} ${chalk.dim(`(${result.duration}ms)`)}`);
    }
  }

  end() {
    console.log();
  }
}

export default function dotReporter() {
  return new Reporter();
}
