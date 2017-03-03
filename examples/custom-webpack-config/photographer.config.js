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
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                query: {
                  modules: true,
                  importLoaders: 1,
                  localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
                },
              },
              {
                loader: 'sass-loader',
                query: {
                  includePaths: [
                    path.join(rootDir, 'app'),
                  ],
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  plugins: [autoprefixer],
                },
              },
            ],
          }),
        },
      ],
    },
    plugins: [
      new ExtractTextPlugin({filename: '[name].css', allChunks: true}),
    ],
  },
};
