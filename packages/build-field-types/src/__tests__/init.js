import fixturez from 'fixturez';
import path from 'path';
import init from '../init';
import { confirms, errors } from '../messages';
import { logMock, getPkg, createPackageCheckTestCreator } from '../../test-utils';

const f = fixturez(__dirname);

jest.mock('../prompt');

let testInit = createPackageCheckTestCreator(init);

afterEach(() => {
  jest.resetAllMocks();
});

test('no entrypoint', async () => {
  let tmpPath = f.copy('no-entrypoint');
  try {
    await init(tmpPath);
  } catch (error) {
    expect(error.message).toBe(errors.noSource('src/index'));
  }
});

test('do not allow write', async () => {
  let tmpPath = f.copy('basic-package');

  confirms.writeMainModuleFields.mockReturnValue(Promise.resolve(false));

  try {
    await init(tmpPath);
  } catch (error) {
    expect(error.message).toBe(errors.deniedWriteMainModuleFields);
  }
  expect(confirms.writeMainModuleFields).toHaveBeenCalledTimes(1);
});

test('set main and module field', async () => {
  let tmpPath = f.copy('basic-package');

  confirms.writeMainModuleFields.mockReturnValue(true);

  await init(tmpPath);
  expect(confirms.writeMainModuleFields).toHaveBeenCalledTimes(1);

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

test('scoped package', async () => {
  let tmpPath = f.copy('scoped');

  confirms.writeMainModuleFields.mockReturnValue(true);

  await init(tmpPath);
  expect(confirms.writeMainModuleFields).toHaveBeenCalledTimes(1);

  let pkg = await getPkg(tmpPath);

  expect(pkg).toMatchInlineSnapshot(`
            Object {
              "license": "MIT",
              "main": "dist/some-package.cjs.js",
              "module": "dist/some-package.esm.js",
              "name": "@some-scope/some-package",
              "private": true,
              "version": "1.0.0",
            }
      `);
});

test('monorepo', async () => {
  let tmpPath = f.copy('monorepo');

  confirms.writeMainModuleFields.mockReturnValue(true);
  confirms.writeMainModuleFields.mockReturnValue(true);

  await init(tmpPath);
  expect(confirms.writeMainModuleFields).toHaveBeenCalledTimes(2);

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

test('does not prompt or modify if already valid', async () => {
  let tmpPath = f.copy('valid-package');
  let original = await getPkg(tmpPath);

  await init(tmpPath);
  let current = await getPkg(tmpPath);
  expect(original).toEqual(current);
  expect(logMock.log.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "🎁 info valid-package",
        "main field is valid",
      ],
      Array [
        "🎁 success",
        "initialised project!",
      ],
    ]
  `);
});

test('invalid fields', async () => {
  let tmpPath = f.copy('invalid-fields');

  confirms.writeMainModuleFields.mockReturnValue(true);

  await init(tmpPath);

  expect(confirms.writeMainModuleFields).toHaveBeenCalledTimes(1);

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

let basicThreeEntrypoints = {
  '': {
    name: 'something',
    'field-types': {
      entrypoints: ['.', 'two', 'three'],
    },
  },
  one: {
    'field-types': {
      source: '../src',
    },
  },
  two: {
    'field-types': {
      source: '../src',
    },
  },
};

testInit('three entrypoints, no main, add main and module', basicThreeEntrypoints, async run => {
  confirms.writeMainModuleFields.mockReturnValue(true);

  let result = await run();

  expect(result).toMatchInlineSnapshot(`
            Object {
              "": Object {
                "field-types": Object {
                  "entrypoints": Array [
                    ".",
                    "two",
                    "three",
                  ],
                },
                "main": "dist/something.cjs.js",
                "module": "dist/something.esm.js",
                "name": "something",
              },
              "one": Object {
                "field-types": Object {
                  "source": "../src",
                },
              },
              "two": Object {
                "field-types": Object {
                  "source": "../src",
                },
                "main": "dist/something.cjs.js",
                "module": "dist/something.esm.js",
              },
            }
      `);
});
