import build from '../';
import fixturez from 'fixturez';
import { snapshotDirectory, stripHashes } from '../../../test-utils';

const f = fixturez(__dirname);

let unsafeRequire = require;

jest.setTimeout(10000);

jest.mock('../../prompt');

test('basic field type', async () => {
  let tmpPath = f.copy('basic-field-type');

  await build(tmpPath);

  await snapshotDirectory(tmpPath, { ...stripHashes('(Field)'), files: 'all' });

  let { MyCoolFieldType } = unsafeRequire(tmpPath);
  let Field = unsafeRequire(MyCoolFieldType.views.Field);
  expect(Field.default()).toBe('my cool react component stuff');
});
