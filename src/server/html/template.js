// @flow

import type React from 'react';
import serialize from 'serialize-javascript';

function cssImports(css) {
  return css
    .map((cssPath) => `<link href="${cssPath}" rel="stylesheet" type="text/css" />`)
    .join('\n');
}

function javascriptImports(javascript) {
  return javascript
    .map((scriptPath) => `<script type="text/javascript" src="${scriptPath}" defer></script>`)
    .join('\n');
}

function metaTags(meta) {
  return Object.keys(meta).map((metaKey) => `<meta name="${metaKey}" content="${meta[metaKey]}" />`);
}

// :: Assets -> Content -> String
type TemplateAssetType = {
  css?: string[],
  javascript?: string[],
};

export type TemplateOptionsType = {
  title?: ?string,
  meta?: Object,
  initialState?: Object,
  reactRootElement: string | React.Element,
};

function createTemplate({css = [], javascript = []}: TemplateAssetType = {}) {
  const cssLinks = cssImports(css);
  const javascriptScripts = javascriptImports(javascript);

  return function pageTemplate({meta = {}, initialState = {}, reactRootElement}: TemplateOptionsType = {}) {
    return `
      <!DOCTYPE html>
      <html lang='en'>
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta httpEquiv="Content-Language" content="en" />
          <meta name="viewport" content="width=device-width, initial-scale=1">

          <title>Shopify</title>

          ${metaTags(meta)}

          ${cssLinks}
          ${javascriptScripts}
        </head>
        <body>
          <div id='app'>${reactRootElement}</div>

          <script type='text/javascript'>
            window.APP_STATE=${serialize(initialState)};
          </script>
        </body>
      </html>
    `;
  };
}

export default createTemplate;
