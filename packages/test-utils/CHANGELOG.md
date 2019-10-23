# @keystone/test-utils

## 5.0.0

### Major Changes

- [`c7ba40ec`](https://github.com/keystonejs/keystone-5/commit/c7ba40ec98116603c6b7a501d2442e16170ec6be) [#1813](https://github.com/keystonejs/keystone-5/pull/1813) Thanks [@jesstelford](https://github.com/jesstelford)! - - This is the first release of `@keystone/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystone` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystone/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`c7ba40ec`](https://github.com/keystonejs/keystone-5/commit/c7ba40ec98116603c6b7a501d2442e16170ec6be)]:
  - @keystone/adapter-knex@5.0.0
  - @keystone/adapter-mongoose@5.0.0
  - @keystone/app-graphql@5.0.0
  - @keystone/keystone@5.0.0

# @keystone-alpha/test-utils

## 2.6.3

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/adapter-knex@6.0.0
  - @keystone-alpha/adapter-mongoose@6.0.0
  - @keystone-alpha/keystone@16.0.0

## 2.6.2

- Updated dependencies [6c4df466](https://github.com/keystonejs/keystone-5/commit/6c4df466):
  - @keystone-alpha/adapter-knex@5.0.0

## 2.6.1

- Updated dependencies [b96a3a58](https://github.com/keystonejs/keystone-5/commit/b96a3a58):
  - @keystone-alpha/adapter-mongoose@5.0.0

## 2.6.0

### Minor Changes

- [552e6fb6](https://github.com/keystonejs/keystone-5/commit/552e6fb6): Add support for schema cache hints

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 2.5.0

### Minor Changes

- [66e1c33e](https://github.com/keystonejs/keystone-5/commit/66e1c33e): Add `schemaName` and `schemaNames` parameters to `setupServer()`.

## 2.4.1

### Patch Changes

- [d218cd55](https://github.com/keystonejs/keystone-5/commit/d218cd55): Make executeQuery() backwards compatible with old, single-schema KS

## 2.4.0

### Minor Changes

- [b9e2c45b](https://github.com/keystonejs/keystone-5/commit/b9e2c45b): Add support for query validation

## 2.3.4

- Updated dependencies [42a45bbd](https://github.com/keystonejs/keystone-5/commit/42a45bbd):
  - @keystone-alpha/adapter-knex@4.0.10
  - @keystone-alpha/adapter-mongoose@4.0.7
  - @keystone-alpha/keystone@15.1.0

## 2.3.3

- Updated dependencies [b61289b4](https://github.com/keystonejs/keystone-5/commit/b61289b4):
- Updated dependencies [0bba9f07](https://github.com/keystonejs/keystone-5/commit/0bba9f07):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d):
  - @keystone-alpha/adapter-knex@4.0.9
  - @keystone-alpha/adapter-mongoose@4.0.6
  - @keystone-alpha/keystone@15.0.0

## 2.3.2

### Patch Changes

- [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d): `Keystone`, `List` and `Field` constructors now take `schemaNames` as config options. A number of methods also now take `schemaName` parameters.
  - `keystone.getTypeDefs()` -> `keystone.getTypeDefs({ schemaName })`
  - `keystone.getAdminSchema()` -> `keystone.getAdminSchema({ schemaName })`
  - `keystone.dumpSchema(file)` -> `keystone.dumpSchema(file, schemaName)`
  - `keystone.getAdminMeta()` -> `keystone.getAdminMeta({ schemaName })`
  - `list.getAdminMeta()` -> `list.getAdminMeta({ schemaName })`
  - `field.getAdminMeta()` -> `field.getAdminMeta({ schemaName })`

* Updated dependencies [decf7319](https://github.com/keystonejs/keystone-5/commit/decf7319):
* Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
* Updated dependencies [f8ad0975](https://github.com/keystonejs/keystone-5/commit/f8ad0975):
  - @keystone-alpha/adapter-knex@4.0.8
  - @keystone-alpha/adapter-mongoose@4.0.5
  - @keystone-alpha/keystone@14.0.0
  - @keystone-alpha/app-graphql@8.0.0

## 2.3.1

### Patch Changes

- [d80de82b](https://github.com/keystonejs/keystone-5/commit/d80de82b): Clean up error messages when using the mongo test runner

## 2.3.0

### Minor Changes

- [8bb1bb0e](https://github.com/keystonejs/keystone-5/commit/8bb1bb0e): Add a `keystone.executeQuery()` method to run GraphQL queries and mutations directly against a Keystone instance. NOTE: These queries are executed without any Access Control checks by default.

- Updated dependencies [8d0d98c7](https://github.com/keystonejs/keystone-5/commit/8d0d98c7):
  - @keystone-alpha/adapter-knex@4.0.7
  - @keystone-alpha/adapter-mongoose@4.0.4
  - @keystone-alpha/app-graphql@7.0.0
  - @keystone-alpha/keystone@13.0.0

## 2.2.4

- Updated dependencies [33001656](https://github.com/keystonejs/keystone-5/commit/33001656):
  - @keystone-alpha/adapter-knex@4.0.5
  - @keystone-alpha/adapter-mongoose@4.0.3
  - @keystone-alpha/keystone@12.0.0

## 2.2.3

- Updated dependencies [e42fdb4a](https://github.com/keystonejs/keystone-5/commit/e42fdb4a):
  - @keystone-alpha/adapter-knex@4.0.4
  - @keystone-alpha/adapter-mongoose@4.0.2
  - @keystone-alpha/keystone@11.0.0

## 2.2.2

- Updated dependencies [b86f0e26](https://github.com/keystonejs/keystone-5/commit/b86f0e26):
  - @keystone-alpha/adapter-knex@4.0.3
  - @keystone-alpha/adapter-mongoose@4.0.1
  - @keystone-alpha/keystone@10.5.0

## 2.2.1

- Updated dependencies [144e6e86](https://github.com/keystonejs/keystone-5/commit/144e6e86):
  - @keystone-alpha/adapter-knex@4.0.0
  - @keystone-alpha/adapter-mongoose@4.0.0
  - @keystone-alpha/keystone@10.0.0

## 2.2.0

### Minor Changes

- [d7819a55](https://github.com/keystonejs/keystone-5/commit/d7819a55): Add a `delete` method to test runners so they can remove items as part of a unit test.

## 2.1.0

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade to mongoose 5.6.5
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade promise utility dependencies

- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9):
  - @keystone-alpha/adapter-knex@3.0.0
  - @keystone-alpha/adapter-mongoose@3.0.0
  - @keystone-alpha/keystone@9.0.0

## 2.0.7

- Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone-5/commit/4007f5dd):
  - @keystone-alpha/adapter-knex@2.1.0
  - @keystone-alpha/adapter-mongoose@2.2.1
  - @keystone-alpha/keystone@8.0.0

## 2.0.6

- Updated dependencies [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):
  - @keystone-alpha/adapter-knex@2.0.0
  - @keystone-alpha/keystone@7.0.3

## 2.0.5

### Patch Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Ensure knex database is correctly dropped for each test run.

* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @keystone-alpha/adapter-knex@1.1.0
  - @keystone-alpha/adapter-mongoose@2.2.0
  - @keystone-alpha/keystone@7.0.0

## 2.0.4

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
  - @keystone-alpha/adapter-mongoose@2.1.0
  - @keystone-alpha/adapter-knex@1.0.9
  - @keystone-alpha/keystone@6.0.0

## 2.0.3

### Patch Changes

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

* Updated dependencies [b2651279](https://github.com/keystonejs/keystone-5/commit/b2651279):
  - @keystone-alpha/keystone@5.0.0
  - @keystone-alpha/app-graphql@6.0.0

## 2.0.2

- Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone-5/commit/9a0456ff):
  - @keystone-alpha/adapter-mongoose@2.0.0

## 2.0.1

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone-5/commit/24cd26ee):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone-5/commit/ae5cf6cc):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
* Updated dependencies [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):
  - @keystone-alpha/adapter-knex@1.0.7
  - @keystone-alpha/adapter-mongoose@1.0.7
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/server@5.0.0

## 2.0.0

- [patch][7b8d254d](https://github.com/keystonejs/keystone-5/commit/7b8d254d):

  - Update external dependencies

- [patch][88e6224f](https://github.com/keystonejs/keystone-5/commit/88e6224f):

  - Restructure internal code

- [major][21be780b](https://github.com/keystonejs/keystone-5/commit/21be780b):

  - Remove `runQuery` from API.
  - `matchFilter` takes `keystone` as the first parameter, rather than `server`.
  - `graphqlRequest` takes a `keystone` parameter, and no longer takes `server`.

- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):
  - @keystone-alpha/adapter-knex@1.0.5
  - @keystone-alpha/adapter-mongoose@1.0.5
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/server@4.0.0

## 1.1.3

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone-5/commit/8d385ede):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):
  - @keystone-alpha/adapter-knex@1.0.4
  - @keystone-alpha/adapter-mongoose@1.0.4
  - @keystone-alpha/keystone@2.0.0
  - @keystone-alpha/server@3.0.0

## 1.1.2

- Updated dependencies [de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):
  - @keystone-alpha/keystone@1.0.3
  - @keystone-alpha/server@2.0.0

## 1.1.1

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone-5/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

## 1.1.0

- [minor][c0e64c01](https://github.com/keystonejs/keystone-5/commit/c0e64c01):

  - Add `matchFilter` and `runQuery` functions.

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone-5/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/test-utils

## 1.0.1

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] b155d942:

  - Update mongo/mongoose dependencies

## 1.0.0

- [minor] dc53492c:

  - Add support for the Knex adapter

- [major] 9f2ee393:

  - Add adapter parameter to setupServer() and add multiAdapterRunners()

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [53e27d75]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [48773907]:
- Updated dependencies [a3d5454d]:
- Updated dependencies [ced0edb3]:
- Updated dependencies [860c3b80]:
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/core@2.0.0
  - @voussoir/server@1.0.0
  - @voussoir/utils@1.0.0
  - @voussoir/adapter-knex@0.0.2

## 0.1.3

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [c83c9ed5]:
- Updated dependencies [c3ebd9e6]:
- Updated dependencies [ebae2d6f]:
- Updated dependencies [78fd9555]:
- Updated dependencies [01718870]:
- Updated dependencies [d22820b1]:
  - @voussoir/adapter-mongoose@1.0.0
  - @voussoir/core@1.0.0
  - @voussoir/server@0.5.0

## 0.1.2

- [patch] 9c383fe8:

  - Always use \$set and { new: true } in the mongoose adapter update() method

- Updated dependencies [45d4c379]:
- Updated dependencies [ae3b8fda]:
- Updated dependencies [b0d19c24]:
  - @voussoir/adapter-mongoose@0.5.0
  - @voussoir/core@0.7.0
  - @voussoir/server@0.4.0

## 0.1.1

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.4.1
  - @voussoir/core@0.6.0

## 0.1.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.4.0
  - @voussoir/core@0.5.0

## 0.0.2

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.3.2
  - @voussoir/core@0.4.0

## 0.0.1

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
