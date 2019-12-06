import fixturez from 'fixturez';
import fix from '../fix';
import path from 'path';
import { errors } from '../messages';
import { getPkg, modifyPkg, logMock } from '../../test-utils';

const f = fixturez(__dirname);

jest.mock('../prompt');

test('no entrypoint', async () => {
  let tmpPath = f.copy('no-entrypoint');
  try {
    await fix(tmpPath);
  } catch (error) {
    expect(error.message).toBe(errors.noSource('src/index'));
  }
});

test('set main and module field', async () => {
  let tmpPath = f.copy('basic-package');

  await modifyPkg(tmpPath, json => {
    json.module = 'bad.js';
  });

  await fix(tmpPath);

  let pkg = await getPkg(tmpPath);

  expect(pkg).toMatchInlineSnapshot(`
        Object {
          "license": "MIT",
          "main": "dist/basic-package.cjs.js",
          "module": "dist/basic-package.esm.js",
          "name": "basic-package",
          "private": true,
          "version": "1.0.0",
        }
    `);
});

test('monorepo', async () => {
  let tmpPath = f.copy('monorepo');

  for (let name of ['package-one', 'package-two']) {
    await modifyPkg(path.join(tmpPath, 'packages', name), pkg => {
      pkg.module = 'bad.js';
    });
  }

  await fix(tmpPath);

  let pkg1 = await getPkg(path.join(tmpPath, 'packages', 'package-one'));
  let pkg2 = await getPkg(path.join(tmpPath, 'packages', 'package-two'));

  expect(pkg1).toMatchInlineSnapshot(`
        Object {
          "license": "MIT",
          "main": "dist/package-one.cjs.js",
          "module": "dist/package-one.esm.js",
          "name": "@some-scope/package-one",
          "private": true,
          "version": "1.0.0",
        }
    `);

  expect(pkg2).toMatchInlineSnapshot(`
        Object {
          "license": "MIT",
          "main": "dist/package-two.cjs.js",
          "module": "dist/package-two.esm.js",
          "name": "@some-scope/package-two",
          "private": true,
          "version": "1.0.0",
        }
    `);
});

test('does not modify if already valid', async () => {
  let tmpPath = f.copy('valid-package');
  let original = await getPkg(tmpPath);

  await fix(tmpPath);
  let current = await getPkg(tmpPath);
  expect(original).toEqual(current);
  expect(logMock.log.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "🎁 success",
        "project already valid!",
      ],
    ]
  `);
});

test('invalid fields', async () => {
  let tmpPath = f.copy('invalid-fields');

  await fix(tmpPath);

  let pkg = await getPkg(tmpPath);

  expect(pkg).toMatchInlineSnapshot(`
        Object {
          "license": "MIT",
          "main": "dist/invalid-fields.cjs.js",
          "module": "dist/invalid-fields.esm.js",
          "name": "invalid-fields",
          "private": true,
          "react-native": "dist/index.native.js",
          "version": "1.0.0",
        }
    `);
});

test('monorepo single package', async () => {
  let tmpPath = f.copy('monorepo-single-package');

  await fix(tmpPath);
  expect(logMock.log.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "🎁 success",
        "project already valid!",
      ],
    ]
  `);
});
