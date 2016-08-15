const webpackConfigFactory = require('./webpack-config-factory');

module.exports = function serverConfigFactory({mode = 'development'} = {}, args = {}) {
  return webpackConfigFactory({target: 'server', mode}, args);
};
