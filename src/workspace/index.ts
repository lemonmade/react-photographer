import {resolve} from 'path';
import {readJSONSync} from 'fs-extra';

import loadConfig, {Config, UserConfig} from './config';
import {lazy} from '../utilities/decorators';

export {Config};

export class Workspace {
  @lazy
  get directories() {
    const {rootDirectory, snapshotDirectory, webpack} = this.config;

    return {
      root: rootDirectory,
      snapshots: resolve(rootDirectory, snapshotDirectory),
      reference: resolve(rootDirectory, snapshotDirectory, 'reference'),
      compare: resolve(rootDirectory, snapshotDirectory, 'compare'),
      diff: resolve(rootDirectory, snapshotDirectory, 'diff'),
      build: resolve(rootDirectory, '.photographer'),
      assets: resolve(rootDirectory, '.photographer', 'assets'),
      public: (webpack.output && webpack.output.publicPath) || '/assets/',
    };
  }

  @lazy
  get files() {
    const {directories} = this;

    return {
      details: resolve(directories.snapshots, 'details.json'),
      results: resolve(directories.build, 'results.json'),
    };
  }

  @lazy
  get version(): string {
    return readJSONSync(resolve(__dirname, '../package.json')).version
  };

  constructor(public config: Config) {}
}

export default async function createWorkspace(baseConfig?: UserConfig) {
  const config = await loadConfig(baseConfig);
  return new Workspace(config);
}
