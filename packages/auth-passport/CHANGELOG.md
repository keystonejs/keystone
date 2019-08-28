# @keystone-alpha/auth-passport

## 3.1.0

### Minor Changes

- [b301fd0f](https://github.com/keystonejs/keystone-5/commit/b301fd0f): `auth-passport`'s `onAuthenticated` method now receives an `isNewItem` flag to indicate if the user is logging for the first time or not.

## 3.0.0

### Major Changes

- [b86f0e26](https://github.com/keystonejs/keystone-5/commit/b86f0e26): Renames the package `@keystone-alpha/passport-auth` to `@keystone-alpha/auth-passport`. Anyone using `passport-auth` should switch over to the new package - the old one will no longer be receiving updates.

## 2.1.1

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade prettier to 1.18.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9):
  - @keystone-alpha/fields@10.0.0

## 2.1.0

### Minor Changes

- [ab0b1f22](https://github.com/keystonejs/keystone-5/commit/ab0b1f22):

  Add `loginPathMiddleware` and `callbackPathMiddleware` functions for hooking into the Passport auth flow.

### Patch Changes

- [ab0b1f22](https://github.com/keystonejs/keystone-5/commit/ab0b1f22):

  Correctly stop processing social auth signin flow when an error occurs during account creation.

## 2.0.1

- Updated dependencies [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):
  - @keystone-alpha/fields@9.0.0

## 2.0.0

### Major Changes

- [04371d0d](https://github.com/keystonejs/keystone-5/commit/04371d0d):

  Complete rewrite of Social Auth package, see the `README.md` for instructions on
  how to use it.

* Updated dependencies [b6a9f6b9](https://github.com/keystonejs/keystone-5/commit/b6a9f6b9):
  - @keystone-alpha/fields@8.0.0

## 1.0.1

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):
  - @keystone-alpha/fields@7.0.0

## 1.0.0

### Major Changes

- [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):

  - Moved Social Login Strategies into its own package `@keystone-alpha/passport-auth`.
  - Created base strategy `PassportAuthStrategy`. This enables quick addition of new Social Login Strategy based on PassportJs.
  - Refactored Twitter and Facebook to extend base `PassportAuthStrategy`.
  - Added Google and GitHub Auth Strategy by extending base `PassportAuthStrategy`.
  - Removed `passport` and related dependencies from `@keystone-alpha/keystone`.
  - `test-projects/facebook-login` project is renamed into `test-projects/social-login`
  - `social-login` project now support for social login with Twitter, Facebook, Google and GitHub inbuilt strategies from `@keystone-alpha/passport-auth` along with an example of how to implement your own PassportJs strategy for WordPress in `WordPressAuthStrategy.js`

* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):
  - @keystone-alpha/fields@6.0.0
