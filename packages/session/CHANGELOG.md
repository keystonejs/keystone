# @keystonejs/session

## 8.2.0

### Minor Changes

- [`621db113a`](https://github.com/keystonejs/keystone/commit/621db113a6a579cc3da19ae9cef50dc63ac8ca55) [#4605](https://github.com/keystonejs/keystone/pull/4605) Thanks [@timleslie](https://github.com/timleslie)! - Converted package to TypeScript.

## 8.1.1

### Patch Changes

- [`db0797f7f`](https://github.com/keystonejs/keystone/commit/db0797f7f442c2c42cc941633930de527c722f48) [#3465](https://github.com/keystonejs/keystone/pull/3465) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused body-parser dependency.

* [`07e246d15`](https://github.com/keystonejs/keystone/commit/07e246d15586dede7fa9a04bcc13020c8c5c3a25) [#3472](https://github.com/keystonejs/keystone/pull/3472) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `cookie` to `^0.4.1`.

## 8.1.0

### Minor Changes

- [`f8d4b175b`](https://github.com/keystonejs/keystone/commit/f8d4b175bbc29962569acb24b34c29c44b61791f) [#3356](https://github.com/keystonejs/keystone/pull/3356) Thanks [@timleslie](https://github.com/timleslie)! - Updated `endAuthedSession` to return the `listKey` and `itemId` of the logged out user if there was one. The return object is now `{ success, listKey, itemId }`.

## 8.0.0

### Major Changes

- [`136cb505c`](https://github.com/keystonejs/keystone/commit/136cb505ce11931de7fc470debe438e335588781) [#3175](https://github.com/keystonejs/keystone/pull/3175) Thanks [@timleslie](https://github.com/timleslie)! - `SessionManager.getContext()` no longer returns values for `{ authedItem, authedListKey }` as these values are already provided by the core of Keystone.

### Patch Changes

- [`e710cd445`](https://github.com/keystonejs/keystone/commit/e710cd445bfb71317ca38622cc3795da61d13dff) [#3237](https://github.com/keystonejs/keystone/pull/3237) Thanks [@timleslie](https://github.com/timleslie)! - Updated middleware to directly access the data adapter to find the authorised item.

* [`e63b9f25a`](https://github.com/keystonejs/keystone/commit/e63b9f25adb64cecf0f65c6f97fe30c95e483996) [#3249](https://github.com/keystonejs/keystone/pull/3249) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `cookieSecret` doc link.

## 7.0.1

### Patch Changes

- [`2806a0bdf`](https://github.com/keystonejs/keystone/commit/2806a0bdfd65429e7c44ed070983f121d6934955) [#3182](https://github.com/keystonejs/keystone/pull/3182) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated express-session to 1.17.1.

## 7.0.0

### Major Changes

- [`0fbc5b98`](https://github.com/keystonejs/keystone/commit/0fbc5b989a9f96248d1bd7f2f589fe77cb1d8f7d) [#2882](https://github.com/keystonejs/keystone/pull/2882) Thanks [@Vultraz](https://github.com/Vultraz)! - The `cookieSecret` option no longer defaults to a static value. It is now required in production mode. In development mode, if undefined, a random new value is generated each time the server is started.

* [`da1359df`](https://github.com/keystonejs/keystone/commit/da1359dfc1bff7e27505eff876efe3a0865bae2d) [#2861](https://github.com/keystonejs/keystone/pull/2861) Thanks [@timleslie](https://github.com/timleslie)! - Moved the cookie configuration from individual options to an object which is passed directly to the express-session middleware.
  Previously you could only set `secure` and `maxAge` via `secureCookies` and `cookieMaxAge`.
  These options have been removed.
  You can now set a config option called `cookie` which can contain `secure` and `maxAge`, as well as `domain`, `expires`, `httpOnly`, `path` and `sameSite`.

  The `sameSite` option is now explicitly defaulted to `false`.

  See the [express-session middleware docs](https://github.com/expressjs/session#cookie) for more details on these options..

  #### Default

  ```javascript
  const keystone = new Keystone({
    cookie: {
      // domain: undefined,
      // expires: undefined,
      // httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: false,
      // path: '/',
      secure: process.env.NODE_ENV === 'production', // Defaults to true in production
    },
  });
  ```

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
