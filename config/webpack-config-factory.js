/* eslint-disable no-console, no-process-env */

const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const autoprefixer = require('autoprefixer');
const postcssWillChange = require('postcss-will-change');
const postcssDiscardComments = require('postcss-discard-comments');
const postcssCalc = require('postcss-calc');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssSelectorMatches = require('postcss-selector-matches');

// @see https://github.com/motdotla/dotenv
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '..');

dotenv.config({silent: true});

function removeEmpty(x) {
  return x.filter(Boolean);
}

function ifElse(condition) {
  return (then, or) => (condition ? then : or);
}

function merge(...args) {
  return Object.assign({}, ...removeEmpty(args));
}

function webpackConfigFactory({target, mode}, {json}) {
  if (['client', 'server'].find((valid) => target === valid) == null) {
    throw new Error('You must provide a "target" (client|server) to the webpackConfigFactory.');
  }


  if (['development', 'production'].find((valid) => mode === valid) == null) {
    throw new Error('You must provide a "mode" (development|production) to the webpackConfigFactory.');
  }

  if (!json) {
    // Our bundle is outputing json for bundle analysis, therefore we don't
    // want to do this console output as it will interfere with the json output.
    //
    // You can run a bundle analysis by executing the following:
    //
    // $(npm bin)/webpack \
    //   --env.mode production \
    //   --config webpack.client.config.js \
    //   --json \
    //   > build/client/analysis.json
    //
    // And then upload the build/client/analysis.json to http://webpack.github.io/analyse/
    // This allows you to analyse your webpack bundle to make sure it is
    // optimal.
    console.log(`==> ℹ️  Creating webpack "${target}" config in "${mode}" mode`);
  }

  const isDev = (mode === 'development');
  const isProd = (mode === 'production');
  const isClient = (target === 'client');
  const isServer = (target === 'server');

  const ifDev = ifElse(isDev);
  const ifProd = ifElse(isProd);
  const ifClient = ifElse(isClient);
  const ifServer = ifElse(isServer);
  const ifDevClient = ifElse(isDev && isClient);
  const ifDevServer = ifElse(isDev && isServer);
  const ifProdClient = ifElse(isProd && isClient);

  return {
    target: ifServer('node', 'web'),
    // We have to set this to be able to use these items when executing a
    // server bundle.  Otherwise strangeness happens, like __dirname resolving
    // to '/'.  There is no effect on our client bundle.
    node: {
      __dirname: true,
      __filename: true,
    },
    externals: removeEmpty([
      ifServer(nodeExternals({
        // Add any dependencies here that need to be processed by Webpack
        binaryDirs: [],
      })),
    ]),
    devtool: ifElse(isServer || isDev)(
      'source-map',
      'hidden-source-map'
    ),
    entry: merge(
      {
        main: removeEmpty([
          ifDevClient('react-hot-loader/patch'),
          ifDevClient(`webpack-hot-middleware/client?reload=true&path=http://localhost:${process.env.CLIENT_DEVSERVER_PORT}/__webpack_hmr`),
          path.resolve(projectRoot, `./src/${target}/index.js`),
        ]),
      }
    ),
    output: {
      path: path.resolve(projectRoot, `./build/${target}`),
      filename: ifProdClient('[name]-[hash].js', '[name].js'),
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: ifDev(
        // As we run a seperate server for our client and server bundles we
        // need to use an absolute http path for our assets public path.
        `http://localhost:${process.env.CLIENT_DEVSERVER_PORT}/assets/`,
        '/assets/'
      ),
      libraryTarget: ifServer('commonjs2', 'var'),
    },
    resolve: {
      // These extensions are tried when resolving a file.
      extensions: [
        '.js',
        '.jsx',
        '.json',
      ],
    },
    plugins: removeEmpty([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(mode),
          SERVER_PORT: JSON.stringify(process.env.SERVER_PORT),
          CLIENT_DEVSERVER_PORT: JSON.stringify(process.env.CLIENT_DEVSERVER_PORT),
          DISABLE_SSR: process.env.DISABLE_SSR === 'true',
        },
      }),

      // Generates a JSON file containing a map of all the output files for
      // our webpack bundle.  A necessisty for our server rendering process
      // as we need to interogate these files in order to know what JS/CSS
      // we need to inject into our HTML.
      new AssetsPlugin({
        filename: 'assets.json',
        path: path.resolve(projectRoot, `./build/${target}`),
      }),

      ifDev(new webpack.NoErrorsPlugin()),
      ifDevClient(new webpack.optimize.OccurrenceOrderPlugin()),
      ifDevClient(new webpack.HotModuleReplacementPlugin()),
      ifDevServer(new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})),

      ifProdClient(
        new webpack.LoaderOptionsPlugin({
          minimize: true,
          debug: false,
        })
      ),

      ifProdClient(
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            screw_ie8: true, // eslint-disable-line camelcase
            warnings: false,
          },
        })
      ),

      ifProd(new webpack.optimize.DedupePlugin()),

      ifProdClient(
        new ExtractTextPlugin({filename: '[name]-[chunkhash].css', allChunks: true})
      ),
    ]),
    module: {
      loaders: [
        {
          test: /\.(jpe?g|png|gif|svg)$/,
          loader: 'file-loader',
        },
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: [/node_modules/, path.resolve(projectRoot, './build')],
          query: merge(
            {
              env: {
                development: {
                  presets: [
                    {plugins: ['./src/data/babel-relay-plugin']},
                  ],
                  plugins: [
                    'react-hot-loader/babel',
                  ],
                },
              },
            },
            ifServer({
              presets: [
                'shopify/node',
                'shopify/react',
              ],
            }),
            ifClient({
              // For our clients code we will need to transpile our JS into
              // ES5 code for wider browser/device compatability.
              presets: [
                ['shopify/web', {modules: false}],
                'shopify/react',
              ],
            })
          ),
        },

        {
          test: /\.json$/,
          loader: 'json-loader',
        },

        merge(
          {test: /\.scss$/},
          ifServer({
            loaders: [
              'fake-style-loader',
              'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
              'sass-loader',
            ],
          }),
          ifProdClient({
            loader: ExtractTextPlugin.extract({
              notExtractLoader: 'style-loader',
              loader: 'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]!sass-loader!postcss-loader',
            }),
          }),
          ifDevClient({
            loaders: [
              'style-loader',
              {
                loader: 'css-loader',
                query: {
                  sourceMap: true,
                  modules: true,
                  importLoaders: 1,
                  localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
                },
              },
              {
                loader: 'sass-loader',
                query: {sourceMap: true},
              },
              {
                loader: 'postcss-loader',
                query: {sourceMap: true},
              },
            ],
          })
        ),
      ],
    },
    postcss: [
      postcssDiscardComments(),
      postcssCalc(),
      postcssFlexbugsFixes,
      postcssSelectorMatches,
      postcssWillChange,
      autoprefixer(),
    ],
    sassLoader: {
      includePaths: [
        path.resolve(projectRoot, './src/app'),
      ],
    },
  };
}

module.exports = webpackConfigFactory;
