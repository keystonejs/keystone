# @keystonejs/file-adapters

## 6.0.2

### Patch Changes

- [`04ec9981`](https://github.com/keystonejs/keystone/commit/04ec998166a8b3044570769a8c3f501d80527bf9) [#2843](https://github.com/keystonejs/keystone/pull/2843) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated cloudinary dependency to 1.21.0.

## 6.0.1

### Patch Changes

- [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063) [#2593](https://github.com/keystonejs/keystone/pull/2593) Thanks [@jossmac](https://github.com/jossmac)! - Applied a more consistent voice throughout documentation.

## 6.0.0

### Major Changes

- [`787eabb3`](https://github.com/keystonejs/keystone/commit/787eabb387cd28f1578a5dfb68db95203ab8c782) [#2291](https://github.com/keystonejs/keystone/pull/2291) Thanks [@LiamAttClarke](https://github.com/LiamAttClarke)! - Returned promise from file-adapter delete methods, made delete params consistent between adapters.

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

## 5.5.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

## 5.4.0

### Minor Changes

- [`8415f628`](https://github.com/keystonejs/keystone/commit/8415f6289933cff244a592e1379ab70dfef926fc) [#2250](https://github.com/keystonejs/keystone/pull/2250) - Added `getFilename` option to S3Adapter.

## 5.3.2

### Patch Changes

- [`9677dc17`](https://github.com/keystonejs/keystone/commit/9677dc177b7b747397732700cab42d98e89f03f5) [#2249](https://github.com/keystonejs/keystone/pull/2249) - Replaced s3.putObject with s3.upload

  Resolves https://github.com/keystonejs/keystone/issues/2165

## 5.3.1

### Patch Changes

- [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29) [#2189](https://github.com/keystonejs/keystone/pull/2189) - Upgraded prettier to 1.19.1 and formatted code accordingly.

## 5.3.0

### Minor Changes

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Added S3 file adapter

## 5.2.0

### Minor Changes

- [`3d2c2b2e`](https://github.com/keystonejs/keystone/commit/3d2c2b2e65943be0bd59e448d3237c3abe983b04) [#1953](https://github.com/keystonejs/keystone/pull/1953) Thanks [@Vultraz](https://github.com/Vultraz)! - Added `delete()` method to file adapters.

## 5.1.0

### Minor Changes

- [`ebbcad70`](https://github.com/keystonejs/keystone/commit/ebbcad7042596a9c83c32c8e08dad50f9fcb59fd) [#1833](https://github.com/keystonejs/keystone/pull/1833) Thanks [@Vultraz](https://github.com/Vultraz)! - Added getFilename LocalFileAdapter config parameter to allow configuration of saved filename and saved original filename in database.

## 5.0.1

### Patch Changes

- [`209b7078`](https://github.com/keystonejs/keystone/commit/209b7078c7fa4f4d87568c58cb6cb6ad8162fe46) [#1817](https://github.com/keystonejs/keystone/pull/1817) Thanks [@Vultraz](https://github.com/Vultraz)! - Doc updates and minor functionality improvements for file field/adapters

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/file-adapters

## 2.0.1

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 2.0.0

### Major Changes

- [d316166e](https://github.com/keystonejs/keystone/commit/d316166e): Change FileAdapter API from: `{ route, directory }` to `{ path, src }` to match other packages.

## 1.1.1

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 1.1.0

### Minor Changes

- [af3f31dd](https://github.com/keystonejs/keystone/commit/af3f31dd):

  Allow passing relative paths to fileAdapter

## 1.0.2

- [patch][302930a4](https://github.com/keystonejs/keystone/commit/302930a4):

  - Minor internal code cleanups

- [patch][a62b869d](https://github.com/keystonejs/keystone/commit/a62b869d):

  - Restructure internal code

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

# @voussoir/file-adapters

## 0.2.1

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

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
