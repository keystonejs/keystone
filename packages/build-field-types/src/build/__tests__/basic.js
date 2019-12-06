import build from '../';
import fixturez from 'fixturez';
import { snapshotDistFiles } from '../../../test-utils';

const f = fixturez(__dirname);

jest.mock('../../prompt');

let unsafeRequire = require;

test('basic', async () => {
  let tmpPath = f.copy('valid-package');

  await build(tmpPath);

  await snapshotDistFiles(tmpPath);

  expect(unsafeRequire(tmpPath).default).toBe('something');
});
