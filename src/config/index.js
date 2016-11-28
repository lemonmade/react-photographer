// @flow

import cosmiconfig from 'cosmiconfig';
import glob from 'globby';
import path from 'path';

import createWebpackConfig from './webpack';
import createReportConfig from './report';

export type UserConfig = {
  files?: string[],
  snapshotRoot?: string,
  buildPath?: string,
  webpack?: Object,
};

export type Config = {
  [key: string]: any,
};

export default async function getConfig(customConfig: UserConfig = {}): Promise<Config> {
  let config;

  try {
    config = (await cosmiconfig('photographer')).config;
  } catch (error) {
    config = {};
  }

  const finalConfig = {...config, ...customConfig};

  finalConfig.root = finalConfig.root || process.cwd();
  finalConfig.snapshotRoot = config.snapshotRoot || path.resolve(finalConfig.root, './snapshots');
  finalConfig.detailsFile = config.detailsFile || path.join(finalConfig.snapshotRoot, 'details.json');
  finalConfig.buildPath = config.buildPath || path.resolve(finalConfig.root, './.photographer');
  finalConfig.assetPath = config.assetPath || path.join(finalConfig.buildPath, 'assets');
  finalConfig.resultsFile = config.resultsFile || path.join(finalConfig.buildPath, 'results.json');
  finalConfig.webpack = createWebpackConfig(finalConfig);
  finalConfig.report = createReportConfig(finalConfig);
  finalConfig.files = glob.sync(config.files || []);
  finalConfig.threshold = config.threshold == null ? 0 : config.threshold;
  finalConfig.record = config.record == null ? false : config.record;
  finalConfig.viewports = config.viewports || [{height: 400, width: 400}];
  finalConfig.port = config.port || 3000;
  finalConfig.workers = config.workers || 4;

  return finalConfig;
}
