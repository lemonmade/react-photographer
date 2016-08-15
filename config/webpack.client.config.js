const webpackConfigFactory = require('./webpack-config-factory');

module.exports = function clientConfigFactory({mode = 'development'} = {}, args = {}) {
  return webpackConfigFactory({target: 'client', mode}, args);
};
