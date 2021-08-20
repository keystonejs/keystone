import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import execa from 'execa';
import _treeKill from 'tree-kill';
import * as playwright from 'playwright';
import { findRootSync } from '@manypkg/find-root';
import dotenv from 'dotenv';

export function getDeleteFn(projectRoot: string) {
  return async (projectDir: string) => {
    console.log(path.resolve(projectRoot, projectDir, 'node_modules/.prisma/client'));
    const { PrismaClient } = require(path.resolve(
      projectRoot,
      projectDir,
      'node_modules/.prisma/client'
    ));

    let prisma = new PrismaClient();

    await Promise.all(Object.values(prisma).map((x: any) => x?.deleteMany?.()));

    await prisma.$disconnect();
  };
}

const treeKill = promisify(_treeKill);

// this'll take a while
jest.setTimeout(10000000);

const promiseSignal = (): Promise<void> & { resolve: () => void } => {
  let resolve;
  let promise = new Promise<void>(_resolve => {
    resolve = _resolve;
  });
  return Object.assign(promise, { resolve: resolve as any });
};

export const adminUITests = (
  pathToTest: string,
  tests: (
    browser: playwright.BrowserType<playwright.Browser>,
    deleteAllData: (projectDir: string) => Promise<void>
  ) => void
) => {
  const projectRoot = findRootSync(process.cwd());
  const deleteAllData: (projectDir: string) => Promise<void> = getDeleteFn(projectRoot);
  const projectDir = path.join(projectRoot, pathToTest);
  dotenv.config();
  describe.each(['dev', 'prod'] as const)('%s', mode => {
    let cleanupKeystoneProcess = () => {};

    afterAll(async () => {
      await cleanupKeystoneProcess();
    });

    async function startKeystone(command: 'start' | 'dev') {
      if (!fs.existsSync(projectDir)) {
        throw new Error(`No such file or directory ${projectDir}`);
      }

      let keystoneProcess = execa('yarn', ['keystone-next', command], {
        cwd: projectDir,
        env: process.env,
      });

      let adminUIReady = promiseSignal();
      let listener = (chunk: any) => {
        let stringified = chunk.toString('utf8');
        if (process.env.VERBOSE) {
          console.log(stringified);
        }
        if (stringified.includes('API ready')) {
          adminUIReady.resolve();
        }
      };
      keystoneProcess.stdout!.on('data', listener);
      keystoneProcess.stderr!.on('data', listener);

      cleanupKeystoneProcess = async () => {
        keystoneProcess.stdout!.off('data', listener);
        keystoneProcess.stderr!.off('data', listener);
        // childProcess.kill will only kill the direct child process
        // so we use tree-kill to kill the process and it's children
        await treeKill(keystoneProcess.pid!);
      };
      await adminUIReady;
    }

    if (mode === 'dev') {
      test('start keystone in dev', async () => {
        await startKeystone('dev');
      });
    }

    if (mode === 'prod') {
      test('build keystone', async () => {
        let keystoneBuildProcess = execa('yarn', ['build'], {
          cwd: projectDir,
          env: process.env,
        });
        if (process.env.VERBOSE) {
          const logChunk = (chunk: any) => {
            console.log(chunk.toString('utf8'));
          };
          keystoneBuildProcess.stdout!.on('data', logChunk);
          keystoneBuildProcess.stderr!.on('data', logChunk);
        }
        await keystoneBuildProcess;
      });
      test('start keystone in prod', async () => {
        await startKeystone('start');
      });
    }

    describe.each([
      'chromium',
      'firefox',
      // we don't run the tests on webkit in production
      // because unlike chromium and firefox
      // webkit doesn't treat localhost as a secure context
      // and we enable secure cookies in production
      ...(mode === 'prod' ? [] : (['webkit'] as const)),
    ] as const)('%s', browserName => {
      beforeAll(async () => {
        await deleteAllData(projectDir);
      });
      tests(playwright[browserName], deleteAllData);
    });
  });
};
