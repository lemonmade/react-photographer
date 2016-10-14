import fs from 'fs-extra';
import runTest from './test';

export default async function run(tests, env) {
  const {config, logger} = env;
  const existingSnapshots = loadExistingSnapshots(config);

  return await Promise.all(
    tests.map(async (test) => {
      const existingSnapshot = existingSnapshots[test.id];
      const snapshot = getSnapshotDetailsFromTest(test, existingSnapshot);
      const result = await runTest(test, env);

      if (test.record) {
        snapshot.image = result.image;
        result.image = null;
      }

      snapshot.result = result;
      logger.test(snapshot);

      return snapshot;
    }),
  );
}

function loadExistingSnapshots({detailsFile}) {
  const existingSnapshots = {};

  try {
    for (const snapshot of fs.readJSONSync(detailsFile).snapshots) {
      existingSnapshots[snapshot.id] = snapshot;
    }
  } catch (error) {
    // no file, just return empty details
  }

  return existingSnapshots;
}

function getSnapshotDetailsFromTest({
  id,
  name,
  component,
  groups,
  viewport,
  hasMultipleViewports,
}, {image} = {}) {
  return {
    id,
    name,
    component,
    groups,
    viewport,
    hasMultipleViewports,
    image,
    result: null,
  };
}
