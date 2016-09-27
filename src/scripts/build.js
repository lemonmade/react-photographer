// @flow

import build from '@lemonmade/react-universal-dev/lib/build';
import loadConfig from '../cli/config';

(async () => {
  const {report: config} = await loadConfig();
  await build({mode: 'production'}, config);
})();
