// @flow
import build from '../';
import fixturez from 'fixturez';
import path from 'path';
import { initBasic, snapshotDistFiles, install } from '../../../test-utils';
import { confirms } from '../../messages';
import { FatalError } from '../../errors';

const f = fixturez(__dirname);

jest.mock('../../prompt');

jest.mock('install-packages');

let unsafeRequire = require;

test('monorepo', async () => {
  let tmpPath = f.copy('monorepo');
  await initBasic(tmpPath);
  await install(tmpPath);
  await build(tmpPath);
  let counter = 1;
  for (let pkg of ['package-one', 'package-two']) {
    let pkgPath = path.join(tmpPath, 'packages', pkg);
    await snapshotDistFiles(pkgPath);

    expect(unsafeRequire(pkgPath).default).toBe(counter++);
  }
});

// TODO: make it faster so this isn't required
jest.setTimeout(20000);

test('@babel/runtime installed', async () => {
  let tmpPath = f.copy('babel-runtime-installed');

  await install(tmpPath);

  await build(tmpPath);

  await snapshotDistFiles(tmpPath);
});

test('monorepo single package', async () => {
  let tmpPath = f.copy('monorepo-single-package');
  await initBasic(tmpPath);
  await install(tmpPath);

  await build(tmpPath);
  let pkgPath = path.join(tmpPath, 'packages', 'package-two');
  await snapshotDistFiles(pkgPath);

  expect(unsafeRequire(pkgPath).default).toBe(2);
});

test('needs @babel/runtime disallow install', async () => {
  let tmpPath = f.copy('use-babel-runtime');
  await install(tmpPath);
  confirms.shouldInstallBabelRuntime.mockReturnValue(Promise.resolve(false));

  try {
    await build(tmpPath);
  } catch (err) {
    expect(err).toBeInstanceOf(FatalError);
    expect(err.message).toMatchInlineSnapshot(
      `"@babel/runtime should be in dependencies of use-babel-runtime"`
    );
    // TODO: investigate why this is called more than one time
    expect(confirms.shouldInstallBabelRuntime).toHaveBeenCalled();
    return;
  }
  expect(true).toBe(false);
});
