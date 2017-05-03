import {join} from 'path';
import express = require('express');
import {Workspace} from '../../../workspace';

export default function app({directories}: Workspace) {
  const app = express();

  app.use(directories.public, express.static(directories.builtAssets));

  app.get('/', (_, res) => {
    res.sendFile(join(directories.runnerAssets, 'index.html'));
  });

  return app;
}
