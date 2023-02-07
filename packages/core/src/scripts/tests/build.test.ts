import execa from 'execa';
import * as fs from 'fs-extra';
import stripAnsi from 'strip-ansi';
import { ExitError } from '../utils';
import {
  basicKeystoneConfig,
  cliBinPath,
  recordConsole,
  runCommand,
  schemas,
  symlinkKeystoneDeps,
  testdir,
} from './utils';

// the general success cases for build and start are tested in the example smoke tests

test("start errors when a build hasn't happened", async () => {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.js': basicKeystoneConfig,
  });
  const recording = recordConsole();
  await expect(runCommand(tmp, 'start')).rejects.toEqual(new ExitError(1));
  expect(recording()).toMatchInlineSnapshot(`
    "✨ Starting Keystone
    🚨 keystone build must be run before running keystone start"
  `);
});

// this build test will be slow
jest.setTimeout(1000000);

// this implicitly tests that dev also works here because dev uses the same mechanism that build uses
test('build works with typescript without the user defining a babel config', async () => {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.ts': await fs.readFile(`${__dirname}/fixtures/with-ts.ts`, 'utf8'),
  });
  const result = await execa('node', [cliBinPath, 'build'], {
    reject: false,
    all: true,
    cwd: tmp,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
    } as any,
  });
  expect(await fs.readFile(`${tmp}/node_modules/.keystone/types.js`, 'utf8')).toBe('');
  expect(
    stripAnsi(result.all!)
      .replace(
        '\nwarn  - No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache',
        ''
      )
      .replace('warn  - No ESLint configuration detected. Run next lint to begin setup\n', '')
      // the exact formatting of the build size report can change when making unrelated changes
      // because the code size can change so we don't include it in the snapshot
      .replace(/info  - Finalizing page optimization\.\.\.[^]+\n\n/, 'next build size report\n')
  ).toMatchInlineSnapshot(`
    "✨ Generated GraphQL and Prisma schemas
    ✨ Building Keystone
    ✨ Generating Admin UI code
    ✨ Building Admin UI
    info  - Skipping validation of types
    info  - Skipping linting
    info  - Creating an optimized production build...
    info  - Compiled successfully
    info  - Collecting page data...
    info  - Generating static pages (0/7)
    info  - Generating static pages (1/7)
    info  - Generating static pages (3/7)
    info  - Generating static pages (5/7)
    info  - Generating static pages (7/7)
    next build size report
    ○  (Static)  automatically rendered as static HTML (uses no initial props)
    "
  `);
  expect(result.exitCode).toBe(0);
});

test('process.env.NODE_ENV is production in production', async () => {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.ts': await fs.readFile(`${__dirname}/fixtures/log-node-env.ts`, 'utf8'),
  });
  const result = await execa('node', [cliBinPath, 'build'], {
    reject: false,
    all: true,
    cwd: tmp,
    buffer: true,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
    } as any,
  });
  expect(result.exitCode).toBe(0);
  const startResult = execa('node', [cliBinPath, 'start'], {
    reject: false,
    all: true,
    cwd: tmp,

    env: {
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
    } as any,
  });
  let output = '';
  try {
    await Promise.race([
      new Promise((resolve, reject) =>
        setTimeout(() => reject(new Error(`timed out. output:\n${output}`)), 10000)
      ),
      new Promise<void>(resolve => {
        startResult.all!.on('data', data => {
          output += data;
          if (output.includes('the env is: production')) {
            resolve();
          }
        });
      }),
    ]);
  } finally {
    startResult.kill();
  }
});
