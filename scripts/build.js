// @flow

import build from '@lemonmade/react-universal-dev/build';
import loadConfig from '../src/config';

(async () => {
  const {report: config} = await loadConfig();
  await build(config, {mode: 'production'});
})();
