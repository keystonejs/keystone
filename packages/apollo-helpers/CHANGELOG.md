# @keystonejs/apollo-helpers

## 5.1.1

### Patch Changes

- [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09) [#2381](https://github.com/keystonejs/keystone/pull/2381) Thanks [@timleslie](https://github.com/timleslie)! - Updated `@babel/*` dependency packages to latest versions.

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

## 5.0.7

### Patch Changes

- [`36a3e6a0`](https://github.com/keystonejs/keystone/commit/36a3e6a089b81a37276bbbe87dea7cf24dd5db9e) [#2323](https://github.com/keystonejs/keystone/pull/2323) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated Apollo-related dependencies:

  apollo-boost: 0.4.4 -> 0.4.7
  apollo-cache-inmemory: 1.5.1 -> 1.6.5
  apollo-client: 2.6.4 -> 2.6.8
  apollo-server-express: 2.9.1 -> 2.9.16
  apollo-upload-client: 10.0.0 -> 12.1.0
  apollo-utilities: 1.3.2 -> 1.3.3

## 5.0.6

### Patch Changes

- [`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a) [#2144](https://github.com/keystonejs/keystone/pull/2144) - Upgraded all @babel/\* dependencies.

* [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29) [#2189](https://github.com/keystonejs/keystone/pull/2189) - Upgraded prettier to 1.19.1 and formatted code accordingly.

## 5.0.5

### Patch Changes

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Upgrade all Babel deps to the same version (7.7.4)

## 5.0.4

### Patch Changes

- [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290) [#2078](https://github.com/keystonejs/keystone/pull/2078) - apollo-helpers package doesn't need to depend on the full react-apollo package

## 5.0.3

### Patch Changes

- [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866) [#1995](https://github.com/keystonejs/keystone/pull/1995) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `react` and `react-dom` to 16.12.0.

## 5.0.2

### Patch Changes

- [`ddbf1063`](https://github.com/keystonejs/keystone/commit/ddbf10630530c7c7c9e388c6b047b2cbac96dab9) [#1947](https://github.com/keystonejs/keystone/pull/1947) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded dependencies to include correct peer dependencies.

## 5.0.1

### Patch Changes

- [`5595e4c4`](https://github.com/keystonejs/keystone/commit/5595e4c45c618fa7e13a3d91e3ea3892b4f10475) [#1808](https://github.com/keystonejs/keystone/pull/1808) Thanks [@gautamsi](https://github.com/gautamsi)! - Upgraded `react-apollo` and replaced use of `react-apollo-hooks` with `react-apollo`. `react-apollo` has a similar hooks API to `react-apollo-hooks`.

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/apollo-helpers

## 1.0.5

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 1.0.4

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 1.0.3

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

## 1.0.2

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][d9a1be91](https://github.com/keystonejs/keystone-5/commit/d9a1be91):

  - Update dependencies

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone-5/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/apollo-helpers

## 0.3.3

- [patch] 23c3fee5:

  - Update babel packages and plugins

## 0.3.2

- [patch] 9ed3bf87:

  - Support client side resolution of KS Meta query

## 0.3.1

- [patch] 8fc0abb3:

  - Make DayPicker scrollable

## 0.3.0

- [minor] 7f64792:

  Add @voussoir/apollo-helpers package for cache busting goodness

## 0.2.0

- [minor] 7f64792:

  Add @voussoir/apollo-helpers package for cache busting goodness

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.1.0

- [minor] 7f64792:

  Add @voussoir/apollo-helpers package for cache busting goodness
