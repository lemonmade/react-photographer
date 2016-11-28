// @flow

import fs from 'fs-extra';
import type {Config} from '../config';

export default class Database {
  config: Config;

  constructor(config: Config) {
    this.config = config;

    let snapshots = {};

    try {
      snapshots = fs.readJSONSync(config.detailsFile).snapshots.reduce((all, snapshot) => {
        snapshot.status = 'UNCHANGED';
        all[snapshot.id] = snapshot;
        return all;
      }, {});
    } catch (error) {
      // no file, just return empty details
    }

    let results = {};

    try {
      results = fs.readJSONSync(config.resultsFile);
    } catch (error) {
      // no file, just return empty details
    }

    Object.keys(results).forEach((id) => {
      snapshots[id].result = results[id];
    });

    this.snapshots = snapshots;
  }

  getAll() {
    return Object.keys(this.snapshots).map((id) => this.snapshots[id]);
  }

  get({id}) {
    return this.snapshots[id];
  }

  async set(snapshot, {dump = false} = {}) {
    const {id} = snapshot;
    this.snapshots[id] = snapshot;
    if (dump) { await this.dump(); }
    return snapshot;
  }

  dump() {
    const {config, snapshots} = this;

    const snapshotContent = [];
    const resultContent = {};

    Object.keys(snapshots).map((key) => snapshots[key]).forEach((sourceSnapshot) => {
      // eslint-disable-next-line no-unused-vars
      const {result, status, ...snapshot} = sourceSnapshot;
      snapshotContent.push(snapshot);
      resultContent[snapshot.id] = result;
    });

    fs.writeFileSync(config.detailsFile, JSON.stringify({snapshots: snapshotContent}, null, 2));
    fs.writeFileSync(config.resultsFile, JSON.stringify(resultContent, null, 2));
  }
}
