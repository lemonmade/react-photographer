import createDebug = require('debug');
import createUI from './ui';

const debug = createDebug('photographer');

interface Step {
  step: number,
  message: string,
}

export default class Logger {
  constructor(private ui: Partial<Logger> = createUI()) {}

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

  setupEnd(steps: number)   {
    this.ui.setupEnd && this.ui.setupEnd(steps);
  }

  runStart() {
    this.ui.runStart && this.ui.runStart();
  }

  snapshotStart(snapshot: any) {
    this.ui.snapshotStart && this.ui.snapshotStart(snapshot);
  }

  snapshotEnd(snapshot: any, result: any) {
    this.ui.snapshotEnd && this.ui.snapshotEnd(snapshot, result);
  }

  runEnd() {
    this.ui.runEnd && this.ui.runEnd();
  }

  debug(message: string) {
    if (this.ui.debug) {
      this.ui.debug(message);
    } else {
      debug(message);
    }
  }
}
