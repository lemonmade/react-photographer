import {resolve} from 'path';

export default function createReportServerConfig() {
  const projectRoot = resolve(__dirname, '..');
  const appDir = resolve(projectRoot, './report/app');
  return {
    projectRoot,
    appDir,
    dataDir: resolve(appDir, './data'),
    buildDir: resolve(projectRoot, './build'),
    componentDir: resolve(appDir, './components'),
    sectionDir: resolve(appDir, './sections'),
    stylesDir: resolve(appDir, './styles'),
    scriptsDir: resolve(appDir, './scripts'),
    publicPath: '/assets/',
    serverPort: 3000,
    clientDevServerPort: 8060,
  };
}
