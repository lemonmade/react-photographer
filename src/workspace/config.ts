import * as cosmiconfig from 'cosmiconfig';
import {sync as globSync} from 'glob';

import {Viewport} from '../types';

interface WebpackConfig {
  output?: {
    publicPath?: string,
  },
  [key: string]: any,
}

export interface Config {
  files: string[],
  rootDirectory: string,
  snapshotDirectory: string,
  host: string,
  port: number,
  record: boolean,
  threshold: number,
  workers: number,
  viewports: Viewport[],
  webpack: WebpackConfig,
}

export interface UserConfig {
  files?: string,
  rootDirectory?: Config['rootDirectory'],
  snapshotDirectory?: Config['snapshotDirectory'],
  record?: Config['record'],
  threshold?: Config['threshold'],
  workers?: Config['workers'],
  viewports?: Config['viewports'],
  webpack?: Config['webpack'],
}

export function createMemoryConfig(baseConfig?: UserConfig): Config {
  let files: string[];

  if (baseConfig && baseConfig.files) {
    files = globSync(baseConfig.files);
  } else {
    files = [];
  }

  return {
    port: 8080,
    host: 'localhost',
    snapshotDirectory: 'snapshots',
    rootDirectory: process.cwd(),
    record: false,
    threshold: 0,
    workers: 2,
    viewports: [{height: 400, width: 400}],
    webpack: {},
    ...baseConfig,
    files,
  };
}

const configGetter = cosmiconfig<UserConfig>('photographer');

export default async function createConfig(baseConfig?: UserConfig): Promise<Config> {
  let userConfig: UserConfig;

  try {
    const loadedConfig = await configGetter.load(process.cwd());
    userConfig = loadedConfig == null ? {} : loadedConfig.config;
  } catch (error) {
    userConfig = {};
  }

  return createMemoryConfig({...userConfig, ...baseConfig});
}
