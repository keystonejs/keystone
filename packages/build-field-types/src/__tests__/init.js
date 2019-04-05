// @flow
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

  confirms.writeMainField.mockReturnValue(true);

  try {
    await init(tmpPath);
  } catch (error) {
    expect(error.message).toBe(errors.deniedWriteMainField);
  }
  expect(confirms.writeMainField).toHaveBeenCalledTimes(1);
});

test('set only main field', async () => {
  let tmpPath = f.copy('basic-package');

  confirms.writeMainField.mockReturnValue(true);
  confirms.writeModuleField.mockReturnValue(false);

  await init(tmpPath);
  expect(confirms.writeMainField).toHaveBeenCalledTimes(1);
  expect(confirms.writeModuleField).toHaveBeenCalledTimes(1);

  let pkg = await getPkg(tmpPath);
  expect(pkg).toMatchInlineSnapshot(`
Object {
  "license": "MIT",
  "main": "dist/basic-package.cjs.js",
  "name": "basic-package",
  "private": true,
  "version": "1.0.0",
}
`);
});

test('set main and module field', async () => {
  let tmpPath = f.copy('basic-package');

  confirms.writeMainField.mockReturnValue(true);
  confirms.writeModuleField.mockReturnValue(true);

  await init(tmpPath);
  expect(confirms.writeMainField).toHaveBeenCalledTimes(1);
  expect(confirms.writeModuleField).toHaveBeenCalledTimes(1);

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

  confirms.writeMainField.mockReturnValue(true);
  confirms.writeModuleField.mockReturnValue(true);

  await init(tmpPath);
  expect(confirms.writeMainField).toHaveBeenCalledTimes(1);
  expect(confirms.writeModuleField).toHaveBeenCalledTimes(1);
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

  confirms.writeMainField.mockReturnValue(true);
  confirms.writeModuleField.mockReturnValue(true);

  await init(tmpPath);
  expect(confirms.writeMainField).toHaveBeenCalledTimes(2);
  expect(confirms.writeModuleField).toHaveBeenCalledTimes(2);

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
    "🎁 info valid-package",
    "module field is valid",
  ],
  Array [
    "🎁 success",
    "initialised package!",
  ],
]
`);
});

test('invalid fields', async () => {
  let tmpPath = f.copy('invalid-fields');

  confirms.writeMainField.mockReturnValue(true);
  confirms.writeModuleField.mockReturnValue(true);

  await init(tmpPath);

  expect(confirms.writeMainField).toHaveBeenCalledTimes(1);
  expect(confirms.writeModuleField).toHaveBeenCalledTimes(1);

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
    preconstruct: {
      entrypoints: ['.', 'two', 'three'],
    },
  },
  one: {
    preconstruct: {
      source: '../src',
    },
  },
  two: {
    preconstruct: {
      source: '../src',
    },
  },
};

testInit('three entrypoints, no main, only add main', basicThreeEntrypoints, async run => {
  confirms.writeMainField.mockReturnValue(true);
  confirms.writeModuleField.mockReturnValue(false);

  let result = await run();

  expect(result).toMatchInlineSnapshot(`
Object {
  "": Object {
    "main": "dist/something.cjs.js",
    "name": "something",
    "preconstruct": Object {
      "entrypoints": Array [
        ".",
        "two",
        "three",
      ],
    },
  },
  "one": Object {
    "preconstruct": Object {
      "source": "../src",
    },
  },
  "two": Object {
    "main": "dist/something.cjs.js",
    "preconstruct": Object {
      "source": "../src",
    },
  },
}
`);
});

testInit('three entrypoints, no main, add main and module', basicThreeEntrypoints, async run => {
  confirms.writeMainField.mockReturnValue(true);
  confirms.writeModuleField.mockReturnValue(true);

  let result = await run();

  expect(result).toMatchInlineSnapshot(`
Object {
  "": Object {
    "main": "dist/something.cjs.js",
    "module": "dist/something.esm.js",
    "name": "something",
    "preconstruct": Object {
      "entrypoints": Array [
        ".",
        "two",
        "three",
      ],
    },
  },
  "one": Object {
    "preconstruct": Object {
      "source": "../src",
    },
  },
  "two": Object {
    "main": "dist/something.cjs.js",
    "module": "dist/something.esm.js",
    "preconstruct": Object {
      "source": "../src",
    },
  },
}
`);
});
