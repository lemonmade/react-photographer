import createDebug = require('debug');
import createUI from './ui';
import {Snapshot, CompareResult, CaptureResult, Step} from '../types';

const debug = createDebug('photographer');

export default class Logger {
  constructor(private ui: Partial<Logger> = createUI()) {}

  title(title: string, options: {icon?: string}) {
    this.ui.title && this.ui.title(title, options);
  }

  clear() {
    this.ui.clear && this.ui.clear();
  }

  start() {
    this.ui.start && this.ui.start();
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

  snapshotStart(snapshot: Snapshot) {
    this.ui.snapshotStart && this.ui.snapshotStart(snapshot);
  }

  snapshotCaptureStart(snapshot: Snapshot) {
    this.ui.snapshotCaptureStart && this.ui.snapshotCaptureStart(snapshot);
  }

  snapshotCaptureEnd(snapshot: Snapshot, captureResult: CaptureResult) {
    this.ui.snapshotCaptureEnd && this.ui.snapshotCaptureEnd(snapshot, captureResult);
  }

  snapshotCompareStart(snapshot: Snapshot) {
    this.ui.snapshotCompareStart && this.ui.snapshotCompareStart(snapshot);
  }

  snapshotCompareEnd(snapshot: Snapshot, compareResult: CompareResult) {
    this.ui.snapshotCompareEnd && this.ui.snapshotCompareEnd(snapshot, compareResult);
  }

  snapshotEnd(snapshot: Snapshot, captureResult: CaptureResult, compareResult: CompareResult) {
    this.ui.snapshotEnd && this.ui.snapshotEnd(snapshot, captureResult, compareResult);
  }

  end() {
    this.ui.end && this.ui.end();
  }

  debug(message: string) {
    if (this.ui.debug) {
      this.ui.debug(message);
    } else {
      debug(message);
    }
  }
}
