import {resolve} from 'path';

import {Workspace} from '..';
import {createMemoryConfig, Config} from '../config';

describe('Workspace', () => {
  let config: Config;

  beforeEach(() => {
    config = createMemoryConfig({
      rootDirectory: __dirname,
      snapshotDirectory: 'my-snapshots',
    });
  });

  it('provides the paths to all relevant directories', () => {
    const {directories} = new Workspace(config);

    expect(directories.root).toEqual(config.rootDirectory);
    expect(directories.snapshots).toEqual(resolve(config.rootDirectory, config.snapshotDirectory));
    expect(directories.build).toEqual(resolve(config.rootDirectory, '.photographer'));
    expect(directories.assets).toEqual(resolve(config.rootDirectory, '.photographer', 'assets'));
    expect(directories.reference).toEqual(resolve(config.rootDirectory, config.snapshotDirectory, 'reference'));
    expect(directories.compare).toEqual(resolve(config.rootDirectory, config.snapshotDirectory, 'compare'));
    expect(directories.diff).toEqual(resolve(config.rootDirectory, config.snapshotDirectory, 'diff'));
    expect(directories.public).toEqual('/assets/');
  });

  it('provides the paths to all relevant files', () => {
    const {files} = new Workspace(config);

    expect(files.details).toEqual(resolve(config.rootDirectory, config.snapshotDirectory, 'details.json'));
    expect(files.results).toEqual(resolve(config.rootDirectory, '.photographer', 'results.json'));
  });

  it('uses the webpack output path as the public path', () => {
    const {directories} = new Workspace(createMemoryConfig({
      webpack: {
        output: {
          publicPath: '/foo/',
        },
      },
    }));

    expect(directories.public).toEqual('/foo/');
  });

  it('creates a URL based on the config port', () => {
    const {url} = new Workspace(createMemoryConfig({
      port: 1234,
    }));

    expect(url).toBe('http://localhost:1234');
  });
});
