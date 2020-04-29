# create-keystone-app

## 3.1.1

### Patch Changes

- [`0229e9f5`](https://github.com/keystonejs/keystone/commit/0229e9f5a0e783d8ace577d3b49bc532cc213754) [#2804](https://github.com/keystonejs/keystone/pull/2804) Thanks [@timleslie](https://github.com/timleslie)! - Updated `create-table` script to use `cross-env` to support Windows. Fixes #2803.

## 3.1.0

### Minor Changes

- [`efff8d66`](https://github.com/keystonejs/keystone/commit/efff8d66a0c6f0d76960927c2839170643b8a3ac) [#2747](https://github.com/keystonejs/keystone/pull/2747) Thanks [@ohmonster](https://github.com/ohmonster)! - Fixed command line arguments to not prompt when connection-string and test-connection arguments are supplied

### Patch Changes

- Updated dependencies [[`98be4b48`](https://github.com/keystonejs/keystone/commit/98be4b4858f0f2cd672910acc5e6cc0c079ce21f)]:
  - @keystonejs/adapter-knex@9.0.2

## 3.0.1

### Patch Changes

- [`4c2d3927`](https://github.com/keystonejs/keystone/commit/4c2d3927d4b81592d65a404c814f111f5b97ce54) [#2735](https://github.com/keystonejs/keystone/pull/2735) Thanks [@timleslie](https://github.com/timleslie)! - Fixed `Starter` project so that it doesn't attempt to initialise data before tables are created.

* [`a9bc0cda`](https://github.com/keystonejs/keystone/commit/a9bc0cda879a12b152063875ca9593cdcaf0b33e) [#2693](https://github.com/keystonejs/keystone/pull/2693) Thanks [@Vultraz](https://github.com/Vultraz)! - Trimmed whitespace from database connection string input.

## 3.0.0

### Major Changes

- [`8d31f10c`](https://github.com/keystonejs/keystone/commit/8d31f10cdc7255cd7414c3a6393049f794042ea7) [#2684](https://github.com/keystonejs/keystone/pull/2684) Thanks [@timleslie](https://github.com/timleslie)! - This release adds support for specifying and testing the database connection string used when setting up a new project.
  The quick-start guide has also been updated to give better instructions on to setup both MongoDB and PostgreSQL databases.

  The command line API for `create keystone-app` has also changed:

  - `--adapter` has been replaced with `--database`, which accepts options of either `MongoDB` or `PostgreSQL`.
  - `--conection-string` has been added, which allows you to specify either a `mongodb://` or `postgres://` connection string.
  - `--test-connection` has been added, which will tell the installer to test the connection string before setting up the project.

### Minor Changes

- [`22f3356f`](https://github.com/keystonejs/keystone/commit/22f3356fece3057d81ca9c1cedc1d225088cb42a) [#2662](https://github.com/keystonejs/keystone/pull/2662) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added instructions for Knex adapters on how to initialise tables after running the CLI.

## 2.0.0

### Major Changes

- [`2ae2bd47`](https://github.com/keystonejs/keystone/commit/2ae2bd47eb54a816cfd4c8cd178c460729cbc258) [#2623](https://github.com/keystonejs/keystone/pull/2623) Thanks [@maryam-mv](https://github.com/maryam-mv)! - Updated @sindresorhus/slugify to fix a problem where it was producing unexpected output, eg. adding unexpected underscores: 'NAME1 Website' => 'nam_e1_website'. The slugify output for db name may be different with this change. For the above example, the output will now be 'name_1_website' for the same string.

  If your database name changes unexpectedly, you can add an environment variable called `DATABASE_URL` with a full path to the database. For more information on configuring database connections read the documentation for the [Knex adapter](https://v5.keystonejs.com/keystonejs/adapter-knex/#knexoptions) or [Mongoose adapter](https://v5.keystonejs.com/keystonejs/adapter-mongoose/#mongoose-database-adapter).

  If you are using the `Slug` field type, in some edge-cases, slugs may change when saved after this update. You can use the `generate` option on the slug field for [custom slug generation](https://v5.keystonejs.com/keystonejs/fields/src/types/slug/#custom-generate-method) if required.

### Patch Changes

- [`b4d16b89`](https://github.com/keystonejs/keystone/commit/b4d16b89aab643f34d70f42823817a246bf16373) [#2560](https://github.com/keystonejs/keystone/pull/2560) Thanks [@JedWatson](https://github.com/JedWatson)! - Updated links to Keystone github project.

* [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063) [#2593](https://github.com/keystonejs/keystone/pull/2593) Thanks [@jossmac](https://github.com/jossmac)! - Applied a more consistent voice throughout documentation.

## 1.7.0

### Minor Changes

- [`6242e221`](https://github.com/keystonejs/keystone/commit/6242e221c43ddef8c40aa1352ea328fa4e9ac39f) [#2532](https://github.com/keystonejs/keystone/pull/2532) Thanks [@Vultraz](https://github.com/Vultraz)! - Improved starter access control example so users can't make themselves admins using it.

## 1.6.2

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

## 1.6.1

### Patch Changes

- [`535ea6a9`](https://github.com/keystonejs/keystone/commit/535ea6a93d74eced46a8e5711a2e6aafa0dca95b) [#2390](https://github.com/keystonejs/keystone/pull/2390) Thanks [@Vultraz](https://github.com/Vultraz)! - Update `cross-env` dependency to 7.0.0.

* [`f0eaaf0c`](https://github.com/keystonejs/keystone/commit/f0eaaf0c412e7e324690e1c98c1e1d1992503144) [#2384](https://github.com/keystonejs/keystone/pull/2384) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded to latest `cfonts` version.

- [`d495f17b`](https://github.com/keystonejs/keystone/commit/d495f17b08706ee2bf297e4196248cbde25fd24f) [#2416](https://github.com/keystonejs/keystone/pull/2416) Thanks [@Vultraz](https://github.com/Vultraz)! - Upgraded Nuxt dependency to 2.11.0.

## 1.6.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

## 1.5.1

### Patch Changes

- [`1235f8de`](https://github.com/keystonejs/keystone/commit/1235f8de8539014884b49c87d69a60a1d9e462f1) [#2278](https://github.com/keystonejs/keystone/pull/2278) - Added documentation for the `keystone-create-app` CLI arguments.

## 1.5.0

### Minor Changes

- [`8edd7b3c`](https://github.com/keystonejs/keystone/commit/8edd7b3c172214ac1f11fbcc3d4af17f5e6836df) [#2273](https://github.com/keystonejs/keystone/pull/2273) - Added CLI arguments to support unattended Keystone app initializations

## 1.4.1

### Patch Changes

- [`cf1999f3`](https://github.com/keystonejs/keystone/commit/cf1999f3fcf7f75af2bd3e13aea9e097ad12a53d) [#2188](https://github.com/keystonejs/keystone/pull/2188) - Bump `cfonts` dependency to `^2.4.8`.

## 1.4.0

### Minor Changes

- [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290) [#2078](https://github.com/keystonejs/keystone/pull/2078) - Added a script that generates an initial user for the starter template.

## 1.3.2

### Patch Changes

- [`d9d15958`](https://github.com/keystonejs/keystone/commit/d9d15958f3f632e6c95fdc471b94d6fbc5f0f080) [#1881](https://github.com/keystonejs/keystone/pull/1881) Thanks [@timleslie](https://github.com/timleslie)! - Fixed typo.

* [`d132a3c6`](https://github.com/keystonejs/keystone/commit/d132a3c64aec707b98ed9a9ceffee44a98749b0a) [#1883](https://github.com/keystonejs/keystone/pull/1883) Thanks [@Vultraz](https://github.com/Vultraz)! - Added output which indicates where app is running when running the create keystone script.

## 1.3.1

### Patch Changes

- [`58a79e23`](https://github.com/keystonejs/keystone/commit/58a79e234003ae2971125226aafc4d5f180994b0) [#1826](https://github.com/keystonejs/keystone/pull/1826) Thanks [@Vultraz](https://github.com/Vultraz)! - Improve startup instructions

## 1.3.0

### Minor Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

## 1.2.1

### Patch Changes

- [25cfa799](https://github.com/keystonejs/keystone/commit/25cfa799): republish

## 1.2.0

### Minor Changes

- [399a2e41](https://github.com/keystonejs/keystone/commit/399a2e41): New Nuxt example site + CLI starter project

### Patch Changes

- [d253220f](https://github.com/keystonejs/keystone/commit/d253220f): Updates the arg package that resolves a possible bug with connection strings in the CLI

## 1.1.0

### Minor Changes

- [32b9faff](https://github.com/keystonejs/keystone/commit/32b9faff): Fix an error when yarn install failed and it wasn't falling back to npm correctly

## 1.0.1

### Patch Changes

- [a4d23240](https://github.com/keystonejs/keystone/commit/a4d23240): Fix a bug where the cli would not copy files

## 1.0.0

### Major Changes

- [ed3b5617](https://github.com/keystonejs/keystone/commit/ed3b5617): A new CLI with support for adapter and template choices.

## 0.6.2

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 0.6.1

### Patch Changes

- [b1cbde22](https://github.com/keystonejs/keystone/commit/b1cbde22):

  Fixed broken link

## 0.6.0

### Minor Changes

- [dfcabe6a](https://github.com/keystonejs/keystone/commit/dfcabe6a):

  Specify custom servers from within the index.js file

  - Major Changes:
    - The `index.js` export for `admin` must now be exported in the `servers`
      array:
      ```diff
       module.exports = {
         keystone,
      -  admin,
      +  apps: [admin],
       }
      ```
    - The `keystone.prepare()` method (often used within a _Custom Server_
      `server.js`) no longer returns a `server`, it now returns a `middlewares`
      array:
      ```diff
      +const express = require('express');
       const port = 3000;
       keystone.prepare({ port })
      -  .then(async ({ server, keystone: keystoneApp }) => {
      +  .then(async ({ middlewares, keystone: keystoneApp }) => {
           await keystoneApp.connect();
      -    await server.start();
      +    const app = express();
      +    app.use(middlewares);
      +    app.listen(port)
         });
      ```

### Patch Changes

- [168cc5ed](https://github.com/keystonejs/keystone/commit/168cc5ed):

  Add linebreak before title

- [8494e4cc](https://github.com/keystonejs/keystone/commit/8494e4cc):

  `@keystone-alpha/app-admin-ui` no longer accepts a `keystone` paramater in its constructor. It is now automatically passed during the `keystone.prepare()` call.

## 0.5.1

### Patch Changes

- [9b6fec3e](https://github.com/keystonejs/keystone/commit/9b6fec3e):

  Remove unnecessary dependency from packages

## 0.5.0

### Minor Changes

- [b22d6c16](https://github.com/keystonejs/keystone/commit/b22d6c16):

  Update template to account for the removal of custom server execution in the Keystone CLI

## 0.4.2

- [patch][e3337a7d](https://github.com/keystonejs/keystone/commit/e3337a7d):

  - Refactor internal code for future testability

- [patch][b69fb9b7](https://github.com/keystonejs/keystone/commit/b69fb9b7):

  - Update dev devependencies

- [patch][656e90c2](https://github.com/keystonejs/keystone/commit/656e90c2):

  - Explicitly call keystone.connect() before starting the web server.

- [patch][302930a4](https://github.com/keystonejs/keystone/commit/302930a4):

  - Minor internal code cleanups

## 0.4.1

- [patch][05ee3533](https://github.com/keystonejs/keystone/commit/05ee3533):

  - Updating the template to match the changes in the todo demo app

## 0.4.0

- [minor][5c038b72](https://github.com/keystonejs/keystone/commit/5c038b72):

  - Improve CLI output for `create-keystone-app`

- [patch][5ddb2ed6](https://github.com/keystonejs/keystone/commit/5ddb2ed6):

  - Always display clickable links when starting a server in dev mode

- [patch][341178c5](https://github.com/keystonejs/keystone/commit/341178c5):

  - Better create-keystone-app comments and docs

## 0.3.2

- [patch][](https://github.com/keystonejs/keystone/commit/):

  - Bump template dependencies

## 0.3.1

- [patch][08d3ddc9](https://github.com/keystonejs/keystone/commit/08d3ddc9):

  - Use server.express in TODO demo project

- [patch][ee769467](https://github.com/keystonejs/keystone/commit/ee769467):

  - Env vars for PORT config and documentation on demos/project templates

## 0.3.0

- [patch][1a6ca7ae](https://github.com/keystonejs/keystone/commit/1a6ca7ae):

  - Improve error handling and reporting in CLI app

- [patch][11c372fa](https://github.com/keystonejs/keystone/commit/11c372fa):

  - Update minor-level dependencies

- [minor][c5136b2d](https://github.com/keystonejs/keystone/commit/c5136b2d):

  - Added no-deps argument

- [patch][619b17c2](https://github.com/keystonejs/keystone/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

## 0.2.0

- [minor][fc22351d](https://github.com/keystonejs/keystone/commit/fc22351d):

  - Initial release for create-keystone-app. This will enable quick start based on todo demo project
