/* eslint-env node */

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const rootDir = path.resolve(__dirname, '..');

module.exports = {
  entry: {
    main: [
      'babel-polyfill',
      path.resolve(__dirname, './index.js'),
    ],
  },
  output: {
    path: path.join(rootDir, 'build'),
    publicPath: '/static/',
    filename: '[name].js',
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        query: {
          presets: [
            'es2015',
            'stage-2',
            'react',
          ],
          plugins: [
            'transform-class-properties',
            'transform-export-extensions',
          ],
        },
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          notExtractLoader: 'style-loader',
          loader: 'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]!sass-loader!postcss-loader',
        }),
      },
    ],
  },
  postcss() {
    return [autoprefixer];
  },
  sassLoader: {
    includePaths: [
      __dirname,
    ],
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin({filename: '[name].css', allChunks: true}),
  ],
};
