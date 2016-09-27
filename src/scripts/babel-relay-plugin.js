/* eslint-env node */

const getBabelRelayPlugin = require('babel-relay-plugin');
const schema = require('../build/schema.json');

module.exports = getBabelRelayPlugin(schema.data);
