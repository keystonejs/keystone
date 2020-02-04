// We need to set the packageDir for eslint to the parent or it thinks /client has a bunch of unmanaged deps
const config = require('../../../.eslintrc');
const path = require('path');

module.exports = {
  ...config,
  rules: {
    ...config.rules,
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: path.join(__dirname, '../'),
        devDependencies: [
          '**/__tests__/**/*.js',
          '**/*test.js',
          '**/tests/**/*.js',
          '**/examples/**/*.js',
          '**/build/**/*.js',
          `packages/fields/src/**/filterTests.js`,
        ],
      },
    ],
  },
};
