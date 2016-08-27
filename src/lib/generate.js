import cosmiconfig from 'cosmiconfig';
import glob from 'globby';
import webpack from 'webpack';
import fs from 'fs-extra';

cosmiconfig('snapshots')
  .then(({config}) => {
    const files = glob.sync(config.files);
    const fileContents = `
var React = require('react');
var ReactDOM = require('react-dom');
var SnapshotProvider = snapshotInteropRequire(require('../src/lib/SnapshotProvider'));

${files.map((file, index) => `var SnapshotComponent${index} = snapshotInteropRequire(require('../${file}'));`).join('\n')}

function snapshotInteropRequire(mod) {
  return mod.__esmodule ? mod.default : mod;
}

ReactDOM.render(
  React.createElement(SnapshotProvider, {
    tests: [${files.map((_, index) => `SnapshotComponent${index}`).join(', ')}]
  }),
  document.getElementById('root')
);
`;
    console.log(fileContents);
    const webpackConfig = config.webpack || {};
    webpackConfig.entry = '.snapshots/index.js';

    fs.mkdirpSync('.snapshots');
    fs.writeFileSync('.snapshots/index.js', fileContents);
  });
