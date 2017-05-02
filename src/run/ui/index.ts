import * as chalk from 'chalk';
import {Descriptor} from '../../types';

const SNAPPIN = chalk.inverse.bold.gray(` SNAPPIN `);
const SNAPPED = chalk.inverse.bold.green(` SNAPPED `);

function getTestString({
  groups,
  case: snapshotCase,
  name,
  hasMultipleViewports,
  viewport: {width, height},
}: Descriptor) {
  return `${chalk.dim(`${groups.join(' > ')} >`)} ${chalk.bold(name)}${snapshotCase ? chalk.dim(`:${snapshotCase}`) : ''}${hasMultipleViewports ? chalk.dim(` @ ${width}x${height}`) : ''}`;
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

  setupStepEnd({message, step, duration}: {message: string, step: number, duration: number}) {
    process.stdout.write(this.clearUI);
    this.clearUI = '';

    console.log(`${chalk.green(`[${step}/${this.totalSteps}]`)} ${message} ${chalk.dim(`(${duration}ms)`)}`);
  }

  // TODO
  snapshotEnd(snapshot: any) {
    console.log(`${SNAPPED} ${getTestString(snapshot)}`);
  }

  end() {
    console.log();
  }
}

export default function dotReporter() {
  return new Reporter();
}
