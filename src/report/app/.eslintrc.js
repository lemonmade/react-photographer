module.exports = {
  extends: [
    'plugin:shopify/react',
    'plugin:shopify/flow',
  ],
  rules: {
    'flowtype/type-id-match': [
      'warn',
      '^([A-Z][a-z0-9]+)*(Type|Props|State|Context)$',
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: [
          'node_modules',
          '.',
        ],
      },
    },
  },
};
