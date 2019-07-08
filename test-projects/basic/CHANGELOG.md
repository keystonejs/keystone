# @keystone-alpha/cypress-project-basic

## 1.3.1

- Updated dependencies [b6a9f6b9](https://github.com/keystonejs/keystone-5/commit/b6a9f6b9):
  - @keystone-alpha/app-admin-ui@5.0.3
  - @keystone-alpha/keystone@7.0.2
  - @keystone-alpha/field-content@1.0.0
  - @keystone-alpha/fields@8.0.0

## 1.3.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Showcase the Unsplash Content Block in the Basic Test Project.

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Showcase usage of Unsplash Image field on Basic Test Project.

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Add oEmbed Content Block with adapter-specific renderers.

### Patch Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Remove the deleted `embed` block from the test project

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Ensure Post's label can be correctly rendered when associated user has no name.

* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @keystone-alpha/app-admin-ui@5.0.1
  - @keystone-alpha/fields@7.1.0
  - @arch-ui/fields@2.0.0
  - @keystone-alpha/adapter-mongoose@2.2.0
  - @keystone-alpha/keystone@7.0.0

## 1.2.0

### Minor Changes

- [5c28c142](https://github.com/keystonejs/keystone-5/commit/5c28c142):

  Add tests for `OEmbed` type rendering in Admin UI

### Patch Changes

- [2df1e920](https://github.com/keystonejs/keystone-5/commit/2df1e920):

  Restore process.env.MONGODB_URI to test project example

- [b69a2276](https://github.com/keystonejs/keystone-5/commit/b69a2276):

  Removed unnecessary port parameter from keystone.prepare calls

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
* Updated dependencies [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
* Updated dependencies [16befb6a](https://github.com/keystonejs/keystone-5/commit/16befb6a):
  - @keystone-alpha/app-admin-ui@5.0.0
  - @keystone-alpha/keystone@6.0.0
  - @keystone-alpha/fields@7.0.0
  - @keystone-alpha/adapter-mongoose@2.1.0
  - @arch-ui/fields@1.0.0
  - @keystone-alpha/app-graphql@6.1.0
  - @keystone-alpha/app-static@1.0.2
  - @keystone-alpha/file-adapters@1.1.1

## 1.1.0

### Minor Changes

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

### Patch Changes

- [8494e4cc](https://github.com/keystonejs/keystone-5/commit/8494e4cc):

  `@keystone-alpha/app-admin-ui` no longer accepts a `keystone` paramater in its constructor. It is now automatically passed during the `keystone.prepare()` call.

* Updated dependencies [666e15f5](https://github.com/keystonejs/keystone-5/commit/666e15f5):
* Updated dependencies [b2651279](https://github.com/keystonejs/keystone-5/commit/b2651279):
  - @keystone-alpha/keystone@5.0.0
  - @keystone-alpha/app-admin-ui@4.0.0
  - @keystone-alpha/app-graphql@6.0.0

## 1.0.9

### Patch Changes

- [9b6fec3e](https://github.com/keystonejs/keystone-5/commit/9b6fec3e):

  Remove unnecessary dependency from packages

* Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone-5/commit/9a0456ff):
  - @keystone-alpha/fields@6.1.1
  - @keystone-alpha/adapter-mongoose@2.0.0

## 1.0.8

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

- [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):

  Remove custom server execution from the CLI.

  The Keystone CLI does not execute custom servers anymore, instead of running `keystone` to start a Keystone instance that has a custom server, run the server file directly with `node`.

  ```diff
  - "start": "keystone",
  + "start": "node server.js"
  ```

- [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):

  - Update deps in test project

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone-5/commit/24cd26ee):
* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone-5/commit/ae5cf6cc):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
* Updated dependencies [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
  - @keystone-alpha/adapter-mongoose@1.0.7
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/admin-ui@3.2.0
  - @keystone-alpha/fields@6.0.0
  - @keystone-alpha/core@2.0.4
  - @keystone-alpha/server@5.0.0

## 1.0.7

- [patch][e75c105c](https://github.com/keystonejs/keystone-5/commit/e75c105c):

  - admin revamp

- Updated dependencies [85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):
  - @keystone-alpha/admin-ui@3.1.0
  - @keystone-alpha/keystone@3.1.0
  - @keystone-alpha/fields@5.0.0

## 1.0.6

- [patch][b69fb9b7](https://github.com/keystonejs/keystone-5/commit/b69fb9b7):

  - Update dev devependencies

- [patch][656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):

  - Explicitly call keystone.connect() before starting the web server.

- [patch][302930a4](https://github.com/keystonejs/keystone-5/commit/302930a4):

  - Minor internal code cleanups

- Updated dependencies [37dcee37](https://github.com/keystonejs/keystone-5/commit/37dcee37):
- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):
  - @keystone-alpha/admin-ui@3.0.6
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/fields@4.0.0
  - @keystone-alpha/adapter-mongoose@1.0.5
  - @keystone-alpha/core@2.0.3
  - @keystone-alpha/server@4.0.0

## 1.0.5

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone-5/commit/8d385ede):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):
  - @keystone-alpha/adapter-mongoose@1.0.4
  - @keystone-alpha/keystone@2.0.0
  - @keystone-alpha/core@2.0.2
  - @keystone-alpha/server@3.0.0

## 1.0.4

- [patch][5ddb2ed6](https://github.com/keystonejs/keystone-5/commit/5ddb2ed6):

  - Always display clickable links when starting a server in dev mode

## 1.0.3

- [patch][9a9f214a](https://github.com/keystonejs/keystone-5/commit/9a9f214a):

  - Build field type views before publishing to npm and stop running Babel on Keystone packages in node_modules in the Admin UI

- Updated dependencies [de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):
- Updated dependencies [4ed35dfd](https://github.com/keystonejs/keystone-5/commit/4ed35dfd):
  - @keystone-alpha/keystone@1.0.3
  - @keystone-alpha/admin-ui@3.0.0
  - @keystone-alpha/core@2.0.0
  - @keystone-alpha/server@2.0.0

## 1.0.2

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][3a775092](https://github.com/keystonejs/keystone-5/commit/3a775092):

  - Update dependencies

- [patch][d9a1be91](https://github.com/keystonejs/keystone-5/commit/d9a1be91):

  - Update dependencies

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

- Updated dependencies [dcb93771](https://github.com/keystonejs/keystone-5/commit/dcb93771):
  - @keystone-alpha/keystone@1.0.2
  - @keystone-alpha/admin-ui@2.0.0
  - @keystone-alpha/fields@2.0.0

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][c0e64c01](https://github.com/keystonejs/keystone-5/commit/c0e64c01):

  - Move system tests into api-tests package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/cypress-project-basic

## 2.0.0

- [patch] 70187044:

  - Move some dependencies into devDependencies

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] 1855d1ba:

  - Update dependencies with 'yarn audit' identified issues

- [patch] b155d942:

  - Update mongo/mongoose dependencies

- [major] 582464a8:

  - Migrate projects to new method of exporting and running keystone instances.

- Updated dependencies [23c3fee5]:
  - @voussoir/fields@3.1.0
  - @voussoir/admin-ui@1.0.1
  - @arch-ui/fields@0.0.2

## 1.5.0

- [minor] dc53492c:

  - Add support for the Knex adapter

- [patch] 9f2ee393:

  - Add adapter parameter to setupServer() and add multiAdapterRunners()

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [53e27d75]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [306f0b7e]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [5f8043b5]:
- Updated dependencies [48773907]:
- Updated dependencies [a3d5454d]:
- Updated dependencies [ced0edb3]:
- Updated dependencies [860c3b80]:
  - @voussoir/test-utils@1.0.0
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/admin-ui@1.0.0
  - @voussoir/core@2.0.0
  - @voussoir/fields@3.0.0
  - @voussoir/server@1.0.0
  - @voussoir/utils@1.0.0
  - @voussoir/adapter-knex@0.0.2

## 1.4.1

- [patch] e4cc314b:

  - Bump

- [patch] 6d8ce0fc:

  - Add createMany and updateMany mutations

## 1.4.0

- [patch] 8145619f:

  - update to selecting and managing items in the list view

- [minor] 01718870:

  - Field configuration now tasks isRequired and isUnique, rather than required and unique

- [patch] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [c83c9ed5]:
- Updated dependencies [c3ebd9e6]:
- Updated dependencies [ebae2d6f]:
- Updated dependencies [78fd9555]:
- Updated dependencies [8fc0abb3]:
  - @voussoir/adapter-mongoose@1.0.0
  - @voussoir/test-utils@0.1.3
  - @voussoir/admin-ui@0.7.0
  - @voussoir/core@1.0.0
  - @voussoir/fields@2.0.0
  - @voussoir/server@0.5.0
  - @voussoir/ui@0.6.0

## 1.3.0

- [patch] 7a24b92e:

  - sticky table headers in list view for supporting browsers

- [minor] 589dbc02:

  - navigation improvements and paper cut fixes

- Updated dependencies [45d4c379]:
- Updated dependencies [ae3b8fda]:
- Updated dependencies [9c383fe8]:
- Updated dependencies [b0d19c24]:
  - @voussoir/adapter-mongoose@0.5.0
  - @voussoir/test-utils@0.1.2
  - @voussoir/core@0.7.0
  - @voussoir/fields@1.4.0
  - @voussoir/server@0.4.0

## 1.2.1

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
- Updated dependencies [1d30a329"
  ]:
  - @voussoir/adapter-mongoose@0.4.1
  - @voussoir/test-utils@0.1.1
  - @voussoir/core@0.6.0
  - @voussoir/fields@1.3.0
  - @voussoir/admin-ui@0.5.0
  - @voussoir/ui@0.4.0

## 1.2.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.4.0
  - @voussoir/test-utils@0.1.0
  - @voussoir/core@0.5.0
  - @voussoir/fields@1.2.0

## 1.1.2

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
- Updated dependencies [5742e25d"
  ]:
  - @voussoir/adapter-mongoose@0.3.2
  - @voussoir/test-utils@0.0.2
  - @voussoir/core@0.4.0
  - @voussoir/fields@1.1.0
  - @voussoir/admin-ui@0.3.0

## 1.1.1

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [patch] Updated dependencies [445b699](445b699)
- [patch] Updated dependencies [9c75136](9c75136)
- [patch] Updated dependencies [750a83e](750a83e)
  - @voussoir/admin-ui@0.2.1
  - @voussoir/core@0.3.0
  - @voussoir/fields@1.0.0
  - @voussoir/adapter-mongoose@0.3.0
  - @voussoir/server@0.2.1
  - @voussoir/utils@0.2.0

## 1.1.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)
