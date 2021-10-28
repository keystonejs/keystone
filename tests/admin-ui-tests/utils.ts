import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import fetch from 'node-fetch';
import execa from 'execa';
import _treeKill from 'tree-kill';
import * as playwright from 'playwright';
import dotenv from 'dotenv';

export async function loadIndex(page: playwright.Page) {
  await page.goto('http://localhost:3000');
  try {
    // sometimes Next will fail to load the page the first time
    // this is probably because Keystone is fetching the API route to compile Keystone
    // while we're fetching an Admin UI page
    // and Next doesn't handle fetching two pages at the same time well
    await page.waitForSelector(':has-text("Dashboard")', { timeout: 2000 });
  } catch {
    await page.goto('http://localhost:3000');
  }
}

const treeKill = promisify(_treeKill);

// this'll take a while
jest.setTimeout(10000000);

export const promiseSignal = (): Promise<void> & { resolve: () => void } => {
  let resolve;
  let promise = new Promise<void>(_resolve => {
    resolve = _resolve;
  });
  return Object.assign(promise, { resolve: resolve as any });
};
const projectRoot = path.resolve(__dirname, '..', '..');

// Light wrapper around node-fetch for making graphql requests to the graphql api of the test instance.
export const makeGqlRequest = async (query: string, variables?: Record<string, any>) => {
  const { data, errors } = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  }).then(res => res.json());

  if (errors) {
    throw new Error(`graphql errors: ${errors.map((x: Error) => x.message).join('\n')}`);
  }

  return data;
};

// Simple utility to create an Array of records given a map function and a range.
export function generateDataArray(map: (key: number) => any, range: number) {
  return Array.from(Array(range).keys()).map(map);
}

export const deleteAllData: (projectDir: string) => Promise<void> = async (projectDir: string) => {
  const resolvedProjectDir = path.resolve(projectRoot, projectDir);
  /**
   * As of @prisma/client@3.1.1 it appears that the prisma client runtime tries to resolve the path to the prisma schema
   * from process.cwd(). This is not always the project directory we want to run keystone from.
   * Here we mutate the process.cwd global with a fn that returns the project directory we expect, such that prisma
   * can retrieve the correct schema file.
   */
  const prevCwd = process.cwd;
  try {
    process.cwd = () => {
      return resolvedProjectDir;
    };
    const { PrismaClient } = require(path.join(resolvedProjectDir, 'node_modules/.prisma/client'));

    let prisma = new PrismaClient();

    await Promise.all(Object.values(prisma).map((x: any) => x?.deleteMany?.({})));

    await prisma.$disconnect();
  } finally {
    process.cwd = prevCwd;
  }
};

export const adminUITests = (
  pathToTest: string,
  tests: (browser: playwright.BrowserType<playwright.Browser>) => void
) => {
  const projectDir = path.join(projectRoot, pathToTest);

  dotenv.config();
  describe.each(['dev', 'prod'] as const)('%s', mode => {
    let cleanupKeystoneProcess = () => {};

    afterAll(async () => {
      await cleanupKeystoneProcess();
    });

    async function startKeystone(command: 'start' | 'dev') {
      cleanupKeystoneProcess = (await generalStartKeystone(projectDir, command)).exit;
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
      tests(playwright[browserName]);
    });
  });
};

export async function generalStartKeystone(projectDir: string, command: 'start' | 'dev') {
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
    if (stringified.includes('Admin UI ready')) {
      adminUIReady.resolve();
    }
  };
  keystoneProcess.stdout!.on('data', listener);
  keystoneProcess.stderr!.on('data', listener);

  await adminUIReady;
  return {
    process: keystoneProcess,
    exit: async () => {
      keystoneProcess.stdout!.off('data', listener);
      keystoneProcess.stderr!.off('data', listener);
      // childProcess.kill will only kill the direct child process
      // so we use tree-kill to kill the process and it's children
      await treeKill(keystoneProcess.pid!);
    },
  };
}
