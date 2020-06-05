# @keystonejs/logger

## 5.1.2

### Patch Changes

- [`839666e25`](https://github.com/keystonejs/keystone/commit/839666e25d8bffefd034e6344e11d72dd43b925b) [#2872](https://github.com/keystonejs/keystone/pull/2872) Thanks [@wcalebgray](https://github.com/wcalebgray)! - Added async capability for all Access Control resolvers. This changes the below methods to async functions, returning Promises:

  ```
  access-control
  - validateCustomAccessControl
  - validateListAccessControl
  - validateFieldAccessControl
  - validateAuthAccessControl

  keystone/List
  - checkFieldAccess
  - checkListAccess

  keystone/providers/custom
  - computeAccess

  keystone/providers/listAuth
  - checkAccess

  ```

  Changed `keystone/Keystone`'s `getGraphQlContext` return object (context) to include async resolvers for the following methods:

  ```
  - context.getCustomAccessControlForUser
  - context.getListAccessControlForUser
  - context.getFieldAccessControlForUser
  - context.getAuthAccessControlForUser
  ```

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

# @keystone-alpha/logger

## 2.0.1

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 2.0.0

- [major][baff3c89](https://github.com/keystonejs/keystone/commit/baff3c89):

  - Export { logger } as the API, rather than a default export

## 1.0.2

- [patch][11c372fa](https://github.com/keystonejs/keystone/commit/11c372fa):

  - Update minor-level dependencies

- [patch][3a775092](https://github.com/keystonejs/keystone/commit/3a775092):

  - Update dependencies

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/logger

## 0.2.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.1.3

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
