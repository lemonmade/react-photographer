import {resolve} from 'path';
import {readJSONSync} from 'fs-extra';

import loadConfig, {Config, UserConfig} from './config';
import {lazy} from '../utilities/decorators';

export {Config};

export class Workspace {
  @lazy
  get directories() {
    const {rootDirectory, snapshotDirectory, webpack} = this.config;
    const snapshots = resolve(rootDirectory, snapshotDirectory);
    const photographer = resolve(rootDirectory, '.photographer');
    const assets = resolve(photographer, 'assets');

    return {
      root: rootDirectory,
      snapshots,
      reference: resolve(snapshots, 'reference'),
      latest: resolve(snapshots, 'latest'),
      diff: resolve(snapshots, 'diff'),
      photographer,
      runs: resolve(photographer, 'runs'),
      runnerAssets: resolve(assets, 'runner'),
      builtAssets: resolve(assets, 'built'),
      public: (webpack.output && webpack.output.publicPath) || '/assets/',
    };
  }

  @lazy
  get files() {
    const {directories} = this;

    return {
      details: resolve(directories.snapshots, 'details.json'),
      testJS: resolve(directories.runnerAssets, 'index.js'),
      testHTML: resolve(directories.runnerAssets, 'index.html'),
      manifest: resolve(directories.builtAssets, 'assets.json'),
    };
  }

  @lazy
  get version(): string {
    return readJSONSync(resolve(__dirname, '../package.json')).version
  }

  // @lazy
  // get webpack(): Config['webpack'] {
  //   const {webpack} = this.config;

  //   return webpack;
  // }

  get url(): string {
    return `http://${this.config.host}:${this.config.port}`;
  }

  constructor(public config: Config) {}
}

export default async function createWorkspace(baseConfig?: UserConfig) {
  const config = await loadConfig(baseConfig);
  return new Workspace(config);
}
