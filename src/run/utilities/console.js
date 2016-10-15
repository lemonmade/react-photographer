import createDebug from 'debug';

export const debug = createDebug('photographer');

export class Logger {
  constructor(reporter) {
    this.reporter = reporter;
  }

  clear() {
    process.stdout.write('\x1B[2J\x1B[0f');
  }

  title(...args) {
    if (typeof this.reporter.title === 'function') {
      this.reporter.title(...args);
    }
  }

  start(...args) {
    if (typeof this.reporter.start === 'function') {
      this.reporter.start(...args);
    }
  }

  test(...args) {
    if (typeof this.reporter.test === 'function') {
      this.reporter.test(...args);
    }
  }

  end(...args) {
    if (typeof this.reporter.end === 'function') {
      this.reporter.end(...args);
    }
  }
}

export function createLogger(reporter) {
  return new Logger(reporter);
}
