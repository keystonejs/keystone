// @flow
import build from '../';
import fixturez from 'fixturez';
import { snapshotDirectory } from '../../../test-utils';

const f = fixturez(__dirname);

let unsafeRequire = require;

jest.setTimeout(10000);

jest.mock('../../prompt');

test('basic field type', async () => {
  let tmpPath = f.copy('basic-field-type');

  await build(tmpPath);

  await snapshotDirectory(tmpPath);

  let { MyCoolFieldType } = unsafeRequire(tmpPath);

  expect(MyCoolFieldType.views.Field()).toBe('my cool react component stuff');
});
