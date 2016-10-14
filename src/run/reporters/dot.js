// @flow

import * as Events from '../events';
import {colorForResult, successColor, errorColor, pendingColor} from '../utilities/color';

import readline from 'readline';

const DOT = '.';
const DELAY = 60;
const BARS = '█░'.split('');
const CLEAR_WHOLE_LINE = 0;

function clearLine(stdout) {
  readline.clearLine(stdout, CLEAR_WHOLE_LINE);
  toStartOfLine(stdout);
}

export function toStartOfLine(stdout) {
  readline.cursorTo(stdout, 0);
}

class ProgressBar {
  current = 0;

  constructor(total, stdout = process.stdout) {
    this.total = total;
    this.stdout = stdout;
  }

  tick() {
    this.current += 1;

    if (!this.id) {
      this.id = setTimeout((): void => this.render(), this.delay);
    }

    if (this.current >= this.total) {
      clearTimeout(this.id);
    }
  }

  render() {
    clearTimeout(this.id);
    this.id = null;

    let ratio = this.current / this.total;
    ratio = Math.min(Math.max(ratio, 0), 1);

    const label = ` ${this.current}/${this.total}`;
    const width = Math.max(0, this.stdout.columns - label.length - 1);
    const completeLength = Math.round(width * ratio);
    const complete = BARS[0].repeat(completeLength);
    const incomplete = BARS[1].repeat(width - completeLength);

    toStartOfLine(this.stdout);
    this.stdout.write(`${complete}${incomplete}${label}`);
  }
}

class Reporter {
  start({total}) {
    this.progressBar = new ProgressBar(total);
  }

  test() {
    this.progressBar.tick();
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
