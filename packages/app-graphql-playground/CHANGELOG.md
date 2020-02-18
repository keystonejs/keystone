# @keystonejs/app-graphql-playground

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/logger@5.1.0
  - @keystonejs/session@5.1.0
  - @keystonejs/utils@5.2.0

## 5.0.1

### Patch Changes

- [`59fd3689`](https://github.com/keystonejs/keystone/commit/59fd3689af3bc73682e430feed21b77376e54092) [#2380](https://github.com/keystonejs/keystone/pull/2380) Thanks [@timleslie](https://github.com/timleslie)! - Updated `graphql-playground` to fix minor [UI error](https://github.com/apollographql/graphql-playground/pull/21).

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/logger@5.0.0
  - @keystonejs/session@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/app-graphql-playground

## 1.0.1

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 1.0.0

### Major Changes

- [c99c7cd2](https://github.com/keystonejs/keystone-5/commit/c99c7cd2): First iteration of the GraphQLPlaygroundApp.
