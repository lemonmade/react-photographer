import run from '../../run';
import loadWorkspace from '../../workspace';

export const builder = {
  record: {
    describe: 'Re-record all snapshot tests. This will remove any existing reference images, so be careful!',
    type: 'boolean' as 'boolean',
  },
};

interface Options {
  record?: boolean,
}

export async function handler({record}: Options) {
  const workspace = await loadWorkspace();

  if (record != null) {
    workspace.config.record = record;
  }

  await run(workspace);
}
