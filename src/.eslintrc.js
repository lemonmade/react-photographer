module.exports = {
  extends: [
    'plugin:shopify/esnext',
    'plugin:shopify/node',
  ],
  rules: {
    'no-sync': 'off',
    'no-process': 'off',
  }
};
