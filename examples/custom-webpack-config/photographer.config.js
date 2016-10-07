/* eslint-env node */

const path = require('path');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const rootDir = __dirname;

module.exports = {
  files: 'app/**/*.snapshot.js',
  webpack: {
    resolve: {
      modules: [
        path.join(rootDir, 'app'),
        'node_modules',
      ],
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: [/node_modules/],
          query: {
            presets: [
              'shopify/web',
              'shopify/react',
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
        path.join(rootDir, 'app'),
      ],
    },
    plugins: [
      new ExtractTextPlugin({filename: '[name].css', allChunks: true}),
    ],
  },
};
