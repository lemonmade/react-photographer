import {relative, basename, dirname, resolve} from 'path';
import {mkdirp, writeFile, readJSON} from 'fs-extra';
import webpack = require('webpack');
import AssetsPlugin = require('assets-webpack-plugin');

import {Workspace} from '../workspace';

interface AssetDetails {
  js: string[],
  css: string[],
}

interface AssetListing {
  [key: string]: Partial<AssetDetails>,
}

export default async function generateAssets(workspace: Workspace) {
  (process as any).noDeprecation = true;

  const {config, directories, files: assetFiles} = workspace;
  // typescript-disable-next-line
  const {webpack: webpackConfig, files, ...extraConfig} = config;
  const {runnerAssets, builtAssets} = directories;

  const testComponents = files.map((test, index) => ({
    name: `PhotographerTestComponent${index}`,
    path: relative(dirname(assetFiles.testJS), test),
  }));

  await mkdirp(runnerAssets);
  await mkdirp(builtAssets);

  await writeFile(assetFiles.testJS, `
    var React = require('react');
    var ReactDOM = require('react-dom');

    var Runner = require('react-photographer').Runner;

    ${testComponents.map(({name, path}) => `var ${name} = snapshotInteropRequireDefault(require(${JSON.stringify(path)}))`).join('\n')}

    function snapshotInteropRequireDefault(mod) {
      return mod.__esModule ? mod.default : mod;
    }

    ReactDOM.render(
      React.createElement(Runner, {
        sources: [${testComponents.map(({name}) => name).join(', ')}],
        config: ${JSON.stringify({...extraConfig, files})},
      }),
      document.getElementById('root')
    );
  `);

  const finalWebpackConfig = {
    ...webpackConfig,
    entry: [assetFiles.testJS],
    output: {
      path: builtAssets,
      publicPath: directories.public,
      filename: '[name].js',
    },
    resolve: {
      ...webpackConfig['resolve'],
      alias: {
        ...(webpackConfig['resolve'] || {})['alias'],
        // TODO: REMOVE THIS EVENTUALLY
        'react-photographer': resolve(directories.root, '..', '..'),
      },
    },
    plugins: [
      ...webpackConfig['plugins'],
      new AssetsPlugin({
        filename: basename(assetFiles.manifest),
        path: dirname(assetFiles.manifest),
      })
    ],
  };

  await new Promise((resolve, reject) => {
    webpack(finalWebpackConfig).run((error, stats) => {
      if (error != null) {
        return reject(error);
      } else if (stats.hasErrors()) {
        return reject(new Error(stats.toString()));
      }

      resolve();
    });
  });

  const assetListing: AssetListing = await readJSON(assetFiles.manifest);
  const {js: scripts, css: styles} = Object.keys(assetListing).reduce((all, key) => {
    const {js, css} = assetListing[key];
    if (js) { all.js.push(...(Array.isArray(js) ? js : [js])); }
    if (css) { all.css.push(...(Array.isArray(css) ? css : [css])); }
    return all;
  }, {js: [], css: []} as AssetDetails);

  await writeFile(assetFiles.testHTML, `
    <!DOCTYPE html>
    <head>
      <meta charset="utf-8">
      <title>React snapshot tests</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      ${styles.map((style) => `<link rel="stylesheet" href="${style}"></link>`)}
    </head>

    <body>
      <div id="root"></div>
      ${scripts.map((script) => `<script type="text/javascript" src="${script}"></script>`)}
    </body>
    </html>
  `);
}
