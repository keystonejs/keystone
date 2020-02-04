// gatsby doesn't seem to look at eslintrcs in
// higher directories than the site's directory
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
