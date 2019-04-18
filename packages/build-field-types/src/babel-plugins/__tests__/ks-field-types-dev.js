// @flow
import * as babel from '@babel/core';
import plugin from '../ks-field-types-dev';

test('ks-field-types-dev babel plugin', () => {
  let input = `
    import { importView } from '@keystone-alpha/build-field-types'

    importView('./some-view')`;
  const { code } = babel.transformSync(input, {
    plugins: [plugin],
    babelrc: false,
    configFile: false,
    filename: __filename,
  });
  expect(code).toMatchSnapshot();
});
