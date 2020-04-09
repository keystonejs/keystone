# @keystonejs/session

## 6.0.1

### Patch Changes

- [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063) [#2593](https://github.com/keystonejs/keystone/pull/2593) Thanks [@jossmac](https://github.com/jossmac)! - Applied a more consistent voice throughout documentation.

## 6.0.0

### Major Changes

- [`b6a555c2`](https://github.com/keystonejs/keystone/commit/b6a555c28296394908757f7404b72bc6b828b52a) [#2540](https://github.com/keystonejs/keystone/pull/2540) Thanks [@timleslie](https://github.com/timleslie)! - Removed the undocumented `restrictAudienceMiddleware` function.

* [`61a70503`](https://github.com/keystonejs/keystone/commit/61a70503f6c184a8f0f5440466399f12e6d7fa41) [#2529](https://github.com/keystonejs/keystone/pull/2529) Thanks [@timleslie](https://github.com/timleslie)! - `@keystonejs/session` now provides a `SessionManager` class which replaces the former function based API. The method `keystone.getCookieSecret()` has been removed.

## 5.1.1

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/session

## 3.0.3

### Patch Changes

- [`61d0f428`](https://github.com/keystonejs/keystone/commit/61d0f428097f8fe3c164d3d123ec5e4b5040a6fa) [#1773](https://github.com/keystonejs/keystone/pull/1773) Thanks [@timleslie](https://github.com/timleslie)! - Cleanly handle the situation where an authed session item is no longer in the system.

## 3.0.2

### Patch Changes

- [a6d384b1](https://github.com/keystonejs/keystone/commit/a6d384b1): Populate session item using `getAccessControlledItem()` rather than `findById()`.

## 3.0.1

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 3.0.0

### Major Changes

- [0a627ef9](https://github.com/keystonejs/keystone/commit/0a627ef9): Adds a `cookieMaxAge` and `secureCookies` option to the keystone constructor.

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

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade express to 4.17.1

## 2.0.0

### Major Changes

- [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):

  - Removed `createSessionMiddleware` export. Most functionality has been replaced by the new `authenticate<List>With<Strategy>` & `unauthenticate<List>` mutations (see `@keystone-alpha/keystone` `CHANGELOG.md` for more details), and remaining functionality that was specific to `@keystone-alpha/app-admin-ui` and has been moved there.
  - Auth tokens received by header `Authorization: Bearer <token>` must now
    include the signature (removing a potential attack vector where a client could
    guess with an unsigned token until it matched a logged in user). The `token`
    returned by `authenticate<List>With<Strategy>` includes this signature
    automatically for you.
  - `startAuthedSession` now requires a fourth paramter: `cookieSecret` for
    generating the signed `token`.

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 1.0.2

- [patch][bf364bf0](https://github.com/keystonejs/keystone/commit/bf364bf0):

  - Restructure internal code

## 1.0.1

- [patch][62e2d517](https://github.com/keystonejs/keystone/commit/62e2d517):

  - Fix bug in session audiences

## 1.0.0

- [minor][d718c016](https://github.com/keystonejs/keystone/commit/d718c016):

  - `startAuthedSession` now takes an `audiences` paramter, which is attached to the session. `createSessionMiddleware` takes an `audiences` parameter, which is passed through to `startAudthedSession` at `signin`. Added `restrictAudienceMiddleware`, which allows access to an endpoint to be restricted based on which audiences are currently attached to the session.

- [major][5ebf4c3a](https://github.com/keystonejs/keystone/commit/5ebf4c3a):

  - Create a new package for all session-handling functionality
