import execa from 'execa';
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

// the success cases for build and start are tested in

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
  });
  expect(result.exitCode).toBe(0);
  expect(result.all!.replace(/\d+(|\.\d) k?B/g, 'size').replace(/chunks\/.*\.js/, 'chunks/hash.js'))
    .toMatchInlineSnapshot(`
    "✨ Building Keystone
    ✨ Generating Admin UI code
    ✨ Generating Keystone config code
    ✨ Building Admin UI
    info  - Using webpack 4. Reason: future.webpack5 option not enabled https://nextjs.org/docs/messages/webpack5
    info  - Checking validity of types...
    info  - Creating an optimized production build...
    info  - Compiled successfully
    info  - Collecting page data...
    info  - Generating static pages (0/6)
    info  - Generating static pages (1/6)
    info  - Generating static pages (2/6)
    info  - Generating static pages (4/6)
    info  - Generating static pages (6/6)
    info  - Finalizing page optimization...

    Page                                                           Size     First Load JS
    ┌ ○ /                                                          1.76 kB         199 kB
    ├   /_app                                                      0 B             197 kB
    ├ ○ /404                                                       3.44 kB         201 kB
    ├ λ /api/__keystone_api_build                                  0 B             197 kB
    ├ ○ /no-access                                                 1.54 kB         199 kB
    ├ ○ /todos                                                     24.5 kB         222 kB
    └ ○ /todos/[id]                                                5.24 kB         203 kB
    + First Load JS shared by all                                  197 kB
      ├ chunks/126c777f9f9b7289ece21ae42bc83989dfa1d6ca.565b0f.js  65.8 kB
      ├ chunks/55daa7e308de45b7fdc3753e04ca073c7b6cdd4c.800dc2.js  30.6 kB
      ├ chunks/6af0358f98ea97ed9221d1ad4fa493d9c36bec5a.2fbf1f.js  13.4 kB
      ├ chunks/99bfd935b074ada4d52ef17fef5bb16a2d3b0efa.dad4f8.js  34.7 kB
      ├ chunks/framework.054e3a.js                                 42 kB
      ├ chunks/main.6ffe44.js                                      7.12 kB
      ├ chunks/pages/_app.d610d6.js                                2.98 kB
      └ chunks/webpack.50bee0.js                                   751 B

    λ  (Server)  server-side renders at runtime (uses getInitialProps or getServerSideProps)
    ○  (Static)  automatically rendered as static HTML (uses no initial props)
    ●  (SSG)     automatically generated as static HTML + JSON (uses getStaticProps)
       (ISR)     incremental static regeneration (uses revalidate in getStaticProps)
    "
  `);
});
