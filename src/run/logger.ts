import createDebug = require('debug');
import Aggregate from './aggregate';

const debug = createDebug('photographer');

interface Step {
  step: number,
  message: string,
}

export default class Logger {
  constructor(private ui: Partial<Logger>) {}

  title(title: string, options: {icon?: string}) {
    this.ui.title && this.ui.title(title, options);
  }

  clear() {
    this.ui.clear && this.ui.clear();
  }

  setupStart(steps: number) {
    this.ui.setupStart && this.ui.setupStart(steps);
  }

  setupStepStart(details: Step) {
    this.ui.setupStepStart && this.ui.setupStepStart(details);
  }

  setupStepEnd(details: Step) {
    this.ui.setupStepEnd && this.ui.setupStepEnd(details);
  }

  setupEnd(steps: number) {
    this.ui.setupEnd && this.ui.setupEnd(steps);
  }

  testsStart(aggregate: Aggregate) {
    this.ui.testsStart && this.ui.testsStart(aggregate);
  }

  testStart(test: any, aggregate: Aggregate) {
    this.ui.testStart && this.ui.testStart(test, aggregate);
  }

  testEnd(test: any, aggregate: Aggregate) {
    this.ui.testEnd && this.ui.testEnd(test, aggregate);
  }

  testsEnd(aggregate: Aggregate) {
    this.ui.testsEnd && this.ui.testsEnd(aggregate);
  }

  debug(message: string) {
    if (this.ui.debug) {
      this.ui.debug(message);
    } else {
      debug(message);
    }
  }
}
