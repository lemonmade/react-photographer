// @flow

import run from '../../../run';
import runReport from '../../../report';
import loadConfig from '../../../config';

export const builder = {
  record: {
    describe: 'Re-record all snapshot tests. This will remove any existing reference images, so be careful!',
    type: 'boolean',
  },
  report: {
    describe: 'Automatically open the browser report after the test runs',
    type: 'boolean',
  },
};

type RunOptions = {
  record?: boolean,
  report?: boolean,
};

export async function handler({record, report}: RunOptions) {
  const config = await loadConfig();

  if (record != null) {
    config.record = record;
  }

  await run(config);

  if (report) {
    runReport(config);
  } else {
    process.exit(0);
  }
}
