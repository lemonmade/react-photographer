import {resolve} from 'path';
import loadConfig from '../config';

describe('loadConfig()', () => {
  const originalDir = process.cwd();
  const fixtureDir = resolve(__dirname, 'fixtures');

  function loadFixtureDirectory(name: string) {
    process.chdir(resolve(fixtureDir, name));
  }

  afterEach(() => {
    process.chdir(originalDir);
  });

  it('uses sensible defaults', async () => {
    const config = await loadConfig();

    expect(config.files).toEqual([]);
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(8080);
    expect(config.record).toBe(false);
    expect(config.rootDirectory).toBe(process.cwd());
    expect(config.snapshotDirectory).toBe('snapshots');
    expect(config.threshold).toBe(0);
    expect(config.workers).toBe(2);
    expect(config.viewports).toEqual([{height: 400, width: 400}]);
    expect(config.webpack).toEqual({});
  });

  it('loads the config from a javascript file', async () => {
    loadFixtureDirectory('golden-path');
    const config = await loadConfig();
    expect(config.record).toBe(true);
  });

  it('loads the config from package.json', async () => {
    loadFixtureDirectory('package');
    const config = await loadConfig();
    expect(config.record).toBe(true);
  });

  it('loads the config from a .rc file', async () => {
    loadFixtureDirectory('rc');
    const config = await loadConfig();
    expect(config.record).toBe(true);
  });

  it('normalizes the files', async () => {
    // TODO
  });
});
