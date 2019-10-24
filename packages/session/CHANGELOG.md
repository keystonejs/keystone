# @keystonejs/session

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/session

## 3.0.3

### Patch Changes

- [`61d0f428`](https://github.com/keystonejs/keystone-5/commit/61d0f428097f8fe3c164d3d123ec5e4b5040a6fa) [#1773](https://github.com/keystonejs/keystone-5/pull/1773) Thanks [@timleslie](https://github.com/timleslie)! - Cleanly handle the situation where an authed session item is no longer in the system.

## 3.0.2

### Patch Changes

- [a6d384b1](https://github.com/keystonejs/keystone-5/commit/a6d384b1): Populate session item using `getAccessControlledItem()` rather than `findById()`.

## 3.0.1

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 3.0.0

### Major Changes

- [0a627ef9](https://github.com/keystonejs/keystone-5/commit/0a627ef9): Adds a `cookieMaxAge` and `secureCookies` option to the keystone constructor.

  These will default to 30 days for `cookieMaxAge` and `true` in production `false` in other environments for `secureCookies`.

  ### Usage

  ```javascript
  const keystone = new Keystone({
    cookieMaxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secureCookies: true,
  });
  ```

  Note: `commonSessionMiddleware` now accepts a config object rather than multiple arguments.

## 2.0.1

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

## 2.0.0

### Major Changes

- [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):

  - Removed `createSessionMiddleware` export. Most functionality has been replaced by the new `authenticate<List>With<Strategy>` & `unauthenticate<List>` mutations (see `@keystone-alpha/keystone` `CHANGELOG.md` for more details), and remaining functionality that was specific to `@keystone-alpha/app-admin-ui` and has been moved there.
  - Auth tokens received by header `Authorization: Bearer <token>` must now
    include the signature (removing a potential attack vector where a client could
    guess with an unsigned token until it matched a logged in user). The `token`
    returned by `authenticate<List>With<Strategy>` includes this signature
    automatically for you.
  - `startAuthedSession` now requires a fourth paramter: `cookieSecret` for
    generating the signed `token`.

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 1.0.2

- [patch][bf364bf0](https://github.com/keystonejs/keystone-5/commit/bf364bf0):

  - Restructure internal code

## 1.0.1

- [patch][62e2d517](https://github.com/keystonejs/keystone-5/commit/62e2d517):

  - Fix bug in session audiences

## 1.0.0

- [minor][d718c016](https://github.com/keystonejs/keystone-5/commit/d718c016):

  - `startAuthedSession` now takes an `audiences` paramter, which is attached to the session. `createSessionMiddleware` takes an `audiences` parameter, which is passed through to `startAudthedSession` at `signin`. Added `restrictAudienceMiddleware`, which allows access to an endpoint to be restricted based on which audiences are currently attached to the session.

- [major][5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):

  - Create a new package for all session-handling functionality
