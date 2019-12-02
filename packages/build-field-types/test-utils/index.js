/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import * as fs from 'fs-extra';
import globby from 'globby';
import fixturez from 'fixturez';
import spawn from 'spawndamnit';

let f = fixturez(__dirname);

require('chalk').enabled = false;
console.error = jest.fn();
console.log = jest.fn();

export let logMock = {
  log: console.log,
  error: console.error,
};

afterEach(() => {
  logMock.log.mockReset();
  logMock.error.mockReset();
});

import init from '../src/init';
import { confirms } from '../src/messages';

export async function initBasic(directory) {
  confirms.writeMainModuleFields.mockReturnValue(true);
  await init(directory);
  confirms.writeMainModuleFields.mockReset();
}

function getPkgPath(tmpPath) {
  return path.join(tmpPath, 'package.json');
}

export async function getPkg(filepath) {
  return JSON.parse(await fs.readFile(path.join(filepath, 'package.json'), 'utf-8'));
}

export async function modifyPkg(tmpPath, cb) {
  let json = await getPkg(tmpPath);
  await cb(json);

  let pkgPath = getPkgPath(tmpPath);
  await fs.writeFile(pkgPath, JSON.stringify(json, null, 2));
}

export let createPackageCheckTestCreator = doResult => {
  let createTestCreator = testFn => async (testName, entrypoints, cb) => {
    testFn(testName, async () => {
      let tmpPath = f.copy('template-simple-package');
      let things = Object.keys(entrypoints);
      await Promise.all(
        things.map(async entrypointPath => {
          let content = entrypoints[entrypointPath];
          let filepath = path.join(tmpPath, entrypointPath, 'package.json');
          await fs.ensureFile(filepath);
          await fs.writeFile(filepath, JSON.stringify(content, null, 2));
        })
      );

      await cb(async () => {
        await doResult(tmpPath);

        let newThings = {};

        await Promise.all(
          things.map(async entrypointPath => {
            newThings[entrypointPath] = JSON.parse(
              await fs.readFile(path.join(tmpPath, entrypointPath, 'package.json'), 'utf8')
            );
          })
        );
        return newThings;
      });
    });
  };
  let testFn = createTestCreator(test);
  testFn.only = createTestCreator(test.only);
  testFn.skip = createTestCreator(test.skip);
  return testFn;
};

export async function snapshotDistFiles(tmpPath) {
  let distPath = path.join(tmpPath, 'dist');
  let distFiles;
  try {
    distFiles = await fs.readdir(distPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(distPath + ' does not exist');
    }
    throw err;
  }

  await Promise.all(
    distFiles.map(async x => {
      expect(await fs.readFile(path.join(distPath, x), 'utf-8')).toMatchSnapshot(x);
    })
  );
}

export let stripHashes = chunkName => {
  let transformer = pathname => {
    return pathname.replace(
      new RegExp(`(${chunkName}-[^\\.]+|dist\\/[^\\.]+\\/package.json)`, 'g'),
      () => {
        return `chunk-this-is-not-the-real-hash`;
      }
    );
  };
  return {
    transformPath: transformer,
    transformContent: content => {
      return content.replace(new RegExp(`${chunkName}-[^\\.]+`, 'g'), () => {
        return 'chunk-some-hash';
      });
    },
  };
};

export async function snapshotDirectory(
  tmpPath,
  { files = 'js', transformPath = x => x, transformContent = x => x } = {}
) {
  let paths = await globby(
    [`**/${files === 'js' ? '*.js' : '*'}`, '!node_modules/**', '!yarn.lock'],
    {
      cwd: tmpPath,
    }
  );

  await Promise.all(
    paths.map(async x => {
      let content = transformContent(await fs.readFile(path.join(tmpPath, x), 'utf-8'));
      if (x.endsWith('.json')) {
        content = JSON.parse(content);
      }
      expect(content).toMatchSnapshot(transformPath(x, content));
    })
  );
}

export async function install(tmpPath) {
  await spawn('yarn', ['install'], { cwd: tmpPath });
}
