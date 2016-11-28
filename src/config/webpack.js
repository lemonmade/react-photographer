// @flow

import path from 'path';
import AssetsPlugin from 'assets-webpack-plugin';

import type {Config} from './';

export default function createWebpackConfig(config: Config) {
  const {webpack = {}, buildPath, assetPath} = config;

  webpack.entry = [
    'core-js/es6/promise',
    path.join(buildPath, 'index.js'),
  ];

  webpack.output = webpack.output || {
    path: assetPath,
    publicPath: '/static/',
    filename: '[name].js',
  };

  webpack.plugins = webpack.plugins || [];
  webpack.plugins.push(
    new AssetsPlugin({
      filename: 'assets.json',
      path: buildPath,
    }),
  );

  webpack.resolve = webpack.resolve || {};
  webpack.resolve.alias = webpack.resolve.alias || {};
  webpack.resolve.alias['react-snapshots'] = path.resolve(__dirname, '..', '..');

  return webpack;
}
