const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const svgOptimizationOptions = require('@shopify/images/optimize').svgOptions;
const postcssShopify = require('postcss-shopify');

const ICON_PATH_REGEX = /icons\//;
const IMAGE_PATH_REGEX = /\.(jpe?g|png|gif|svg)$/;

const rootDir = __dirname;

module.exports = {
  files: 'src/**/*.snapshot.tsx',
  webpack: {
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    plugins: [
      new ExtractTextPlugin({filename: '[name].css', allChunks: true}),
    ],
    module: {
      loaders: [
        {
          test(resource) {
            return ICON_PATH_REGEX.test(resource) && resource.endsWith('.svg');
          },
          use: [
            {
              loader: '@shopify/images/icon-loader',
            },
            {
              loader: 'image-webpack-loader',
              options: {
                svgo: svgOptimizationOptions(),
              },
            },
          ],
        },
        {
          test(resource) {
            return IMAGE_PATH_REGEX.test(resource) && !ICON_PATH_REGEX.test(resource);
          },
          use: [{
            loader: 'url-loader',
            options: {
              limit: 10000,
              emitFile: true,
            },
          }],
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
                  localIdentName: '[hash:base64:5]',
                },
              },
              {
                loader: 'postcss-loader',
              },
              {
                loader: 'sass-loader',
                query: {
                  includePaths: [
                    path.join(rootDir, 'src', 'styles'),
                  ],
                },
              },
            ],
          }),
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                silent: true,
                useBabel: true,
                useCache: true,
                useTranspileModule: true,
                transpileOnly: true,
                cacheDirectory: path.resolve(__dirname, '.cache', 'typescript'),
                babelOptions: {
                  babelrc: false,
                  presets: [
                    ['shopify/web', {modules: false}],
                    'shopify/react',
                  ],
                },
              },
            },
          ],
        },
      ],
    },
  },
};
