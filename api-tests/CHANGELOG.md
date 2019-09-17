# @keystone-alpha/api-tests

## 1.5.3

- Updated dependencies [42a45bbd](https://github.com/keystonejs/keystone-5/commit/42a45bbd):
  - @keystone-alpha/adapter-knex@4.0.10
  - @keystone-alpha/adapter-mongoose@4.0.7
  - @keystone-alpha/test-utils@2.3.4
  - @keystone-alpha/keystone@15.1.0

## 1.5.2

### Patch Changes

- [9498c690](https://github.com/keystonejs/keystone-5/commit/9498c690): Fix meta queries with maxResults limits

- Updated dependencies [b61289b4](https://github.com/keystonejs/keystone-5/commit/b61289b4):
- Updated dependencies [0bba9f07](https://github.com/keystonejs/keystone-5/commit/0bba9f07):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d):
  - @keystone-alpha/adapter-knex@4.0.9
  - @keystone-alpha/adapter-mongoose@4.0.6
  - @keystone-alpha/test-utils@2.3.3
  - @keystone-alpha/keystone@15.0.0
  - @keystone-alpha/auth-password@1.0.2
  - @keystone-alpha/fields@12.0.0

## 1.5.1

- Updated dependencies [decf7319](https://github.com/keystonejs/keystone-5/commit/decf7319):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
- Updated dependencies [f8ad0975](https://github.com/keystonejs/keystone-5/commit/f8ad0975):
- Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d):
  - @keystone-alpha/adapter-knex@4.0.8
  - @keystone-alpha/adapter-mongoose@4.0.5
  - @keystone-alpha/test-utils@2.3.2
  - @keystone-alpha/keystone@14.0.0
  - @keystone-alpha/auth-password@1.0.1
  - @keystone-alpha/fields@11.0.0
  - @keystone-alpha/app-graphql@8.0.0

## 1.5.0

### Minor Changes

- [63350996](https://github.com/keystonejs/keystone-5/commit/63350996): Add queryLimits and maxResults to List API

## 1.4.0

### Minor Changes

- [8bb1bb0e](https://github.com/keystonejs/keystone-5/commit/8bb1bb0e): Add a `keystone.executeQuery()` method to run GraphQL queries and mutations directly against a Keystone instance. NOTE: These queries are executed without any Access Control checks by default.

- Updated dependencies [8d0d98c7](https://github.com/keystonejs/keystone-5/commit/8d0d98c7):
  - @keystone-alpha/test-utils@2.3.0
  - @keystone-alpha/adapter-knex@4.0.7
  - @keystone-alpha/adapter-mongoose@4.0.4
  - @keystone-alpha/app-graphql@7.0.0
  - @keystone-alpha/keystone@13.0.0

## 1.3.1

- Updated dependencies [33001656](https://github.com/keystonejs/keystone-5/commit/33001656):
  - @keystone-alpha/adapter-knex@4.0.5
  - @keystone-alpha/adapter-mongoose@4.0.3
  - @keystone-alpha/test-utils@2.2.4
  - @keystone-alpha/keystone@12.0.0

## 1.3.0

### Minor Changes

- [e42fdb4a](https://github.com/keystonejs/keystone-5/commit/e42fdb4a): Makes the password auth strategy its own package.
  Previously: `const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');`
  After change: `const { PasswordAuthStrategy } = require('@keystone-alpha/auth-password');`

## 1.2.1

- Updated dependencies [b86f0e26](https://github.com/keystonejs/keystone-5/commit/b86f0e26):
  - @keystone-alpha/adapter-knex@4.0.3
  - @keystone-alpha/adapter-mongoose@4.0.1
  - @keystone-alpha/test-utils@2.2.2
  - @keystone-alpha/keystone@10.5.0

## 1.2.0

### Minor Changes

- [e049cfcb](https://github.com/keystonejs/keystone-5/commit/e049cfcb): Support defaultValue as a function at mutation execution time
- [144e6e86](https://github.com/keystonejs/keystone-5/commit/144e6e86): - API Changes to Adapters: - Configs are now passed directly to the adapters rather than via `adapterConnectOptions`. - Default connections strings changed for both Knex and Mongoose adapters to be more inline with system defaults. - `keystone.connect()` no longer accepts a `to` paramter - the connection options must be passed to the adapter constructor (as above).

### Patch Changes

- [87155453](https://github.com/keystonejs/keystone-5/commit/87155453): Refactor Knex query builder to fix many-to-many filtering in complex queries, and reduce the number of database calls

## 1.1.0

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Ensure resolveInput for list receives result from fields

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade prettier to 1.18.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Reload all columns after insert (knex); fixes #1399
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9):
- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9):
  - @keystone-alpha/test-utils@2.1.0
  - @keystone-alpha/adapter-mongoose@3.0.0
  - @keystone-alpha/keystone@9.0.0
  - @keystone-alpha/fields@10.0.0

## 1.0.14

- Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone-5/commit/4007f5dd):
  - @keystone-alpha/adapter-mongoose@2.2.1
  - @keystone-alpha/test-utils@2.0.7
  - @keystone-alpha/keystone@8.0.0
  - @keystone-alpha/fields@9.1.0

## 1.0.13

- Updated dependencies [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):
  - @keystone-alpha/test-utils@2.0.6
  - @keystone-alpha/fields@9.0.0
  - @keystone-alpha/keystone@7.0.3

## 1.0.12

- Updated dependencies [b6a9f6b9](https://github.com/keystonejs/keystone-5/commit/b6a9f6b9):
  - @keystone-alpha/keystone@7.0.2
  - @keystone-alpha/fields@8.0.0

## 1.0.11

### Patch Changes

- [148400dc](https://github.com/keystonejs/keystone-5/commit/148400dc):

  Using `connect: []` and `create: []` in many-relationship queries now behaves as expected.

## 1.0.10

- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @keystone-alpha/adapter-mongoose@2.2.0
  - @keystone-alpha/test-utils@2.0.5
  - @keystone-alpha/keystone@7.0.0

## 1.0.9

### Patch Changes

- [3958a9c7](https://github.com/keystonejs/keystone-5/commit/3958a9c7):

  Fields configured with isRequired now behave as expected on create and update, returning a validation error if they are null.

- [ec9e6e2a](https://github.com/keystonejs/keystone-5/commit/ec9e6e2a):

  Fixed behaviour of isRequired within update operations.

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
  - @keystone-alpha/keystone@6.0.0
  - @keystone-alpha/fields@7.0.0
  - @keystone-alpha/adapter-mongoose@2.1.0
  - @keystone-alpha/test-utils@2.0.4
  - @keystone-alpha/app-graphql@6.1.0
  - @keystone-alpha/session@2.0.0

## 1.0.8

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
  - @keystone-alpha/test-utils@2.0.3
  - @keystone-alpha/app-graphql@6.0.0

## 1.0.7

- Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone-5/commit/9a0456ff):
  - @keystone-alpha/fields@6.1.1
  - @keystone-alpha/test-utils@2.0.2
  - @keystone-alpha/adapter-mongoose@2.0.0

## 1.0.6

### Patch Changes

- [e4daadc7](https://github.com/keystonejs/keystone-5/commit/e4daadc7):

  Re-enable field tests

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone-5/commit/24cd26ee):
* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone-5/commit/ae5cf6cc):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
* Updated dependencies [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):
* Updated dependencies [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
  - @keystone-alpha/adapter-mongoose@1.0.7
  - @keystone-alpha/test-utils@2.0.1
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/fields@6.0.0
  - @keystone-alpha/server@5.0.0

## 1.0.5

- [patch][85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):

  - Expose result of running relationship operations (create/connect/disconnect)

- [patch][4eb2dcd0](https://github.com/keystonejs/keystone-5/commit/4eb2dcd0):

  - Add more relationship query tests to exercise knex adapter bug

## 1.0.4

- [patch][b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):

  - Use named exports from @keystone-alpha/keystone package.

- [patch][302930a4](https://github.com/keystonejs/keystone-5/commit/302930a4):

  - Minor internal code cleanups

- [patch][21be780b](https://github.com/keystonejs/keystone-5/commit/21be780b):

  - Use updated test-utils APIs

- Updated dependencies [37dcee37](https://github.com/keystonejs/keystone-5/commit/37dcee37):
- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):
- Updated dependencies [21be780b](https://github.com/keystonejs/keystone-5/commit/21be780b):
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/fields@4.0.0
  - @keystone-alpha/adapter-mongoose@1.0.5
  - @keystone-alpha/test-utils@2.0.0
  - @keystone-alpha/server@4.0.0

## 1.0.3

- [patch][5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):

  - Use the new @keystone-alpha/session package

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone-5/commit/8d385ede):
- Updated dependencies [d718c016](https://github.com/keystonejs/keystone-5/commit/d718c016):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):
  - @keystone-alpha/adapter-mongoose@1.0.4
  - @keystone-alpha/test-utils@1.1.3
  - @keystone-alpha/keystone@2.0.0
  - @keystone-alpha/server@3.0.0
  - @keystone-alpha/session@1.0.0

## 1.0.2

- [patch][de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):

  - Use new authStrategy APIs

- Updated dependencies [9a9f214a](https://github.com/keystonejs/keystone-5/commit/9a9f214a):
- Updated dependencies [de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):
  - @keystone-alpha/keystone@1.0.3
  - @keystone-alpha/fields@3.0.0
  - @keystone-alpha/test-utils@1.1.2
  - @keystone-alpha/server@2.0.0

## 1.0.1

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

- Updated dependencies [dcb93771](https://github.com/keystonejs/keystone-5/commit/dcb93771):
  - @keystone-alpha/keystone@1.0.2
  - @keystone-alpha/fields@2.0.0

## 1.0.0

- [major][c0e64c01](https://github.com/keystonejs/keystone-5/commit/c0e64c01):

  - Create a new package to house all system tests
