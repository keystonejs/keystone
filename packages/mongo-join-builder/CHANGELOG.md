# @keystonejs/mongo-join-builder

## 7.1.2

### Patch Changes

- [`af5171563`](https://github.com/keystonejs/keystone/commit/af51715637433bcdd2538835c98ac71a8eb86122) [#3283](https://github.com/keystonejs/keystone/pull/3283) Thanks [@timleslie](https://github.com/timleslie)! - Removed `BaseListAdapter.findFieldAdapterForQuerySegment()` and `MongoRelationshipInterface.supportsRelationshipQuery()`.

* [`7da9d67d7`](https://github.com/keystonejs/keystone/commit/7da9d67d7d481c44a81406c6b34540a3f0a8340d) [#3284](https://github.com/keystonejs/keystone/pull/3284) Thanks [@timleslie](https://github.com/timleslie)! - Removed `MongoRelationshipInterface.getRefListAdapter()` and `KnexRelationshipInterface.getRefListAdapter()`.

## 7.1.1

### Patch Changes

- [`283839cfb`](https://github.com/keystonejs/keystone/commit/283839cfb84f80818dd85699e011eee4775e550d) [#3265](https://github.com/keystonejs/keystone/pull/3265) Thanks [@timleslie](https://github.com/timleslie)! - Updated tests to consistently use `jest.setTimeout()`.

## 7.1.0

### Minor Changes

- [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533) [#2660](https://github.com/keystonejs/keystone/pull/2660) Thanks [@Vultraz](https://github.com/Vultraz)! - Added new `sortBy` query argument.

  Each list now has an additional `Sort<List>By` enum type that represents the valid sorting options for all orderable fields in the list. `sortBy` takes one or more of these enum types, allowing for multi-field/column sorting.

### Patch Changes

- [`e765ad20`](https://github.com/keystonejs/keystone/commit/e765ad20abae9838f64b72b7d43767ec87db336a) [#2866](https://github.com/keystonejs/keystone/pull/2866) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated mongodb and mongoose dependencies to latest version.

- Updated dependencies [[`e0e3e30a`](https://github.com/keystonejs/keystone/commit/e0e3e30a9051741de3f5a0c12ba00f2238d54800)]:
  - @keystonejs/utils@5.4.1

## 7.0.2

### Patch Changes

- [`f266a692`](https://github.com/keystonejs/keystone/commit/f266a6923a24c84936d66e00ec7de0ea0956445b) [#2854](https://github.com/keystonejs/keystone/pull/2854) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded dependencies.

* [`3d40bd7d`](https://github.com/keystonejs/keystone/commit/3d40bd7dd39f2b5589012356dd2b1698eda4f0b2) [#2850](https://github.com/keystonejs/keystone/pull/2850) Thanks [@Vultraz](https://github.com/Vultraz)! - Switched to mongodb-memory-server-core.

## 7.0.1

### Patch Changes

- [`3af6cc21`](https://github.com/keystonejs/keystone/commit/3af6cc214110c318fd674f2e47a5ab36bdfb215d) [#2807](https://github.com/keystonejs/keystone/pull/2807) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug when querying one-to-one relationships.

## 7.0.0

### Major Changes

- [`fd685241`](https://github.com/keystonejs/keystone/commit/fd68524135025e4d800b4a98932916736dd50e9d) [#2000](https://github.com/keystonejs/keystone/pull/2000) Thanks [@timleslie](https://github.com/timleslie)! - ## Release - Arcade

  This release introduces a **new and improved data schema** for Keystone.
  The new data schema simplifies the way your data is stored and will unlock the development of new functionality within Keystone.

  > **Important:** You will need to make changes to your database to take advantage of the new data schema. Please read the full [release notes](https://www.keystonejs.com/discussions/new-data-schema) for instructions on updating your database.

## 6.1.3

### Patch Changes

- [`83bdf743`](https://github.com/keystonejs/keystone/commit/83bdf743748e39d1ea73eff2c8e3576cc713c624) [#2538](https://github.com/keystonejs/keystone/pull/2538) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated mongo dependencies to latest version.

- Updated dependencies [[`51546e41`](https://github.com/keystonejs/keystone/commit/51546e4142fb8c66cfc413479c671a59618f885b)]:
  - @keystonejs/utils@5.3.0

## 6.1.2

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

- Updated dependencies [[`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20)]:
  - @keystonejs/utils@5.2.2

## 6.1.1

### Patch Changes

- [`1d98dae8`](https://github.com/keystonejs/keystone/commit/1d98dae898a5e7c5b580bfcc1745eec5dd323adb) [#2392](https://github.com/keystonejs/keystone/pull/2392) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `mongodb` dependency to 3.5.3 and `mongodb-memory-server` dependency to 6.2.4.

- Updated dependencies [[`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09)]:
  - @keystonejs/utils@5.2.1

## 6.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/utils@5.2.0

## 6.0.1

### Patch Changes

- [`797df461`](https://github.com/keystonejs/keystone/commit/797df46132c0e77c052994c05970ef1e06660848) [#2267](https://github.com/keystonejs/keystone/pull/2267) - Improved code internals. No functional changes.

* [`078dcfeb`](https://github.com/keystonejs/keystone/commit/078dcfebbd017fb257f0c7fadc1a7469adbedc9c) [#2261](https://github.com/keystonejs/keystone/pull/2261) - Query generator now uses `tmpVar` rather than a generated variable name in lookup queries.

## 6.0.0

### Major Changes

- [`a34f1f72`](https://github.com/keystonejs/keystone/commit/a34f1f72613d1b7c79309ffe04fae0a79baa7737) [#2251](https://github.com/keystonejs/keystone/pull/2251) - Removed the `mutationBuilder` function in favour of using `$project` operations in the main pipeline.

### Patch Changes

- [`7123e226`](https://github.com/keystonejs/keystone/commit/7123e226e13d3629b2ce7b6746c4292af9bf79e1) [#2247](https://github.com/keystonejs/keystone/pull/2247) - Simplified the generated queries for \_some, \_none and \_every queries.

## 5.0.3

### Patch Changes

- [`311f9e9a`](https://github.com/keystonejs/keystone/commit/311f9e9a97b4b0b9ffd3f10772ae7cc520e0cc3b) [#2210](https://github.com/keystonejs/keystone/pull/2210) - Refactored the package internals for better DX.

* [`03dc2af4`](https://github.com/keystonejs/keystone/commit/03dc2af44462c4715c0b2b3e6a1ebe69a7e2c174) [#2228](https://github.com/keystonejs/keystone/pull/2228) - Refactor the internal `relationshipTokenizer`, no functional changes.

- [`779b6ad1`](https://github.com/keystonejs/keystone/commit/779b6ad17806f0b9f6a7fa973cacdeec05096ae8) [#2227](https://github.com/keystonejs/keystone/pull/2227) - Refactored internals of the join query builder, no functional changes.

## 5.0.2

### Patch Changes

- [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29) [#2189](https://github.com/keystonejs/keystone/pull/2189) - Upgraded prettier to 1.19.1 and formatted code accordingly.

* [`3d7222cd`](https://github.com/keystonejs/keystone/commit/3d7222cd589ce8accbf3a9de141976c38e2c7e23) [#2167](https://github.com/keystonejs/keystone/pull/2167) - Fixed the unit tests on linux mint machines.

- [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104) [#2191](https://github.com/keystonejs/keystone/pull/2191) - Upgraded `mongoose` to `^5.8.4` and `mongodb` to `^3.4.1`.
- Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a), [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29)]:
  - @keystonejs/utils@5.1.3

## 5.0.1

### Patch Changes

- [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f) [#1837](https://github.com/keystonejs/keystone/pull/1837) Thanks [@timleslie](https://github.com/timleslie)! - Updated mongo-related dependencies

* [`e4a19e3f`](https://github.com/keystonejs/keystone/commit/e4a19e3f3e261ef476aee61d24dd2639eaf61881) [#1844](https://github.com/keystonejs/keystone/pull/1844) Thanks [@jesstelford](https://github.com/jesstelford)! - Adding a new Relationship field when using the Mongoose adapter will no longer cause an "\$in requires an array as a second argument, found: missing" error to be thrown.

* Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469)]:
  - @keystonejs/utils@5.1.0

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/utils@5.0.0

# @keystone-alpha/mongo-join-builder

## 4.0.0

### Major Changes

- [`6d7d0df0`](https://github.com/keystonejs/keystone/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9) [#1729](https://github.com/keystonejs/keystone/pull/1729) Thanks [@timleslie](https://github.com/timleslie)! - This change significantly changes how and when we populate `many`-relationships during queries and mutations.
  The behaviour of the GraphQL API has not changed, but queries should be more performant, particularly for items with many related items.
  The `existingItem` parameter in hooks will no longer have the `many`-relationship fields populated.
  `List.listQuery()` no longer populates `many` relationship fields.
  For most users there should not need to be any changes to code unless they are explicitly relying on a `many`-relationship field in a hook, in which case they will need to execute an explicit query to obtain the desired values.

## 3.0.1

### Patch Changes

- [9baf6d4d](https://github.com/keystonejs/keystone/commit/9baf6d4d): Fix import/require mixup

## 3.0.0

### Major Changes

- [da4013e4](https://github.com/keystonejs/keystone/commit/da4013e4): Remove the `mongoJoinBuilder()` function and expose the component functions `{ queryParser, pipelineBuilder, mutationBuilder }`.
- [157a439d](https://github.com/keystonejs/keystone/commit/157a439d): Update queryParser to access a `{ listAdapter }` rather than a `{ tokenizer }`. This means that `{ simpleTokenizer, relationshipTokenizer, getRelatedListAdapterFromQueryPathFactory}` do not need to be exported from `mongo-join-builder`.

### Minor Changes

- [82dfef03](https://github.com/keystonejs/keystone/commit/82dfef03): Temporarily add simpleTokenizer, relationshipTokenizer and getRelatedListAdapterFromQueryPathFactory to the package API.

### Patch Changes

- [d4fb1326](https://github.com/keystonejs/keystone/commit/d4fb1326): Refactor internals to simplify tokenizer interfaces.
- [de352135](https://github.com/keystonejs/keystone/commit/de352135): Internal refactor to remove `postQueryMutation`.
- [3f0a45da](https://github.com/keystonejs/keystone/commit/3f0a45da): Internal refactor to decompose joinBuilder()
- [b2c5277e](https://github.com/keystonejs/keystone/commit/b2c5277e): Use compose() function from utils package.

## 2.0.3

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade to mongoose 5.6.5

## 2.0.2

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 2.0.1

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone/commit/81dc0be5):

  - Update dependencies

* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone/commit/b7a2ea9c):
  - @keystone-alpha/utils@3.0.0

## 2.0.0

- [patch][b69fb9b7](https://github.com/keystonejs/keystone/commit/b69fb9b7):

  - Update dev devependencies

- [major][2f908f30](https://github.com/keystonejs/keystone/commit/2f908f30):

  - Export { mongoJoinBuilder } as the API, rather than a default export

## 1.0.3

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone/commit/98c02a46):
  - @keystone-alpha/utils@2.0.0

## 1.0.2

- [patch][11c372fa](https://github.com/keystonejs/keystone/commit/11c372fa):

  - Update minor-level dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

- [patch][7417ea3a](https://github.com/keystonejs/keystone/commit/7417ea3a):

  - Update patch-level dependencies

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

# @voussoir/mongo-join-builder

## 0.3.3

- [patch] b155d942:

  - Update mongo/mongoose dependencies

## 0.3.2

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [a3d5454d]:
  - @voussoir/utils@1.0.0

## 0.3.1

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

## 0.3.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.2.0

- [minor] Pipeline and mutation builders are decoupled from each other. [74af97e](74af97e)

## 0.1.3

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/utils@0.2.0

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
