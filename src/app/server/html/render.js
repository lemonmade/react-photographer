// @flow

import type React from 'react';
import {renderToString} from 'react-dom/server';
import createTemplate from './template';

// TODO: Import the webpack config and resolve the bundle assets location from it.
import ClientBundleAssets from '../../../../build/client/assets.json';

// This takes the assets.json file that was output by webpack for our client
// bundle and converts it into an object that contains all the paths to our
// javascript and css files.  Doing this is required as for production
// configurations we add a hash to our filenames, therefore we won't know the
// paths of the output by webpack unless we read them from the assets.json file.
const chunks = Object.keys(ClientBundleAssets).map((key) => ClientBundleAssets[key]);
const assets = chunks.reduce((acc, chunk) => {
  if (chunk.js) {
    acc.javascript.push(chunk.js);
  }

  if (chunk.css) {
    acc.css.push(chunk.css);
  }

  return acc;
}, {javascript: [], css: []});

// We prepare a template using the asset data.
const template = createTemplate(assets);

type RenderOptionsType = {
  rootElement?: React.Element,
  initialState?: Object,
  meta?: Object,
};

export default function render({rootElement, initialState, meta = {}}: RenderOptionsType = {}) {
  return template({
    meta,
    reactRootElement: rootElement ? renderToString(rootElement) : '',
    initialState,
  });
}
