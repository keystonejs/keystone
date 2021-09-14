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
    🚨 keystone-next build must be run before running keystone-next start"
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
                     import { config, list } from "@keystone-next/keystone/schema";
                     import { text } from "@keystone-next/fields";

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
  expect(result.exitCode).toBe(0);
  expect(
    result
      .all!.replace(/\d+(|\.\d+) k?B/g, 'size')
      .replace(/chunks\/.*\.js/g, 'chunks/hash.js')
      .replace(
        '\nwarn  - No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache',
        ''
      )
  ).toMatchInlineSnapshot(`
    "✨ Building Keystone
    ✨ Generating Admin UI code
    ✨ Generating Keystone config code
    ✨ Building Admin UI
    [36minfo[39m  - Using webpack 4. Reason: custom webpack configuration in next.config.js https://nextjs.org/docs/messages/webpack5
    [33mwarn[39m  - No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
    [36minfo[39m  - Checking validity of types...
    [36minfo[39m  - Creating an optimized production build...
    [36minfo[39m  - Compiled successfully
    [36minfo[39m  - Collecting page data...
    [36minfo[39m  - Generating static pages (0/6)
    [36minfo[39m  - Generating static pages (1/6)
    [36minfo[39m  - Generating static pages (2/6)
    [36minfo[39m  - Generating static pages (4/6)
    [36minfo[39m  - Generating static pages (6/6)
    [36minfo[39m  - Finalizing page optimization...

    [4mPage[24m                                                           [4mSize[24m     [4mFirst Load JS[24m
    ┌ ○ /                                                          size         [31m[1msize[22m[39m
    ├   /_app                                                      size             [31m[1msize[22m[39m
    ├ ○ /404                                                       size         [31m[1msize[22m[39m
    ├ λ /api/__keystone_api_build                                  size             [31m[1msize[22m[39m
    ├ ○ /no-access                                                 size         [31m[1msize[22m[39m
    ├ ○ /todos                                                     size         [31m[1msize[22m[39m
    └ ○ /todos/[id]                                                size         [31m[1msize[22m[39m
    + First Load JS shared by all                                  [31m[1msize[22m[39m
      ├ chunks/hash.js  size
      ├ chunks/hash.js  size
      ├ chunks/hash.js  size
      ├ chunks/hash.js  size
      ├ chunks/hash.js                                 size
      ├ chunks/hash.js                                      size
      ├ chunks/hash.js                                size
      └ chunks/hash.js                                   size

    λ  (Server)  server-side renders at runtime (uses [36mgetInitialProps[39m or [36mgetServerSideProps[39m)
    ○  (Static)  automatically rendered as static HTML (uses no initial props)
    ●  (SSG)     automatically generated as static HTML + JSON (uses [36mgetStaticProps[39m)
       (ISR)     incremental static regeneration (uses revalidate in [36mgetStaticProps[39m)
    "
  `);
});
