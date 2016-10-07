// @flow

import cosmiconfig from 'cosmiconfig';
import glob from 'globby';
import path from 'path';

import createWebpackConfig from './webpack';
import createReportConfig from './report';

export type UserConfigType = {
  files?: string[],
  snapshotRoot?: string,
  buildPath?: string,
  webpack?: Object,
};

export type ConfigType = {
  [key: string]: any,
};

export default async function getConfig(): Promise<ConfigType> {
  const {config}: {config: UserConfigType} = await cosmiconfig('photographer');
  const finalConfig = {...config};

  finalConfig.snapshotRoot = config.snapshotRoot || path.resolve('./snapshots');
  finalConfig.detailsFile = config.detailsFile || path.join(finalConfig.snapshotRoot, 'details.json');
  finalConfig.buildPath = config.buildPath || path.resolve('./.photographer');
  finalConfig.assetPath = config.assetPath || path.join(finalConfig.buildPath, 'assets');
  finalConfig.resultsFile = config.resultsFile || path.join(finalConfig.buildPath, 'results.json');
  finalConfig.webpack = createWebpackConfig(finalConfig);
  finalConfig.report = createReportConfig(finalConfig);
  finalConfig.files = glob.sync(config.files || []);
  finalConfig.threshold = config.threshold == null ? 0 : config.threshold;
  finalConfig.record = config.record == null ? false : config.record;
  finalConfig.viewports = config.viewports || [{height: 400, width: 400}];

  return finalConfig;
}
