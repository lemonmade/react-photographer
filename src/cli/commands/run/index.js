import run from '../../../run';
import report from '../../../report'
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

export async function handler({record, report}) {
  const config = await loadConfig();

  if (record != null) {
    config.record = record;
  }

  await run(config);
  process.exit(0);
}
