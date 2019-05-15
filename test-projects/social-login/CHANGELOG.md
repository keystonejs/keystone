# @keystone-alpha/cypress-project-facebook-login

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
