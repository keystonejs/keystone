import execa from 'execa';
import * as fs from 'fs-extra';
import { ExitError } from '../utils';
import {
  basicKeystoneConfig,
  cliBinPath,
  js,
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
    'keystone.ts': js`
                     import { config, list } from "@keystone-6/core";
                     import { text } from "@keystone-6/core/fields";

                     type x = string;

                     export default config({
                       db: { provider: "sqlite", url: "file:./app.db" },
                       lists: {
                         Todo: list({
                           fields: {
                             title: text(),
                           },
                         }),
                       },
                     });
                   `,
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
    result
      .all!.replace(
        '\nwarn  - No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache',
        ''
      )
      .replace('warn  - No ESLint configuration detected. Run next lint to begin setup\n', '')
      // the exact formatting of the build size report can change when making unrelated changes
      // because the code size can change so we don't include it in the snapshot
      .replace(/info  - Finalizing page optimization\.\.\.[^]+\n\n/, 'next build size report\n')
  ).toMatchInlineSnapshot(`
    "✨ Building Keystone
    ✨ Generating Admin UI code
    ✨ Generating Keystone config code
    ✨ Building Admin UI
    info  - Skipping validation of types...
    info  - Creating an optimized production build...
    info  - Compiled successfully
    info  - Collecting page data...
    info  - Generating static pages (0/6)
    info  - Generating static pages (1/6)
    info  - Generating static pages (2/6)
    info  - Generating static pages (4/6)
    info  - Generating static pages (6/6)
    next build size report
    λ  (Server)  server-side renders at runtime (uses getInitialProps or getServerSideProps)
    ○  (Static)  automatically rendered as static HTML (uses no initial props)
    "
  `);
  expect(result.exitCode).toBe(0);
});
