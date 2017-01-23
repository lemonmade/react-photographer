import {join} from 'path';
import express = require('express');
import {Workspace} from '../workspace';

export default function app({config, directories}: Workspace) {
  const app = express();

  app.use(directories.public, express.static(directories.assets));

  app.get('/', (req, res) => {
    res.sendFile(join(directories.build, 'index.html'));
  });

  return app;
}
