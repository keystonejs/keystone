# @keystonejs/app-graphql

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/app-graphql-playground@5.0.0
  - @keystonejs/logger@5.0.0
  - @keystonejs/session@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/app-graphql

## 8.2.1

### Patch Changes

- [`7129c887`](https://github.com/keystonejs/keystone-5/commit/7129c8878a825d961f2772be497dcd5bd6b2b697) [#1757](https://github.com/keystonejs/keystone-5/pull/1757) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Removed warnings about deprecated packages

## 8.2.0

### Minor Changes

- [588c50cd](https://github.com/keystonejs/keystone-5/commit/588c50cd): Support protection against Billion Laughs DoS attacks

## 8.1.1

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 8.1.0

### Minor Changes

- [b9e2c45b](https://github.com/keystonejs/keystone-5/commit/b9e2c45b): Add support for query validation

## 8.0.0

### Major Changes

- [f8ad0975](https://github.com/keystonejs/keystone-5/commit/f8ad0975): The `cors` and `pinoOptions` parameters now live on `keystone.prepare()` rather than `new GraphQLApp()`

### Patch Changes

- [c99c7cd2](https://github.com/keystonejs/keystone-5/commit/c99c7cd2): First iteration of the GraphQLPlaygroundApp.
- [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d): `Keystone`, `List` and `Field` constructors now take `schemaNames` as config options. A number of methods also now take `schemaName` parameters.
  - `keystone.getTypeDefs()` -> `keystone.getTypeDefs({ schemaName })`
  - `keystone.getAdminSchema()` -> `keystone.getAdminSchema({ schemaName })`
  - `keystone.dumpSchema(file)` -> `keystone.dumpSchema(file, schemaName)`
  - `keystone.getAdminMeta()` -> `keystone.getAdminMeta({ schemaName })`
  - `list.getAdminMeta()` -> `list.getAdminMeta({ schemaName })`
  - `field.getAdminMeta()` -> `field.getAdminMeta({ schemaName })`

## 7.0.0

### Major Changes

- [8d0d98c7](https://github.com/keystonejs/keystone-5/commit/8d0d98c7): `cookieSecret` and `sessionStore` config options are now passed to the `Keystone` constructor instead of the individual auth or graphql packages.

### Patch Changes

- [b27f6eed](https://github.com/keystonejs/keystone-5/commit/b27f6eed): Upgrade apollo-server to 2.9.1

## 6.3.1

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade graphql to 14.4.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

## 6.3.0

### Minor Changes

- [04371d0d](https://github.com/keystonejs/keystone-5/commit/04371d0d):

  Prepare middlewares for auth strategies immediately after setting up session middleware.

## 6.2.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Expose the incoming Request object as `context.req` enabling things like logging IPs in custom hooks, etc.

## 6.1.0

### Minor Changes

- [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):

  - GraphQL Playground now correctly sends auth cookies by default.
  - The GraphQL `context` object now has `startAuthedSession` and
    `endAuthedSession` methods bound to the current request (from
    `@keystone-alpha/session`)

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
  - @keystone-alpha/session@2.0.0

## 6.0.0

### Major Changes

- This packages has been renamed from `server`.

- [dfcabe6a](https://github.com/keystonejs/keystone-5/commit/dfcabe6a):

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

- [b2651279](https://github.com/keystonejs/keystone-5/commit/b2651279):

  Remove usage of `port` arg from `prepareMiddleware()` and stop doing inline console.logs

# @keystonejs/server

# @keystone-alpha/server

## 5.0.0

### Major Changes

- [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):

  - Remove `.config` property from `WebServer`. No longer allow `admin ui` or `cookie secret` as config fields. User must use `adminUI` and `cookieSecret` respectively.

### Minor Changes

- [6f598e83](https://github.com/keystonejs/keystone-5/commit/6f598e83):

  - Add Admin UI static building

### Patch Changes

- [fdc5fe3a](https://github.com/keystonejs/keystone-5/commit/fdc5fe3a):

  - GraphiQL playground now only accepts GET requests (not POST)

* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
  - @keystone-alpha/utils@3.0.0

## 4.0.1

- [patch][ec76b500](https://github.com/keystonejs/keystone-5/commit/ec76b500):

  - Don't create graphiql shortlinks for multipart forms

## 4.0.0

- [patch][b69fb9b7](https://github.com/keystonejs/keystone-5/commit/b69fb9b7):

  - Update dev devependencies

- [patch][baff3c89](https://github.com/keystonejs/keystone-5/commit/baff3c89):

  - Use the updated logger API

- [patch][78266983](https://github.com/keystonejs/keystone-5/commit/78266983):

  - Restructure internal code

- [major][656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):

  - `WebServer.start()` no longer takes any arguments. Developer must now explicitly call `keystone.connect()` before calling `WebServer.start()`.

- [minor][21be780b](https://github.com/keystonejs/keystone-5/commit/21be780b):

  - Expose `createApolloServer` in the public API

- Updated dependencies [baff3c89](https://github.com/keystonejs/keystone-5/commit/baff3c89):
  - @keystone-alpha/logger@2.0.0

## 3.0.0

- [patch][022724ab](https://github.com/keystonejs/keystone-5/commit/022724ab):

  - Factor out a `createApolloServer` function.

- [patch][289123a6](https://github.com/keystonejs/keystone-5/commit/289123a6):

  - Decouple creation of ApolloServer from setting up of middleware

- [patch][52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):

  - Use the new Keystone.registerSchema interface.

- [major][5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):

  - Remove the .sessionManager property from the Keystone class

- [patch][5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):

  - Use the new @keystone-alpha/session package

- Updated dependencies [d718c016](https://github.com/keystonejs/keystone-5/commit/d718c016):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
  - @keystone-alpha/session@1.0.0

## 2.0.2

- [patch][5ddb2ed6](https://github.com/keystonejs/keystone-5/commit/5ddb2ed6):

  - Always display clickable links when starting a server in dev mode

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone-5/commit/98c02a46):
  - @keystone-alpha/utils@2.0.0

## 2.0.1

- [patch][0c754410](https://github.com/keystonejs/keystone-5/commit/0c754410):

  - Fix the graphql dev query links

## 2.0.0

- [patch][1f2ebc81](https://github.com/keystonejs/keystone-5/commit/1f2ebc81):

  - Internal refactoring

- [major][de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):

  - Update authStrategy APIs
    - Removes `authStrategy` from the `config` API of `Webserver`.
    - Removes `authStrategy` from the `serverConfig` of the core `keystone` system builder.
    - Removes the `setAuthStrategy` method from `AdminUI`.
    - Adds `authStrategy` to the `config` API of `AdminUI`.
    - `Webserver` checks `keystone.auth` to determine whether to set up auth session middlewares.

## 1.2.0

- [minor][74e0363](https://github.com/keystonejs/keystone-5/commit/74e0363):

  - Reinstate ability to pass args to keystone.connect

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

## 1.1.0

- [minor][91557b24](https://github.com/keystonejs/keystone-5/commit/91557b24):

  - Make links in terminal clicky where possible

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone-5/commit/9534f98f):

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
