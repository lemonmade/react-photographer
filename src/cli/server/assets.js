// @flow

import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import webpack from 'webpack';

import type {ConfigType} from '../config';

type AssetDetailsType = {
  js?: string[],
  css?: string[],
}

type AssetListingType = {
  [key: string]: AssetDetailsType,
};

export default async function generateAssets(config: ConfigType): Promise {
  const {assetPath, buildPath} = config;

  fs.mkdirpSync(assetPath);

  fs.writeFileSync(path.join(buildPath, 'index.js'), renderTemplate('test.js.ejs', {
    testComponents: config.files.map((test, index) => ({
      name: `SnapshotTestComponent${index}`,
      path: path.relative(buildPath, test),
    })),
  }));

  await new Promise((resolve, reject) => {
    webpack(config.webpack).run((err) => {
      if (err != null) {
        reject(err);
        return;
      }

      resolve();
    });
  });

  const assets: AssetListingType = fs.readJSONSync(path.join(buildPath, 'assets.json'));
  const {scripts, styles} = Object.keys(assets).reduce((all, key) => {
    const {js, css} = assets[key];
    if (js) { all.scripts.push(js); }
    if (css) { all.styles.push(css); }
    return all;
  }, {scripts: [], styles: []});

  fs.writeFileSync(
    path.join(buildPath, 'index.html'),
    renderTemplate('test.html.ejs', {scripts, styles})
  );
}

function renderTemplate(template, data) {
  return ejs.render(
    fs.readFileSync(path.join(__dirname, `../templates/${template}`), 'utf8'),
    data
  );
}
