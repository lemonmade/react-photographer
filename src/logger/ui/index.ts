import * as chalk from 'chalk';
import readline = require('readline');
import {Snapshot, CaptureResult, CaptureStatus, CompareStatus, CompareResult, Step} from '../../types';

enum State {
  Capturing,
  Captured,
  Comparing,
  Skipped,
  Success,
  Failure,
  Error,
  Reference,
}

const indicators = {
  [State.Capturing]: chalk.inverse.bold.gray(' CAPTURING '),
  [State.Captured]: chalk.inverse.bold.green(' CAPTURED '),
  [State.Comparing]: chalk.inverse.bold.gray(' COMPARING '),
  [State.Skipped]: chalk.inverse.bold.yellow(' SKIPPED '),
  [State.Success]: chalk.inverse.bold.green(' SUCCESS '),
  [State.Failure]: chalk.inverse.bold.red(' FAILURE '),
  [State.Error]: chalk.inverse.bold.red(' ERROR '),
  [State.Reference]: chalk.inverse.bold.yellow(' REFERENCE '),
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
      state: State,
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

  snapshotCaptureStart(snapshot: Snapshot) {
    this.updateUI(snapshot, State.Capturing, getTestString(snapshot));
  }

  // TODO
  snapshotCaptureEnd(snapshot: Snapshot, result: CaptureResult) {
    let message: string;
    let state: State;

    if (result.status === CaptureStatus.Skipped) {
      state = State.Skipped;
      message = getTestString(snapshot);
    } else {
      state = State.Captured;
      message = `${getTestString(snapshot)} ${chalk.dim(`(${result.duration}ms)`)}`;
    }

    this.updateUI(snapshot, state, message);
  }

  snapshotCompareStart(snapshot: Snapshot) {
    this.updateUI(snapshot, State.Comparing, getTestString(snapshot));
  }

  snapshotCompareEnd(snapshot: Snapshot, result: CompareResult) {
    let state: State;

    if (result.status === CompareStatus.Reference) {
      state = State.Reference;
    } else if (result.status === CompareStatus.Success) {
      state = State.Success;
    } else if (result.status === CompareStatus.Failure) {
      state = State.Failure;
    } else if (result.status === CompareStatus.Error) {
      state = State.Error;
    } else {
      state = State.Skipped;
    }

    this.updateUI(snapshot, state, `${getTestString(snapshot)} ${chalk.dim(`(${result.duration}ms)`)}`);
  }

  end() {
    console.log();
  }

  private updateUI(snapshot: Snapshot, state: State, message: string) {
    this.details[snapshot.id] = {state, message};

    const ui = Object
      .keys(this.details)
      .map((key: string) => {
        const {state, message} = this.details[key];
        const indicator = indicators[state];
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
