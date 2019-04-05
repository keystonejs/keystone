// @flow
import build from '../';
import fixturez from 'fixturez';
import { snapshotDirectory } from '../../../test-utils';

const f = fixturez(__dirname);

jest.setTimeout(10000);

jest.mock('../../prompt');

test('basic field type', async () => {
  let tmpPath = f.copy('basic-field-type');

  await build(tmpPath);

  await snapshotDirectory(tmpPath);
});
