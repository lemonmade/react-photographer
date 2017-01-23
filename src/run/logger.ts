import createDebug from 'debug';
import Aggregate from './aggregate';

const debug = createDebug('photographer');

export default class Logger {
  constructor(private ui: Partial<Logger>) {}

  title(title: string, options: {icon?: string}) {
    this.ui.title && this.ui.title(title, options);
  }

  clear() {
    this.ui.clear && this.ui.clear();
  }

  start(aggregate: Aggregate) {
    this.ui.start && this.ui.start(aggregate);
  }

  stepCount(count: number) {
    this.ui.stepCount && this.ui.stepCount(count);
  }

  step(details: {message: string}) {
    this.ui.step && this.ui.step(details);
  }

  test() {
    this.ui.test && this.ui.test();
  }

  end(aggregate: Aggregate) {
    this.ui.end && this.ui.end(aggregate);
  }

  debug(message: string) {
    if (this.ui.debug) {
      this.ui.debug(message);
    } else {
      debug(message);
    }
  }
}
