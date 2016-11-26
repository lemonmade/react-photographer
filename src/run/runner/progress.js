// @flow

class Component {
  count = 0;
  total = 0;
  passCount = 0;
  failCount = 0;
  skipCount = 0;

  add(result) {
    const {skipped, passed} = result;

    if (skipped) {
      this.skipCount += 1;
    } else if (passed) {
      this.passCount += 1;
    } else {
      this.failCount += 1;
    }

    this.count += 1;
  }

  get skipped() {
    return this.skipCount === this.total;
  }

  get passed() {
    return this.complete && this.failCount === 0 && this.passCount > 0;
  }

  get failed() {
    return this.complete && this.failCount > 0;
  }

  get complete() {
    return this.count === this.total;
  }
}

export default class Progress {
  testsPassed = 0;
  testsFailed = 0;
  testsSkipped = 0;
  componentsPassed = 0;
  componentsFailed = 0;
  componentsSkipped = 0;

  constructor(tests) {
    this.testsTotal = tests.length;

    this.components = tests.reduce((all, {component}) => {
      all[component] = all[component] || new Component();
      all[component].total += 1;
      return all;
    }, {});

    this.componentsTotal = Object.keys(this.components).length;
  }

  add(snapshot) {
    const {component, result} = snapshot;
    const {skipped, passed} = result;
    const componentDetails = this.components[component];

    if (skipped) {
      this.testsSkipped += 1;
    } else if (passed) {
      this.testsPassed += 1;
    } else {
      this.testsFailed += 1;
    }

    if (!componentDetails.complete) {
      componentDetails.add(result);

      if (componentDetails.skipped) {
        this.componentsSkipped += 1;
      } else if (componentDetails.passed) {
        this.componentsPassed += 1;
      } else if (componentDetails.failed) {
        this.componentsFailed += 1;
      }
    }
  }

  get componentsCompleted() {
    return this.componentsPassed + this.componentsSkipped + this.componentsFailed;
  }

  get testsCompleted() {
    return this.testsPassed + this.testsSkipped + this.testsFailed;
  }
}
