// @flow

import cosmiconfig from 'cosmiconfig';
import glob from 'globby';
import path from 'path';

export type ConfigType = {
  [key: string]: any,
};

export default async function getConfig(): Promise<ConfigType> {
  const {config} = await cosmiconfig('snapshots');
  config.webpack = config.webpack || {};
  config.webpack.entry = [
    'core-js/es6/promise',
    './.snapshots/index.js',
  ];

  config.webpack.output = config.webpack.output || {
    path: path.resolve('./.snapshots/build'),
    publicPath: '/static/',
    filename: '[name].js',
  };

  config.webpack.resolve = config.webpack.resolve || {};
  config.webpack.resolve.alias = config.webpack.resolve.alias || {};
  config.webpack.resolve.alias['react-snapshots'] = path.resolve(__dirname, '..');

  config.files = glob.sync(config.files || []);
  return config;
}
