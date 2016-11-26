// @flow

const {resolve} = require('path');
const dev = require('@lemonmade/react-universal-dev/dev').default;
const loadConfig = require('../lib/config').default;

function cleanup(...args) {
  console.log(...args);
}

process.on('SIGINT', cleanup);
process.on('uncaughtException', cleanup);
process.on('unhandledRejection', cleanup);

const projectRoot = resolve(__dirname, '../src');
const appDir = resolve(projectRoot, './report/app');

const devConfig = {
  projectRoot,
  appDir,
  dataDir: resolve(appDir, './data'),
  buildDir: resolve(projectRoot, './build'),
  componentDir: resolve(appDir, './components'),
  sectionDir: resolve(appDir, './sections'),
  stylesDir: resolve(appDir, './styles'),
  scriptsDir: resolve(appDir, './scripts'),
  publicPath: '/assets/',
  serverPort: 3000,
  clientDevServerPort: 8060,
};

loadConfig({
  root: resolve(__dirname, '../examples/custom-webpack-config'),
})
  .then((projectConfig) => dev(devConfig, projectConfig))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
