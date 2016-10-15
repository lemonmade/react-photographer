// @flow

import fs from 'fs-extra';

export default class Database {
  constructor(config) {
    this.config = config;

    let snapshots = {};

    try {
      snapshots = fs.readJSONSync(config.detailsFile);
    } catch (error) {
      // no file, just return empty details
    }

    let results = {};

    try {
      results = fs.readJSONSync(config.resultsFile);
    } catch (error) {
      // no file, just return empty details
    }

    this.snapshots = snapshots;
    this.results = results;
  }

  getSnapshot({id}) {
    return this.snapshots[id];
  }

  setSnapshot(snapshot) {
    const {id} = snapshot;
    if (id == null) { return; }
    this.snapshots[id] = snapshot;
  }

  getResult({id}) {
    return this.results[id];
  }

  setResult(result) {
    const {id} = result;
    if (id == null) { return; }
    this.results[id] = result;
  }

  dump() {
    const {config, snapshots, results} = this;

    fs.writeFileSync(config.detailsFile, JSON.stringify(snapshots, null, 2));
    fs.writeFileSync(config.resultsFile, JSON.stringify(results, null, 2));
  }
}
