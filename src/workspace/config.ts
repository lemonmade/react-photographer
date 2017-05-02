import {sync as globSync} from 'glob';
import {Viewport} from '../types';

// For some reason, doing this as import cosmiconfig breaks only the
// tests.
const cosmiconfig = require('cosmiconfig');

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
  port?: Config['port'],
  files?: string,
  rootDirectory?: Config['rootDirectory'],
  snapshotDirectory?: Config['snapshotDirectory'],
  record?: Config['record'],
  threshold?: Config['threshold'],
  workers?: Config['workers'],
  viewports?: Config['viewports'],
  webpack?: Config['webpack'],
}

export function createMemoryConfig(baseConfig: UserConfig = {}): Config {
  let files: string[];

  if (baseConfig.files) {
    files = globSync(baseConfig.files);
  } else {
    files = [];
  }

  const config = {
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

  return config;
}

const configGetter = cosmiconfig('photographer');

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
