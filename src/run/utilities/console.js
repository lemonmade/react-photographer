import createDebug from 'debug';

export const debug = createDebug('photographer');

export class Logger {
  constructor(reporter) {
    this.reporter = reporter;
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
