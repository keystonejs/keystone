# @keystonejs/app-graphql

## 6.2.1

### Patch Changes

- Updated dependencies [[`b76241695`](https://github.com/keystonejs/keystone/commit/b7624169554b01dba2185ef43856a223d32f12be)]:
  - @keystonejs/utils@6.0.0
  - @keystonejs/app-graphql-playground@5.1.9

## 6.2.0

### Minor Changes

- [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95) [#4588](https://github.com/keystonejs/keystone/pull/4588) Thanks [@timleslie](https://github.com/timleslie)! - Updated graphql server to use the `graphql-upload` package directly to support uploads, rather than the built-in support provided by Apollo Server.

## 6.1.3

### Patch Changes

- [`304701d7c`](https://github.com/keystonejs/keystone/commit/304701d7c23e98c8dc40c0f3f5512a0370107c06) [#3585](https://github.com/keystonejs/keystone/pull/3585) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `graphql` to `^15.3.0`.

## 6.1.2

### Patch Changes

- [`cd15192cd`](https://github.com/keystonejs/keystone/commit/cd15192cdae5e476f64a257c196ca569a9440d5a) [#3510](https://github.com/keystonejs/keystone/pull/3510) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `graphql` to `^14.7.0`.

* [`16fba3b98`](https://github.com/keystonejs/keystone/commit/16fba3b98271410e570a370f610da7cd0686f294) [#3550](https://github.com/keystonejs/keystone/pull/3550) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused dependencies.

* Updated dependencies [[`16fba3b98`](https://github.com/keystonejs/keystone/commit/16fba3b98271410e570a370f610da7cd0686f294)]:
  - @keystonejs/app-graphql-playground@5.1.7

## 6.1.1

### Patch Changes

- [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc) [#3438](https://github.com/keystonejs/keystone/pull/3438) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Apollo GraphQL package dependencies.

- Updated dependencies [[`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6), [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e), [`db0797f7f`](https://github.com/keystonejs/keystone/commit/db0797f7f442c2c42cc941633930de527c722f48), [`e195810a1`](https://github.com/keystonejs/keystone/commit/e195810a1d63cba34f8962b95b84a4955bee246b), [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc), [`07e246d15`](https://github.com/keystonejs/keystone/commit/07e246d15586dede7fa9a04bcc13020c8c5c3a25)]:
  - @keystonejs/app-graphql-playground@5.1.6
  - @keystonejs/utils@5.4.3
  - @keystonejs/session@8.1.1

## 6.1.0

### Minor Changes

- [`5a3849806`](https://github.com/keystonejs/keystone/commit/5a3849806d00e62b722461d02f6e4639bc45c1eb) [#3262](https://github.com/keystonejs/keystone/pull/3262) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added a new private internal schema that will allow a better method of bypassing access control on the `executeGraphQL` function.

  The schema name `internal` is now a reserved name and if you have a schema with this name you will need to change it with this update.

  Note: You cannot change access control on the `internal` schema.

## 6.0.0

### Major Changes

- [`3ce644d5f`](https://github.com/keystonejs/keystone/commit/3ce644d5f2b6e674adb2f155c0e729536079347a) [#3174](https://github.com/keystonejs/keystone/pull/3174) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `keystone.getGraphQlContext()` with `keystone.createHTTPContext()`, to be used primarily by the Apollo server.
  If you need to create a context for executing server-side GraphQL operations please use `keystone.createContext()`.
  See [the docs](/docs/discussions/server-side-graphql.md) for more details on how to use `keystone.createContext()`.

### Patch Changes

- Updated dependencies [[`e710cd445`](https://github.com/keystonejs/keystone/commit/e710cd445bfb71317ca38622cc3795da61d13dff), [`136cb505c`](https://github.com/keystonejs/keystone/commit/136cb505ce11931de7fc470debe438e335588781), [`e63b9f25a`](https://github.com/keystonejs/keystone/commit/e63b9f25adb64cecf0f65c6f97fe30c95e483996)]:
  - @keystonejs/session@8.0.0
  - @keystonejs/app-graphql-playground@5.1.5

## 5.1.9

### Patch Changes

- [`9ab6961e0`](https://github.com/keystonejs/keystone/commit/9ab6961e0202277a980bd60a323a1c599f1dd085) [#3217](https://github.com/keystonejs/keystone/pull/3217) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated apollo-server-express dependency to 2.15.1.

- Updated dependencies [[`69d7f2e50`](https://github.com/keystonejs/keystone/commit/69d7f2e50ef2325c0d3b02b8bb5c310590796fed), [`2806a0bdf`](https://github.com/keystonejs/keystone/commit/2806a0bdfd65429e7c44ed070983f121d6934955)]:
  - @keystonejs/utils@5.4.2
  - @keystonejs/session@7.0.1

## 5.1.8

### Patch Changes

- [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb) [#2990](https://github.com/keystonejs/keystone/pull/2990) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated various Apollo dependencies to their latest versions.

- Updated dependencies [[`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb), [`839666e25`](https://github.com/keystonejs/keystone/commit/839666e25d8bffefd034e6344e11d72dd43b925b)]:
  - @keystonejs/app-graphql-playground@5.1.4
  - @keystonejs/logger@5.1.2

## 5.1.7

### Patch Changes

- Updated dependencies [[`e0e3e30a`](https://github.com/keystonejs/keystone/commit/e0e3e30a9051741de3f5a0c12ba00f2238d54800), [`0fbc5b98`](https://github.com/keystonejs/keystone/commit/0fbc5b989a9f96248d1bd7f2f589fe77cb1d8f7d), [`da1359df`](https://github.com/keystonejs/keystone/commit/da1359dfc1bff7e27505eff876efe3a0865bae2d)]:
  - @keystonejs/utils@5.4.1
  - @keystonejs/session@7.0.0
  - @keystonejs/app-graphql-playground@5.1.3

## 5.1.6

### Patch Changes

- [`f266a692`](https://github.com/keystonejs/keystone/commit/f266a6923a24c84936d66e00ec7de0ea0956445b) [#2854](https://github.com/keystonejs/keystone/pull/2854) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded dependencies.

## 5.1.5

### Patch Changes

- [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063) [#2593](https://github.com/keystonejs/keystone/pull/2593) Thanks [@jossmac](https://github.com/jossmac)! - Applied a more consistent voice throughout documentation.

- Updated dependencies [[`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063)]:
  - @keystonejs/session@6.0.1

## 5.1.4

### Patch Changes

- [`b6a555c2`](https://github.com/keystonejs/keystone/commit/b6a555c28296394908757f7404b72bc6b828b52a) [#2540](https://github.com/keystonejs/keystone/pull/2540) Thanks [@timleslie](https://github.com/timleslie)! - Removed the undocumented `restrictAudienceMiddleware` function.

- Updated dependencies [[`b6a555c2`](https://github.com/keystonejs/keystone/commit/b6a555c28296394908757f7404b72bc6b828b52a), [`61a70503`](https://github.com/keystonejs/keystone/commit/61a70503f6c184a8f0f5440466399f12e6d7fa41), [`663ae7b4`](https://github.com/keystonejs/keystone/commit/663ae7b453f450f077795fbbc6c9f138e6b27f52)]:
  - @keystonejs/session@6.0.0
  - @keystonejs/utils@5.4.0
  - @keystonejs/app-graphql-playground@5.1.2

## 5.1.3

### Patch Changes

- [`29ad8a17`](https://github.com/keystonejs/keystone/commit/29ad8a175cc4324fe722eefd22c09f7fb6c5be5e) [#2531](https://github.com/keystonejs/keystone/pull/2531) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed a minor typo.

- Updated dependencies [[`51546e41`](https://github.com/keystonejs/keystone/commit/51546e4142fb8c66cfc413479c671a59618f885b)]:
  - @keystonejs/utils@5.3.0

## 5.1.2

### Patch Changes

- [`10e88dc3`](https://github.com/keystonejs/keystone/commit/10e88dc3d81f5e021db0bfb31f7547852c602c14) [#2468](https://github.com/keystonejs/keystone/pull/2468) Thanks [@timleslie](https://github.com/timleslie)! - Removed `Keystone.getAdminSchema` in favour of a new `Keystone.getResolvers({ schemaName })` method, along with the pre-existing `Keystone.getTypeDefs({ schemaName })`.

* [`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded React to 16.13.0.

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

- Updated dependencies [[`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20)]:
  - @keystonejs/app-graphql-playground@5.1.1
  - @keystonejs/logger@5.1.1
  - @keystonejs/session@5.1.1
  - @keystonejs/utils@5.2.2

## 5.1.1

### Patch Changes

- [`362efbc2`](https://github.com/keystonejs/keystone/commit/362efbc2e054fa48aedb515c54b5a64757832be9) [#2437](https://github.com/keystonejs/keystone/pull/2437) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated apollo-server-express dependency to 2.10.1.

- Updated dependencies [[`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09)]:
  - @keystonejs/utils@5.2.1

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/app-graphql-playground@5.1.0
  - @keystonejs/logger@5.1.0
  - @keystonejs/session@5.1.0
  - @keystonejs/utils@5.2.0

## 5.0.4

### Patch Changes

- [`b8631cf7`](https://github.com/keystonejs/keystone/commit/b8631cf770db14b90f83300358213b7572ca01f2) [#2320](https://github.com/keystonejs/keystone/pull/2320) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `graphql` dependency from 14.4.2 to 14.6.0 and `graphql-type-json` depedency from 0.2.1 to 0.3.1.

* [`36a3e6a0`](https://github.com/keystonejs/keystone/commit/36a3e6a089b81a37276bbbe87dea7cf24dd5db9e) [#2323](https://github.com/keystonejs/keystone/pull/2323) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated Apollo-related dependencies:

  apollo-boost: 0.4.4 -> 0.4.7
  apollo-cache-inmemory: 1.5.1 -> 1.6.5
  apollo-client: 2.6.4 -> 2.6.8
  apollo-server-express: 2.9.1 -> 2.9.16
  apollo-upload-client: 10.0.0 -> 12.1.0
  apollo-utilities: 1.3.2 -> 1.3.3

* Updated dependencies [[`59fd3689`](https://github.com/keystonejs/keystone/commit/59fd3689af3bc73682e430feed21b77376e54092)]:
  - @keystonejs/app-graphql-playground@5.0.1

## 5.0.3

### Patch Changes

- [`ec81468c`](https://github.com/keystonejs/keystone/commit/ec81468cb3cd046426ca8101294e635486128ef5) [#2308](https://github.com/keystonejs/keystone/pull/2308) - Fixed bug preventing configuration of apollo graph engine from `GraphQLApp()`.

## 5.0.2

### Patch Changes

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Upgrade all Babel deps to the same version (7.7.4)
- Updated dependencies [[`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62)]:
  - @keystonejs/utils@5.1.1

## 5.0.1

### Patch Changes

- [`1f4dc33d`](https://github.com/keystonejs/keystone/commit/1f4dc33d8a5ac4e38427eb215a7a8bc3504ae153) [#2044](https://github.com/keystonejs/keystone/pull/2044) Thanks [@Vultraz](https://github.com/Vultraz)! - Disabled GraphiQL playground in production mode.

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/app-graphql-playground@5.0.0
  - @keystonejs/logger@5.0.0
  - @keystonejs/session@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/app-graphql

## 8.2.1

### Patch Changes

- [`7129c887`](https://github.com/keystonejs/keystone/commit/7129c8878a825d961f2772be497dcd5bd6b2b697) [#1757](https://github.com/keystonejs/keystone/pull/1757) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Removed warnings about deprecated packages

## 8.2.0

### Minor Changes

- [588c50cd](https://github.com/keystonejs/keystone/commit/588c50cd): Support protection against Billion Laughs DoS attacks

## 8.1.1

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 8.1.0

### Minor Changes

- [b9e2c45b](https://github.com/keystonejs/keystone/commit/b9e2c45b): Add support for query validation

## 8.0.0

### Major Changes

- [f8ad0975](https://github.com/keystonejs/keystone/commit/f8ad0975): The `cors` and `pinoOptions` parameters now live on `keystone.prepare()` rather than `new GraphQLApp()`

### Patch Changes

- [c99c7cd2](https://github.com/keystonejs/keystone/commit/c99c7cd2): First iteration of the GraphQLPlaygroundApp.
- [a8e9378d](https://github.com/keystonejs/keystone/commit/a8e9378d): `Keystone`, `List` and `Field` constructors now take `schemaNames` as config options. A number of methods also now take `schemaName` parameters.
  - `keystone.getTypeDefs()` -> `keystone.getTypeDefs({ schemaName })`
  - `keystone.getAdminSchema()` -> `keystone.getAdminSchema({ schemaName })`
  - `keystone.dumpSchema(file)` -> `keystone.dumpSchema(file, schemaName)`
  - `keystone.getAdminMeta()` -> `keystone.getAdminMeta({ schemaName })`
  - `list.getAdminMeta()` -> `list.getAdminMeta({ schemaName })`
  - `field.getAdminMeta()` -> `field.getAdminMeta({ schemaName })`

## 7.0.0

### Major Changes

- [8d0d98c7](https://github.com/keystonejs/keystone/commit/8d0d98c7): `cookieSecret` and `sessionStore` config options are now passed to the `Keystone` constructor instead of the individual auth or graphql packages.

### Patch Changes

- [b27f6eed](https://github.com/keystonejs/keystone/commit/b27f6eed): Upgrade apollo-server to 2.9.1

## 6.3.1

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade graphql to 14.4.2
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade express to 4.17.1

## 6.3.0

### Minor Changes

- [04371d0d](https://github.com/keystonejs/keystone/commit/04371d0d):

  Prepare middlewares for auth strategies immediately after setting up session middleware.

## 6.2.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):

  Expose the incoming Request object as `context.req` enabling things like logging IPs in custom hooks, etc.

## 6.1.0

### Minor Changes

- [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):

  - GraphQL Playground now correctly sends auth cookies by default.
  - The GraphQL `context` object now has `startAuthedSession` and
    `endAuthedSession` methods bound to the current request (from
    `@keystone-alpha/session`)

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):
  - @keystone-alpha/session@2.0.0

## 6.0.0

### Major Changes

- This packages has been renamed from `server`.

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

- [b2651279](https://github.com/keystonejs/keystone/commit/b2651279):

  Remove usage of `port` arg from `prepareMiddleware()` and stop doing inline console.logs

# @keystonejs/server

# @keystone-alpha/server

## 5.0.0

### Major Changes

- [b7a2ea9c](https://github.com/keystonejs/keystone/commit/b7a2ea9c):

  - Remove `.config` property from `WebServer`. No longer allow `admin ui` or `cookie secret` as config fields. User must use `adminUI` and `cookieSecret` respectively.

### Minor Changes

- [6f598e83](https://github.com/keystonejs/keystone/commit/6f598e83):

  - Add Admin UI static building

### Patch Changes

- [fdc5fe3a](https://github.com/keystonejs/keystone/commit/fdc5fe3a):

  - GraphiQL playground now only accepts GET requests (not POST)

* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone/commit/b7a2ea9c):
  - @keystone-alpha/utils@3.0.0

## 4.0.1

- [patch][ec76b500](https://github.com/keystonejs/keystone/commit/ec76b500):

  - Don't create graphiql shortlinks for multipart forms

## 4.0.0

- [patch][b69fb9b7](https://github.com/keystonejs/keystone/commit/b69fb9b7):

  - Update dev devependencies

- [patch][baff3c89](https://github.com/keystonejs/keystone/commit/baff3c89):

  - Use the updated logger API

- [patch][78266983](https://github.com/keystonejs/keystone/commit/78266983):

  - Restructure internal code

- [major][656e90c2](https://github.com/keystonejs/keystone/commit/656e90c2):

  - `WebServer.start()` no longer takes any arguments. Developer must now explicitly call `keystone.connect()` before calling `WebServer.start()`.

- [minor][21be780b](https://github.com/keystonejs/keystone/commit/21be780b):

  - Expose `createApolloServer` in the public API

- Updated dependencies [baff3c89](https://github.com/keystonejs/keystone/commit/baff3c89):
  - @keystone-alpha/logger@2.0.0

## 3.0.0

- [patch][022724ab](https://github.com/keystonejs/keystone/commit/022724ab):

  - Factor out a `createApolloServer` function.

- [patch][289123a6](https://github.com/keystonejs/keystone/commit/289123a6):

  - Decouple creation of ApolloServer from setting up of middleware

- [patch][52f1c47b](https://github.com/keystonejs/keystone/commit/52f1c47b):

  - Use the new Keystone.registerSchema interface.

- [major][5ebf4c3a](https://github.com/keystonejs/keystone/commit/5ebf4c3a):

  - Remove the .sessionManager property from the Keystone class

- [patch][5ebf4c3a](https://github.com/keystonejs/keystone/commit/5ebf4c3a):

  - Use the new @keystone-alpha/session package

- Updated dependencies [d718c016](https://github.com/keystonejs/keystone/commit/d718c016):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone/commit/5ebf4c3a):
  - @keystone-alpha/session@1.0.0

## 2.0.2

- [patch][5ddb2ed6](https://github.com/keystonejs/keystone/commit/5ddb2ed6):

  - Always display clickable links when starting a server in dev mode

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone/commit/98c02a46):
  - @keystone-alpha/utils@2.0.0

## 2.0.1

- [patch][0c754410](https://github.com/keystonejs/keystone/commit/0c754410):

  - Fix the graphql dev query links

## 2.0.0

- [patch][1f2ebc81](https://github.com/keystonejs/keystone/commit/1f2ebc81):

  - Internal refactoring

- [major][de616f7e](https://github.com/keystonejs/keystone/commit/de616f7e):

  - Update authStrategy APIs
    - Removes `authStrategy` from the `config` API of `Webserver`.
    - Removes `authStrategy` from the `serverConfig` of the core `keystone` system builder.
    - Removes the `setAuthStrategy` method from `AdminUI`.
    - Adds `authStrategy` to the `config` API of `AdminUI`.
    - `Webserver` checks `keystone.auth` to determine whether to set up auth session middlewares.

## 1.2.0

- [minor][74e0363](https://github.com/keystonejs/keystone/commit/74e0363):

  - Reinstate ability to pass args to keystone.connect

- [patch][7417ea3a](https://github.com/keystonejs/keystone/commit/7417ea3a):

  - Update patch-level dependencies

## 1.1.0

- [minor][91557b24](https://github.com/keystonejs/keystone/commit/91557b24):

  - Make links in terminal clicky where possible

- [patch][1f0bc236](https://github.com/keystonejs/keystone/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/server

## 1.1.0

- [minor] 6fedba68:

  - DX: Show incoming queries in console and GraphiQL

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] d0fbd66f:

  - Update apollo dependencies on both client and server

## 1.0.0

- [major] 723371a0:

  - Correctly surface nested errors from GraphQL

- [minor] ced0edb3:

  - Allow passing of Apollo Server config via webserver

- Updated dependencies [aca26f71]:
- Updated dependencies [a3d5454d]:
  - @voussoir/utils@1.0.0

## 0.5.1

- [patch] 4d198f04:

  - Update dependencies: apollo-server-express -> 2.3.1

- [patch] 8d8666ad:

  - Dependency upgrade: graphql -> 14.0.3, graphql-tools -> 4.0.3

## 0.5.0

- [minor] c83c9ed5:

  - Add Keystone.getAccessContext and remove List.getAccessControl, List.getFieldAccessControl, and Field.validateAccessControl.

- [patch] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

## 0.4.0

- [minor] ae3b8fda:

  - Makes CORS user configurable

## 0.3.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.2.1

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
