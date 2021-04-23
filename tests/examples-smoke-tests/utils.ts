import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import _treeKill from 'tree-kill';
import * as playwright from 'playwright';

async function deleteAllData(projectDir: string) {
  const { PrismaClient } = require(path.join(projectDir, 'node_modules/.prisma/client'));

  let prisma = new PrismaClient();

  await Promise.all(Object.values(prisma).map((x: any) => x?.deleteMany?.()));

  await prisma.$disconnect();
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

export const initFirstItemTest = (getPage: () => playwright.Page) => {
  test('init first item', async () => {
    let page = getPage();
    await page.fill('label:has-text("Name") >> .. >> input', 'Admin');
    await page.fill('label:has-text("Email") >> .. >> input', 'admin@keystonejs.com');
    await page.click('button:has-text("Set Password")');
    await page.fill('[placeholder="New Password"]', 'password');
    await page.fill('[placeholder="Confirm Password"]', 'password');
    await page.click('button:has-text("Get started")');
    await page.uncheck('input[type="checkbox"]', { force: true });
    await Promise.all([page.waitForNavigation(), page.click('text=Continue')]);
    await page.waitForSelector('text=Signed in as Admin');
  });
};

export const exampleProjectTests = (
  exampleName: string,
  tests: (browser: playwright.BrowserType<playwright.Browser>) => void
) => {
  const projectDir = path.join(__dirname, '..', '..', 'examples', exampleName);
  describe.each(['dev', 'prod'] as const)('%s', mode => {
    let cleanupKeystoneProcess = () => {};

    afterAll(async () => {
      await cleanupKeystoneProcess();
    });

    async function startKeystone(command: 'start' | 'dev') {
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
        await treeKill(keystoneProcess.pid);
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
      tests(playwright[browserName]);
    });
  });
};
