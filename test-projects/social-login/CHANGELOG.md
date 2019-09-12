# @keystone-alpha/cypress-project-facebook-login

## 2.2.3

- Updated dependencies [decf7319](https://github.com/keystonejs/keystone-5/commit/decf7319):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
- Updated dependencies [f8ad0975](https://github.com/keystonejs/keystone-5/commit/f8ad0975):
- Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d):
  - @keystone-alpha/adapter-mongoose@4.0.5
  - @keystone-alpha/keystone@14.0.0
  - @keystone-alpha/app-admin-ui@5.8.0
  - @keystone-alpha/auth-passport@4.1.1
  - @keystone-alpha/auth-password@1.0.1
  - @keystone-alpha/fields@11.0.0
  - @keystone-alpha/app-graphql@8.0.0

## 2.2.2

### Patch Changes

- [8d0d98c7](https://github.com/keystonejs/keystone-5/commit/8d0d98c7): `cookieSecret` and `sessionStore` config options are now passed to the `Keystone` constructor instead of the individual auth or graphql packages.

## 2.2.1

- Updated dependencies [33001656](https://github.com/keystonejs/keystone-5/commit/33001656):
  - @keystone-alpha/adapter-mongoose@4.0.3
  - @keystone-alpha/keystone@12.0.0

## 2.2.0

### Minor Changes

- [e42fdb4a](https://github.com/keystonejs/keystone-5/commit/e42fdb4a): Makes the password auth strategy its own package.
  Previously: `const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');`
  After change: `const { PasswordAuthStrategy } = require('@keystone-alpha/auth-password');`

## 2.1.0

### Minor Changes

- [b86f0e26](https://github.com/keystonejs/keystone-5/commit/b86f0e26): Renames the package `@keystone-alpha/passport-auth` to `@keystone-alpha/auth-passport`. Anyone using `passport-auth` should switch over to the new package - the old one will no longer be receiving updates.

## 2.0.4

- Updated dependencies [144e6e86](https://github.com/keystonejs/keystone-5/commit/144e6e86):
  - @keystone-alpha/fields@10.2.0
  - @keystone-alpha/adapter-mongoose@4.0.0
  - @keystone-alpha/keystone@10.0.0

## 2.0.3

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9):
- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9):
- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9):
  - @keystone-alpha/app-admin-ui@5.1.0
  - @arch-ui/fields@2.0.1
  - @arch-ui/input@0.0.9
  - @keystone-alpha/fields@10.0.0
  - @keystone-alpha/adapter-mongoose@3.0.0
  - @keystone-alpha/keystone@9.0.0
  - @keystone-alpha/passport-auth@2.1.1

## 2.0.2

### Patch Changes

- [ab0b1f22](https://github.com/keystonejs/keystone-5/commit/ab0b1f22):

  Add an example of using the loginPathMiddleware and callbackPathMiddleware functions when doing social auth signin.

* Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone-5/commit/4007f5dd):
  - @keystone-alpha/adapter-mongoose@2.2.1
  - @keystone-alpha/keystone@8.0.0
  - @keystone-alpha/fields@9.1.0

## 2.0.1

- Updated dependencies [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):
  - @keystone-alpha/app-admin-ui@5.0.4
  - @keystone-alpha/passport-auth@2.0.1
  - @keystone-alpha/fields@9.0.0
  - @keystone-alpha/keystone@7.0.3

## 2.0.0

### Major Changes

- [04371d0d](https://github.com/keystonejs/keystone-5/commit/04371d0d):

  Complete rewrite of Social Auth package, see the `README.md` for instructions on
  how to use it.

* Updated dependencies [b6a9f6b9](https://github.com/keystonejs/keystone-5/commit/b6a9f6b9):
  - @keystone-alpha/app-admin-ui@5.0.3
  - @keystone-alpha/keystone@7.0.2
  - @keystone-alpha/passport-auth@2.0.0
  - @keystone-alpha/fields@8.0.0

## 1.2.2

- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @keystone-alpha/app-admin-ui@5.0.1
  - @keystone-alpha/fields@7.1.0
  - @arch-ui/fields@2.0.0
  - @keystone-alpha/adapter-mongoose@2.2.0
  - @keystone-alpha/keystone@7.0.0
  - @arch-ui/input@0.0.8

## 1.2.1

### Patch Changes

- [b69a2276](https://github.com/keystonejs/keystone-5/commit/b69a2276):

  Removed unnecessary port parameter from keystone.prepare calls

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
* Updated dependencies [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
* Updated dependencies [16befb6a](https://github.com/keystonejs/keystone-5/commit/16befb6a):
  - @keystone-alpha/app-admin-ui@5.0.0
  - @keystone-alpha/keystone@6.0.0
  - @keystone-alpha/passport-auth@1.0.1
  - @keystone-alpha/fields@7.0.0
  - @keystone-alpha/adapter-mongoose@2.1.0
  - @arch-ui/fields@1.0.0
  - @keystone-alpha/app-graphql@6.1.0
  - @keystone-alpha/app-static@1.0.2
  - @arch-ui/input@0.0.7
  - @keystone-alpha/file-adapters@1.1.1
  - @keystone-alpha/session@2.0.0

## 1.2.0

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

## 1.1.1

### Patch Changes

- [9b6fec3e](https://github.com/keystonejs/keystone-5/commit/9b6fec3e):

  Remove unnecessary dependency from packages

* Updated dependencies [d580c298](https://github.com/keystonejs/keystone-5/commit/d580c298):
* Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone-5/commit/9a0456ff):
  - @arch-ui/input@0.0.6
  - @keystone-alpha/admin-ui@3.2.1
  - @keystone-alpha/fields@6.1.1
  - @keystone-alpha/adapter-mongoose@2.0.0

## 1.1.0

### Minor Changes

- [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):

  - Moved Social Login Strategies into its own package `@keystone-alpha/passport-auth`.
  - Created base strategy `PassportAuthStrategy`. This enables quick addition of new Social Login Strategy based on PassportJs.
  - Refactored Twitter and Facebook to extend base `PassportAuthStrategy`.
  - Added Google and GitHub Auth Strategy by extending base `PassportAuthStrategy`.
  - Removed `passport` and related dependencies from `@keystone-alpha/keystone`.
  - `test-projects/facebook-login` project is renamed into `test-projects/social-login`
  - `social-login` project now support for social login with Twitter, Facebook, Google and GitHub inbuilt strategies from `@keystone-alpha/passport-auth` along with an example of how to implement your own PassportJs strategy for WordPress in `WordPressAuthStrategy.js`

### Patch Changes

- [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):

  Remove custom server execution from the CLI.

  The Keystone CLI does not execute custom servers anymore, instead of running `keystone` to start a Keystone instance that has a custom server, run the server file directly with `node`.

  ```diff
  - "start": "keystone",
  + "start": "node server.js"
  ```

* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):
  - @keystone-alpha/admin-ui@3.2.0
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/passport-auth@1.0.0
  - @keystone-alpha/fields@6.0.0

## 1.0.2

- Updated dependencies [85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):
- Updated dependencies [e75c105c](https://github.com/keystonejs/keystone-5/commit/e75c105c):
  - @keystone-alpha/admin-ui@3.1.0
  - @keystone-alpha/keystone@3.1.0
  - @keystone-alpha/fields@5.0.0
  - @arch-ui/fields@0.0.4
  - @arch-ui/input@0.0.4

## 1.0.1

- [patch][656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):

  - Explicitly call keystone.connect() before starting the web server.

- Updated dependencies [37dcee37](https://github.com/keystonejs/keystone-5/commit/37dcee37):
- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
  - @keystone-alpha/admin-ui@3.0.6
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/fields@4.0.0
  - @keystone-alpha/adapter-mongoose@1.0.5
  - @keystone-alpha/core@2.0.3
  - @keystone-alpha/server@4.0.0
