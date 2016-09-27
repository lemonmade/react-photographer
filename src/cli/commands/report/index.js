// import createServer from '../../../app/server';
//

import {resolve} from 'path';
import loadConfig from '../../config';

(async () => {
  const {report: config} = await loadConfig();

  const server = require(
    resolve(__dirname, '../../../build/server/main')
  ).default;
  server(config).listen(config.serverPort);
})().catch((err) => console.error(err));
