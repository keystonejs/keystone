// @flow
import build from '../';
import fixturez from 'fixturez';
import { FatalError } from '../../errors';
import { snapshotDirectory, install } from '../../../test-utils';

const f = fixturez(__dirname);

jest.mock('../../prompt');

afterEach(() => {
  jest.resetAllMocks();
});

test('typescript', async () => {
  let tmpPath = f.copy('typescript');

  await install(tmpPath);
  await build(tmpPath);

  await snapshotDirectory(tmpPath, 'all');
});

test('package resolvable but not in deps', async () => {
  let tmpPath = f.copy('package-resolvable-but-not-in-deps');
  await install(tmpPath);
  try {
    await build(tmpPath);
  } catch (err) {
    expect(err).toBeInstanceOf(FatalError);
    expect(err.message).toMatchInlineSnapshot(
      `"\\"react\\" is imported by \\"src/index.js\\" but it is not specified in dependencies or peerDependencies"`
    );
    return;
  }
  expect(true).toBe(false);
});
