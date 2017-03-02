import {join, relative} from 'path';
import {mkdirpSync, writeFileSync, readJSONSync} from 'fs-extra';
import webpack from 'webpack';

import {Workspace} from '../workspace';

interface AssetDetails {
  js: string[],
  css: string[],
}

interface AssetListing {
  [key: string]: Partial<AssetDetails>,
}

export default async function generateAssets(workspace: Workspace) {
  const {config, directories} = workspace;
  // typescript-disable-next-line
  const {webpack: webpackConfig, files, ...extraConfig} = config;
  const {assets, build} = directories;

  const testComponents = files.map((test, index) => ({
    name: `PhotographerTestComponent${index}`,
    path: relative(build, test),
  }));

  mkdirpSync(assets);

  writeFileSync(join(build, 'index.js'), `
    var React = require('react');
    var ReactDOM = require('react-dom');

    var Runner = snapshotInteropRequire(require('react-snapshots/lib/components/Runner'));

    ${testComponents.map(({name, path}) => `var ${name} = snapshotInteropRequire(require(${path}))`).join('\n')}

    function snapshotInteropRequire(mod) {
      return mod.__esModule ? mod.default : mod;
    }

    ReactDOM.render(
      React.createElement(Runner, {
        tests: [${testComponents.map(({name}) => name).join(', ')}],
        config: ${JSON.stringify({...extraConfig, files})},
      }),
      document.getElementById('root')
    );
  `);

  await new Promise((resolve, reject) => {
    webpack(webpackConfig).run((error, stats) => {
      if (error != null) {
        return reject(error);
      } else if (stats.hasErrors()) {
        return reject(new Error(stats.toString()));
      }

      resolve();
    });
  });

  const builtAssets: AssetListing = readJSONSync(join(build, 'assets.json'));
  const {js: scripts, css: styles} = Object.keys(builtAssets).reduce((all, key) => {
    const {js, css} = builtAssets[key];
    if (js) { all.js.push(...js); }
    if (css) { all.css.push(...css); }
    return all;
  }, {js: [], css: []} as AssetDetails);

  writeFileSync(join(build, 'index.html'), `
    <!DOCTYPE html>
    <head>
      <meta charset="utf-8">
      <title>React snapshot tests</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      ${styles.map((style) => `<link rel="stylesheet" href="${style}"></link>`)}
    </head>

    <body>
      <div id="root"></div>
      <% scripts.forEach(function(script) { %>
        <script type="text/javascript" src="<%- script %>"></script>
      <% }); %>

      ${scripts.map((script) => `<script type="text/javascript" src="${script}"></script>`)}
    </body>
    </html>
  `);
}
