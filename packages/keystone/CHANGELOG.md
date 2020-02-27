# @keystonejs/keystone

## 5.6.0

### Minor Changes

- [`3abc5883`](https://github.com/keystonejs/keystone/commit/3abc58831e0f9b5871569a3fa6b21be7dc269cf3) [#2430](https://github.com/keystonejs/keystone/pull/2430) Thanks [@timleslie](https://github.com/timleslie)! - Added support for the new GraphQL Provider Framework (#2418).

### Patch Changes

- [`7ce804a8`](https://github.com/keystonejs/keystone/commit/7ce804a877300709375e5bc14206080ab15aec54) [#2401](https://github.com/keystonejs/keystone/pull/2401) Thanks [@acoreyj](https://github.com/acoreyj)! - Made sure `createRelationships` function in `relationship-utils.js` uses the correct relatedListKey by splitting out possible field name;

  This fixes an issue where createItems throws an Error when using Lists Back References.
  Fixes #2360

* [`8bdbb114`](https://github.com/keystonejs/keystone/commit/8bdbb114f6b2864693ae6e534df6fe8ee8345a60) [#2433](https://github.com/keystonejs/keystone/pull/2433) Thanks [@timleslie](https://github.com/timleslie)! - Added a VersionProvider to generate the `appVersion` graphQL query.

* Updated dependencies [[`d8a7b8a2`](https://github.com/keystonejs/keystone/commit/d8a7b8a23b4c3e1545d101a92323be165ad362e2), [`9a388f01`](https://github.com/keystonejs/keystone/commit/9a388f01e388272d56f81af2247d8030e0f2c972), [`bd4096ee`](https://github.com/keystonejs/keystone/commit/bd4096ee86f7790c76db23090b38f880e5aa7ecc), [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09), [`c059b63c`](https://github.com/keystonejs/keystone/commit/c059b63c6ebdbb60ac4095d1efd791d598b2756c)]:
  - @keystonejs/fields@6.3.1
  - @keystonejs/utils@5.2.1

## 5.5.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/access-control@5.1.0
  - @keystonejs/fields@6.3.0
  - @keystonejs/logger@5.1.0
  - @keystonejs/session@5.1.0
  - @keystonejs/utils@5.2.0

## 5.4.4

### Patch Changes

- [`b8631cf7`](https://github.com/keystonejs/keystone/commit/b8631cf770db14b90f83300358213b7572ca01f2) [#2320](https://github.com/keystonejs/keystone/pull/2320) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `graphql` dependency from 14.4.2 to 14.6.0 and `graphql-type-json` depedency from 0.2.1 to 0.3.1.

* [`ae4cf2d1`](https://github.com/keystonejs/keystone/commit/ae4cf2d108768d7ccbd23a409e7170fc92c81316) [#2345](https://github.com/keystonejs/keystone/pull/2345) Thanks [@molomby](https://github.com/molomby)! - Removing unnecessary calls to field type postRead hooks on delete operations. The internal \_delete() functions provide by the DB adapter now return a count of the records removed.

* Updated dependencies [[`b8631cf7`](https://github.com/keystonejs/keystone/commit/b8631cf770db14b90f83300358213b7572ca01f2)]:
  - @keystonejs/fields@6.2.3

## 5.4.3

### Patch Changes

- [`eb36cf37`](https://github.com/keystonejs/keystone/commit/eb36cf3731984cc7cf60b60cb1c043962252610f) [#2255](https://github.com/keystonejs/keystone/pull/2255) - Removed unused dependencies.

* [`8f54a4eb`](https://github.com/keystonejs/keystone/commit/8f54a4eb2d63ed042d736fd20ab622f326e111b8) [#2269](https://github.com/keystonejs/keystone/pull/2269) - Added a check for invalid relationship configurations.
* Updated dependencies [[`6bc87d43`](https://github.com/keystonejs/keystone/commit/6bc87d43de4861068de257735c1a6cf886cd3c17), [`6eb23086`](https://github.com/keystonejs/keystone/commit/6eb23086485d9bcbb93e35ec716d846790d611f2), [`8f54a4eb`](https://github.com/keystonejs/keystone/commit/8f54a4eb2d63ed042d736fd20ab622f326e111b8)]:
  - @keystonejs/fields@6.2.0

## 5.4.2

### Patch Changes

- [`cc58f0e0`](https://github.com/keystonejs/keystone/commit/cc58f0e05d1de06432e149f0767122ae51d1c31a) [#2202](https://github.com/keystonejs/keystone/pull/2202) - Apps which don't define `build()` no longer cause keystone to fail.
- Updated dependencies [[`220d3a4b`](https://github.com/keystonejs/keystone/commit/220d3a4bc4265dc56653bed4b292f3e4d708502b), [`11586035`](https://github.com/keystonejs/keystone/commit/115860350aa901749d240cb275cada29b8d541f8)]:
  - @keystonejs/fields@6.1.0

## 5.4.1

### Patch Changes

- [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29) [#2189](https://github.com/keystonejs/keystone/pull/2189) - Upgraded prettier to 1.19.1 and formatted code accordingly.

* [`05d07adf`](https://github.com/keystonejs/keystone/commit/05d07adf84059ff565cd2394f68d71d92e657485) [#2169](https://github.com/keystonejs/keystone/pull/2169) - Ensured that `executeQuery()` does not throw when a queried field has cache hint setttings.

- [`78193f9c`](https://github.com/keystonejs/keystone/commit/78193f9c9d93655fb0d4b8dc494fbe4c622a4d64) [#2152](https://github.com/keystonejs/keystone/pull/2152) - Fixed `configureExpress()`.
- Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a), [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29), [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104)]:
  - @keystonejs/build-field-types@5.1.4
  - @keystonejs/fields@6.0.5
  - @keystonejs/utils@5.1.3

## 5.4.0

### Minor Changes

- [`ae078619`](https://github.com/keystonejs/keystone/commit/ae0786197713db779791bf4da5d92a144d46fe6f) [#2119](https://github.com/keystonejs/keystone/pull/2119) - Allow configuring cors & pinoOptions for default server by adding them to the export in index.js

### Patch Changes

- [`ae078619`](https://github.com/keystonejs/keystone/commit/ae0786197713db779791bf4da5d92a144d46fe6f) [#2119](https://github.com/keystonejs/keystone/pull/2119) - Document cors & pinoOptions params for keystone.prepare()
- Updated dependencies [[`3d2c4b3f`](https://github.com/keystonejs/keystone/commit/3d2c4b3fb8f05e79fc1a4a8e39077058466795a2)]:
  - @keystonejs/utils@5.1.2
  - @keystonejs/fields@6.0.3

## 5.3.0

### Minor Changes

- [`77056ebd`](https://github.com/keystonejs/keystone/commit/77056ebdb31e58d27372925e8e24311a8c7d9e33) [#2008](https://github.com/keystonejs/keystone/pull/2008) Thanks [@molomby](https://github.com/molomby)! - Adding 'operation' argument to all hooks

* [`733ac847`](https://github.com/keystonejs/keystone/commit/733ac847cab488dc92a30e7b458191d750fd5a3d) [#1983](https://github.com/keystonejs/keystone/pull/1983) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Fixed a bug with schema generation and display in the AdminUI when a list contains only fields where access control is false.

- [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64) [#1978](https://github.com/keystonejs/keystone/pull/1978) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added a new field type `Virtual`. This allows creation of fields that return data computed from other field values or outside Keystone.

### Patch Changes

- [`e68fc43b`](https://github.com/keystonejs/keystone/commit/e68fc43ba006f9c958f9c81ae20b230d05c2cab6) [#1990](https://github.com/keystonejs/keystone/pull/1990) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug where the returned value of a `deleteItem()` mutation was not always correctly populated.

* [`d4d89836`](https://github.com/keystonejs/keystone/commit/d4d89836700413c1da2b76e9b82b649c2cac859d) [#2067](https://github.com/keystonejs/keystone/pull/2067) - Fixed handling of cache headers with mutations.

- [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f) [#2006](https://github.com/keystonejs/keystone/pull/2006) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated implementation of all `listAdapter.find\*()` methods to use the `itemsQuery()` API for internal consistency.

* [`1f4dc33d`](https://github.com/keystonejs/keystone/commit/1f4dc33d8a5ac4e38427eb215a7a8bc3504ae153) [#2044](https://github.com/keystonejs/keystone/pull/2044) Thanks [@Vultraz](https://github.com/Vultraz)! - Disabled GraphiQL playground in production mode.

- [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071) [#2047](https://github.com/keystonejs/keystone/pull/2047) Thanks [@Vultraz](https://github.com/Vultraz)! - Cleaned up duplicate code in aux list creation.
- Updated dependencies [[`267dab2f`](https://github.com/keystonejs/keystone/commit/267dab2fee5bbea711c417c13366862e8e0ab3be), [`8188d76c`](https://github.com/keystonejs/keystone/commit/8188d76cb3f5d3e112ef95fd4e1887db9a520d9d), [`af1e9e4d`](https://github.com/keystonejs/keystone/commit/af1e9e4d3b74753b903b20641b51df99184793df), [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866), [`1f4dc33d`](https://github.com/keystonejs/keystone/commit/1f4dc33d8a5ac4e38427eb215a7a8bc3504ae153), [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071), [`0145f7e2`](https://github.com/keystonejs/keystone/commit/0145f7e21d9297e3037c709587eb3b4220ba3f01), [`95372949`](https://github.com/keystonejs/keystone/commit/953729498fd0c7f68c82f6d4e438808777887d36), [`2cc83b12`](https://github.com/keystonejs/keystone/commit/2cc83b12be757019ba25658139478e8f5b2b19c6), [`a1dcbd7b`](https://github.com/keystonejs/keystone/commit/a1dcbd7bd7448fdcacbfe9fb0196bfee3c4a5326), [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64)]:
  - @keystonejs/fields@6.0.0
  - @keystonejs/build-field-types@5.1.2
  - @keystonejs/app-graphql@5.0.1

## 5.2.1

### Patch Changes

- [`697082cc`](https://github.com/keystonejs/keystone/commit/697082cc9e21ea9792e005a858432a6d81b1eb3a) [#1946](https://github.com/keystonejs/keystone/pull/1946) Thanks [@timleslie](https://github.com/timleslie)! - Updated the documentation to clarify the difference between `appVersion.addVersionToHttpHeaders` and `appVersion.access`.
- Updated dependencies [[`1a723a54`](https://github.com/keystonejs/keystone/commit/1a723a544a918457a9de241a8387f2ce5b555e50), [`ddfc7845`](https://github.com/keystonejs/keystone/commit/ddfc7845399e5108f7fd68169153983122554e96), [`946eb315`](https://github.com/keystonejs/keystone/commit/946eb3157a1cc4946fe9e2c2b1101edf4918ab86), [`ddbf1063`](https://github.com/keystonejs/keystone/commit/ddbf10630530c7c7c9e388c6b047b2cbac96dab9)]:
  - @keystonejs/fields@5.2.0
  - @keystonejs/build-field-types@5.1.1

## 5.2.0

### Minor Changes

- [`9ffa8a73`](https://github.com/keystonejs/keystone/commit/9ffa8a734c91dd6de2a31898629e1ba7feaee832) [#1931](https://github.com/keystonejs/keystone/pull/1931) Thanks [@timleslie](https://github.com/timleslie)! - Added an `appVersion` parameter to the `Keystone()` constructor. This version will be set as the `X-Keystone-App-Version` HTTP header on all requests. It can be queried via the GraphQL API as `{ appVersion }`. See the docs for more configuration details.

### Patch Changes

- Updated dependencies [[`a1e26deb`](https://github.com/keystonejs/keystone/commit/a1e26deb45d8c53e5d18b06c6573f66c4375b68c)]:
  - @keystonejs/build-field-types@5.1.0

## 5.1.1

### Patch Changes

- [`45fd7ab8`](https://github.com/keystonejs/keystone/commit/45fd7ab899655364d0071c0d276d188378944ff5) [#1894](https://github.com/keystonejs/keystone/pull/1894) Thanks [@Vultraz](https://github.com/Vultraz)! - Removed duplicate password auth implementation as it's in its own package now.

* [`b0756c65`](https://github.com/keystonejs/keystone/commit/b0756c65525625919c72364d8cefc32d864c7c0e) [#1873](https://github.com/keystonejs/keystone/pull/1873) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug (#1864) where `this.cacheHint` was used before being set.

- [`d132a3c6`](https://github.com/keystonejs/keystone/commit/d132a3c64aec707b98ed9a9ceffee44a98749b0a) [#1883](https://github.com/keystonejs/keystone/pull/1883) Thanks [@Vultraz](https://github.com/Vultraz)! - Added output which indicates where app is running when running the create keystone script.
- Updated dependencies [[`8735393e`](https://github.com/keystonejs/keystone/commit/8735393ec7b01dd0491700244e915b4b47c1cc53), [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad), [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad), [`20632bca`](https://github.com/keystonejs/keystone/commit/20632bca495058f2845d36fe95650eede0a9ebdc), [`3138013c`](https://github.com/keystonejs/keystone/commit/3138013c49205bd7f9b05833ae6158ebeb281dc0), [`5595e4c4`](https://github.com/keystonejs/keystone/commit/5595e4c45c618fa7e13a3d91e3ea3892b4f10475)]:
  - @keystonejs/build-field-types@5.0.1
  - @keystonejs/fields@5.1.0

## 5.1.0

### Minor Changes

- [`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469) [#1851](https://github.com/keystonejs/keystone/pull/1851) Thanks [@jesstelford](https://github.com/jesstelford)! - Added runtime database version validation

### Patch Changes

- Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469), [`ebbcad70`](https://github.com/keystonejs/keystone/commit/ebbcad7042596a9c83c32c8e08dad50f9fcb59fd), [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f)]:
  - @keystonejs/utils@5.1.0
  - @keystonejs/fields@5.0.2

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/access-control@5.0.0
  - @keystonejs/app-graphql@5.0.0
  - @keystonejs/build-field-types@5.0.0
  - @keystonejs/fields@5.0.0
  - @keystonejs/logger@5.0.0
  - @keystonejs/session@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/keystone

## 16.1.0

### Minor Changes

- [`3bc02545`](https://github.com/keystonejs/keystone-5/commit/3bc025452fb8e6e69790bdbee032ddfdeeb7dabb) [#1803](https://github.com/keystonejs/keystone-5/pull/1803) Thanks [@Vultraz](https://github.com/Vultraz)! - Disallow leading underscores in list and field names

* [`a48281ba`](https://github.com/keystonejs/keystone-5/commit/a48281ba605bf5bebc89fcbb36d3e69c17182eec) [#1783](https://github.com/keystonejs/keystone-5/pull/1783) Thanks [@timleslie](https://github.com/timleslie)! - The `keystone` cli now accepts a return of `{ keystone, apps, configureExpress }` from the entry file. `configureExpress` will be called on the Express app before applying the keystone middlewares.

### Patch Changes

- [`0a36b0f4`](https://github.com/keystonejs/keystone-5/commit/0a36b0f403da73a76106b5e14940a789466b4f94) [#1784](https://github.com/keystonejs/keystone-5/pull/1784) Thanks [@Vultraz](https://github.com/Vultraz)! - Removed adapterConnectOptions key (unused as of 144e6e86)

* [`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901) [#1789](https://github.com/keystonejs/keystone-5/pull/1789) Thanks [@timleslie](https://github.com/timleslie)! - `Relationship.convertResolvedOperationsToFieldValue()` has been removed.

* Updated dependencies [[`7129c887`](https://github.com/keystonejs/keystone-5/commit/7129c8878a825d961f2772be497dcd5bd6b2b697), [`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/app-graphql@8.2.1
  - @keystone-alpha/fields@15.0.0

## 16.0.1

### Patch Changes

- [`b0aee895`](https://github.com/keystonejs/keystone-5/commit/b0aee895f664cf5665fa700e68ffc532c35f424d) [#1776](https://github.com/keystonejs/keystone-5/pull/1776) Thanks [@jesstelford](https://github.com/jesstelford)! - Avoid the build command from hanging when an entry file may have a long-running process.

## 16.0.0

### Major Changes

- [`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9) [#1729](https://github.com/keystonejs/keystone-5/pull/1729) Thanks [@timleslie](https://github.com/timleslie)! - This change significantly changes how and when we populate `many`-relationships during queries and mutations.
  The behaviour of the GraphQL API has not changed, but queries should be more performant, particularly for items with many related items.
  The `existingItem` parameter in hooks will no longer have the `many`-relationship fields populated.
  `List.listQuery()` no longer populates `many` relationship fields.
  For most users there should not need to be any changes to code unless they are explicitly relying on a `many`-relationship field in a hook, in which case they will need to execute an explicit query to obtain the desired values.

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/fields@14.0.0

## 15.4.1

### Patch Changes

- [14fee364](https://github.com/keystonejs/keystone-5/commit/14fee364): Correctly pass `gqlName` for all access checks

## 15.4.0

### Minor Changes

- [b12e4ccb](https://github.com/keystonejs/keystone-5/commit/b12e4ccb): Add a global maxTotalResults limit to Keystone object
- [1405eb07](https://github.com/keystonejs/keystone-5/commit/1405eb07): Add `listKey`, `fieldKey` (fields only), `operation`, `gqlName`, `itemId` and `itemIds` as arguments to imperative access control functions.

### Patch Changes

- [3a52447d](https://github.com/keystonejs/keystone-5/commit/3a52447d): Update `getAccessControlledItem()` to remove short-circuit code which code lead to future data inconsistency.
- [65d32b54](https://github.com/keystonejs/keystone-5/commit/65d32b54): Fix session storage

## 15.3.1

### Patch Changes

- [b2c5277e](https://github.com/keystonejs/keystone-5/commit/b2c5277e): Use compose() function from utils package.

- Updated dependencies [4e6a574d](https://github.com/keystonejs/keystone-5/commit/4e6a574d):
  - @keystone-alpha/fields@13.0.0

## 15.3.0

### Minor Changes

- [552e6fb6](https://github.com/keystonejs/keystone-5/commit/552e6fb6): Add support for schema cache hints

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 15.2.1

### Patch Changes

- [d218cd55](https://github.com/keystonejs/keystone-5/commit/d218cd55): Make executeQuery() backwards compatible with old, single-schema KS

## 15.2.0

### Minor Changes

- [b9e2c45b](https://github.com/keystonejs/keystone-5/commit/b9e2c45b): Add support for query validation

## 15.1.2

### Patch Changes

- [258424d7](https://github.com/keystonejs/keystone-5/commit/258424d7): Correctly pass `originalInput` argument through to `beforeChange()` and `afterChange()` hooks.

## 15.1.1

### Patch Changes

- [bb3b389b](https://github.com/keystonejs/keystone-5/commit/bb3b389b): Correctly apply access control to gqlAuxFieldResolvers()

## 15.1.0

### Minor Changes

- [f56ffdfd](https://github.com/keystonejs/keystone-5/commit/f56ffdfd): Apply access control to auxiliary lists

### Patch Changes

- [42a45bbd](https://github.com/keystonejs/keystone-5/commit/42a45bbd): Remove hard-coded paths from app build process

## 15.0.0

### Major Changes

- [b61289b4](https://github.com/keystonejs/keystone-5/commit/b61289b4): Allow passing `{ access: ...}` when calling `keystone.extendGraphQLSchema()`. The `types` argument is now a list of objects of the form `{ access: ..., type: ...}`, rather than a list of strings.
- [0bba9f07](https://github.com/keystonejs/keystone-5/commit/0bba9f07): Check access control on custom queries/mutations before executing custom resolvers.
- [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d): Add support for `access: { auth: ... }` which controls whether authentication queries and mutations are accessible on a List

  If you have a `List` which is being used as the target of an Authentication Strategy, you should set `access: { auth: true }` on that list.

### Patch Changes

- [857386db](https://github.com/keystonejs/keystone-5/commit/857386db): Fix bug where a schema with no mutations would fail at schema generation time
- [d253220f](https://github.com/keystonejs/keystone-5/commit/d253220f): Updates the arg package that resolves a possible bug with connection strings in the CLI
- [9498c690](https://github.com/keystonejs/keystone-5/commit/9498c690): Fix meta queries with maxResults limits

## 14.0.0

### Major Changes

- [decf7319](https://github.com/keystonejs/keystone-5/commit/decf7319): Remove `skipAccessControl` option from `keystone.getTypeDefs()`, `List.getGqlTypes()`, `List.getGqlQueries()`, and `List.getGqlMutations()`.
- [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9): The `.access` property of Lists is now keyed by `schemaName`. As such, a number of getters and methods have been replaced with methods which take `{ schemaName }`.

  - `getGqlTypes()` -> `getGqlTypes({ schemaName })`
  - `getGqlQueries()` -> `getGqlQueries({ schemaName })`
  - `get gqlFieldResolvers()` -> `gqlFieldResolvers({ schemaName })`
  - `get gqlAuxFieldResolvers()` -> `gqlAuxFieldResolvers({ schemaName })`
  - `get gqlAuxQueryResolvers()` -> `gqlAuxQueryResolvers({ schemaName })`
  - `get gqlAuxMutationResolvers()` -> `gqlAuxMutationResolvers({ schemaName })`
  - `getGqlMutations()` -> `getGqlMutations({ schemaName })`
  - `get gqlQueryResolvers()` -> `gqlQueryResolvers({ schemaName })`
  - `get gqlMutationResolvers()` -> `gqlMutationResolvers({ schemaName })`

- [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d): `Keystone`, `List` and `Field` constructors now take `schemaNames` as config options. A number of methods also now take `schemaName` parameters.
  - `keystone.getTypeDefs()` -> `keystone.getTypeDefs({ schemaName })`
  - `keystone.getAdminSchema()` -> `keystone.getAdminSchema({ schemaName })`
  - `keystone.dumpSchema(file)` -> `keystone.dumpSchema(file, schemaName)`
  - `keystone.getAdminMeta()` -> `keystone.getAdminMeta({ schemaName })`
  - `list.getAdminMeta()` -> `list.getAdminMeta({ schemaName })`
  - `field.getAdminMeta()` -> `field.getAdminMeta({ schemaName })`

### Minor Changes

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

- [f8ad0975](https://github.com/keystonejs/keystone-5/commit/f8ad0975): The `cors` and `pinoOptions` parameters now live on `keystone.prepare()` rather than `new GraphQLApp()`

### Patch Changes

- [bc0b9813](https://github.com/keystonejs/keystone-5/commit/bc0b9813): `parseListAccess` and `parseFieldAccess` now take `schemaNames` as an argument, and return a nested access object, with the `schemaNames` as keys.

  For example,

  ```js
  parseListAccess({ defaultAccess: false, access: { public: true }, schemaNames: ['public', 'internal'] }
  ```

  will return

  ```js
  {
    public: { create: true, read: true, update: true, delete: true },
    internal: { create: false, read: false, update: false, delete: false },
  }
  ```

  These changes are backwards compatible with regard to the `access` argument, so

  ```js
  const access = { create: true, read: true, update: true, delete: true };
  parseListAccess({ access, schemaNames: ['public', 'internal'] }
  ```

  will return

  ```js
  {
    public: { create: true, read: true, update: true, delete: true },
    internal: { create: true, read: true, update: true, delete: true },
  }
  ```

- [76c3efa9](https://github.com/keystonejs/keystone-5/commit/76c3efa9): `keystone.getGraphQlContext()` no longer provides a default value for `schemaName`.

- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
  - @keystone-alpha/fields@11.0.0

## 13.1.0

### Minor Changes

- [63350996](https://github.com/keystonejs/keystone-5/commit/63350996): Add queryLimits and maxResults to List API

## 13.0.0

### Major Changes

- [8d0d98c7](https://github.com/keystonejs/keystone-5/commit/8d0d98c7): `cookieSecret` and `sessionStore` config options are now passed to the `Keystone` constructor instead of the individual auth or graphql packages.

### Minor Changes

- [8bb1bb0e](https://github.com/keystonejs/keystone-5/commit/8bb1bb0e): Add a `keystone.executeQuery()` method to run GraphQL queries and mutations directly against a Keystone instance. NOTE: These queries are executed without any Access Control checks by default.

## 12.0.1

### Patch Changes

- [1a20fd27](https://github.com/keystonejs/keystone-5/commit/1a20fd27): Fix bug with custom query/mutation resolvers

## 12.0.0

### Major Changes

- [33001656](https://github.com/keystonejs/keystone-5/commit/33001656): \* Added `keystone.extendGraphQLSchema()` as the interface for custom mutations and queries.

  ```javascript
  keystone.extendGraphQLSchema({
    types: ['type Foo { foo: Int }', ...],
    queries: [{ schema: '...', resolver: () => {} }, ...],
    mutations: [{ schema: '...', resolver: () => {} }, ...],
  });
  ```

  - `new List()` and `keystone.createList()` no longer accept `queries` or `mutations` options! Please use `extendGraphQLSchema()` instead.

## 11.0.0

### Major Changes

- [e42fdb4a](https://github.com/keystonejs/keystone-5/commit/e42fdb4a): Makes the password auth strategy its own package.
  Previously: `const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');`
  After change: `const { PasswordAuthStrategy } = require('@keystone-alpha/auth-password');`

## 10.5.0

### Minor Changes

- [b86f0e26](https://github.com/keystonejs/keystone-5/commit/b86f0e26): Renames the package `@keystone-alpha/passport-auth` to `@keystone-alpha/auth-passport`. Anyone using `passport-auth` should switch over to the new package - the old one will no longer be receiving updates.

## 10.4.0

### Minor Changes

- [d3238352](https://github.com/keystonejs/keystone-5/commit/d3238352): Implemented custom queries in the same format as custom mutations.

## 10.3.0

### Minor Changes

- [759a3c17](https://github.com/keystonejs/keystone-5/commit/759a3c17): Add a `types` property to custom mutations.

## 10.2.0

### Minor Changes

- [e5d4ee76](https://github.com/keystonejs/keystone-5/commit/e5d4ee76): Expose 'originalInput' to access control functions for lists & fields

## 10.1.0

### Minor Changes

- [36616092](https://github.com/keystonejs/keystone-5/commit/36616092): Added `plugins` option to the config of `createList`

## 10.0.0

### Major Changes

- [144e6e86](https://github.com/keystonejs/keystone-5/commit/144e6e86): - API Changes to Adapters: - Configs are now passed directly to the adapters rather than via `adapterConnectOptions`. - Default connections strings changed for both Knex and Mongoose adapters to be more inline with system defaults. - `keystone.connect()` no longer accepts a `to` paramter - the connection options must be passed to the adapter constructor (as above).

### Minor Changes

- [e049cfcb](https://github.com/keystonejs/keystone-5/commit/e049cfcb): Support defaultValue as a function at mutation execution time

## 9.1.0

### Minor Changes

- [d7819a55](https://github.com/keystonejs/keystone-5/commit/d7819a55): Run .resolveInput() on all fields/field hooks regardless of if data has been passed as part of the mutation. This enables .resolveInput() to be run on fields without data during an update mutation.

## 9.0.0

### Major Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Adding isIndexed field config and support for in most field types

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Check for the number type in label resolver to prevent false positive on zero.
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade prettier to 1.18.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Ensure resolveInput for list receives result from fields
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade graphql to 14.4.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade promise utility dependencies
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

## 8.0.0

### Major Changes

- [4007f5dd](https://github.com/keystonejs/keystone-5/commit/4007f5dd):

  Adding field instance to the BaseFieldAdapter constructor arguments

### Patch Changes

- [18064167](https://github.com/keystonejs/keystone-5/commit/18064167):

  Adding `knexOptions` to the KnexFieldAdapter to support DB-level config for nullability (`isNotNullable`) and defaults (`defaultTo`)

## 7.0.3

### Patch Changes

- [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):

  Refactoring the knex adapter (and field adapters) to give the field type more control of the table schema (add 0 or multiple columns, etc)

## 7.0.2

### Patch Changes

- [04371d0d](https://github.com/keystonejs/keystone-5/commit/04371d0d):

  Don't error when Auth Strategy doesn't provide getInputFragment() or validate() method.

* Updated dependencies [b6a9f6b9](https://github.com/keystonejs/keystone-5/commit/b6a9f6b9):
  - @keystone-alpha/fields@8.0.0

## 7.0.1

### Patch Changes

- [de9e709d](https://github.com/keystonejs/keystone-5/commit/de9e709d):

  Convert GraphQL SDL to AST before passing to Apollo

  Apollo released a breaking change in a semver-minor which causes it to
  stop understanding the SDL (string) GraphQL typeDefs we were passing it.
  This fix ensures we're converting to an AST to avoid the error being
  thrown.

  See https://github.com/keystonejs/keystone-5/issues/1340

## 7.0.0

### Major Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Gather views from fields via the renamed method `#extendAdminViews()` (was `#extendViews()`)

### Patch Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Correctly read `--connect-to` option on the CLI

## 6.0.0

### Major Changes

- [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):

  - `PasswordAuthStrategy#validate()` now accepts an object of `{ [identityField], [secretField] }` (was `{ identity, secret }`).
  - Auth Strategies can now add AdminMeta via a `#getAdminMeta()` method which will be attached to the `authStrategy` key of `adminMeta` in the Admin UI.
  - Added (un)authentication GraphQL mutations:
    - ```graphql
      mutation {
        authenticate<List>With<Strategy>(<strategy-args) {
          token # Add this token as a header: { Authorization: 'Bearer <token>' }
          item # The authenticated item from <List>
        }
      }
      ```
      For the `PasswordAuthStrategy`, that is:
      ```javascript
      const authStrategy = keystone.createAuthStrategy({
        type: PasswordAuthStrategy,
        list: 'User',
        config: {
          identityField: 'username',
          secretField: 'pass',
        },
      });
      ```
      ```graphql
      mutation {
        authenticateUserWithPassword(username: "jesstelford", pass: "abc123") {
          token
          item {
            username
          }
        }
      }
      ```
    - ```graphql
      mutation {
        unauthenticate<List> {
          success
        }
      }
      ```

### Patch Changes

- [3958a9c7](https://github.com/keystonejs/keystone-5/commit/3958a9c7):

  Fields configured with isRequired now behave as expected on create and update, returning a validation error if they are null.

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

- [b69a2276](https://github.com/keystonejs/keystone-5/commit/b69a2276):

  Removed unnecessary port parameter from keystone.prepare calls

- [ec9e6e2a](https://github.com/keystonejs/keystone-5/commit/ec9e6e2a):

  Fixed behaviour of isRequired within update operations.

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
  - @keystone-alpha/fields@7.0.0
  - @keystone-alpha/app-graphql@6.1.0
  - @keystone-alpha/session@2.0.0

## 5.0.1

### Patch Changes

- [af3f31dd](https://github.com/keystonejs/keystone-5/commit/af3f31dd):

  Set the default build directory the CLI `keystone start` command

## 5.0.0

### Major Changes

- [dfcabe6a](https://github.com/keystonejs/keystone-5/commit/dfcabe6a):

  Specify custom servers from within the index.js file

  - Major Changes:
    - The `index.js` export for `admin` must now be exported in the `servers`
      array:
      ```diff
       module.exports = {
         keystone,
      -  admin,
      +  apps: [admin],
       }
      ```
    - The `keystone.prepare()` method (often used within a _Custom Server_
      `server.js`) no longer returns a `server`, it now returns a `middlewares`
      array:
      ```diff
      +const express = require('express');
       const port = 3000;
       keystone.prepare({ port })
      -  .then(async ({ server, keystone: keystoneApp }) => {
      +  .then(async ({ middlewares, keystone: keystoneApp }) => {
           await keystoneApp.connect();
      -    await server.start();
      +    const app = express();
      +    app.use(middlewares);
      +    app.listen(port)
         });
      ```

### Minor Changes

- [a8061c78](https://github.com/keystonejs/keystone-5/commit/a8061c78):

  Add support for setting PORT and CONNECT_TO environment variables

- [b2651279](https://github.com/keystonejs/keystone-5/commit/b2651279):

  Improved DX with loading indicators when using keystone CLI

- [a98bce08](https://github.com/keystonejs/keystone-5/commit/a98bce08):

  Add support for an `onConnect` function to be passed to the Keystone constructor, which is called when all adapters have connected.

### Patch Changes

- [ff7547c5](https://github.com/keystonejs/keystone-5/commit/ff7547c5):

  Capture early requests to the keystone server while still booting

* Updated dependencies [b2651279](https://github.com/keystonejs/keystone-5/commit/b2651279):
  - @keystone-alpha/app-graphql@6.0.0

## 4.0.0

### Major Changes

- [24cd26ee](https://github.com/keystonejs/keystone-5/commit/24cd26ee):

  - Remove `.config` property from `Keystone` and `List` classes

- [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):

  - Moved Social Login Strategies into its own package `@keystone-alpha/passport-auth`.
  - Created base strategy `PassportAuthStrategy`. This enables quick addition of new Social Login Strategy based on PassportJs.
  - Refactored Twitter and Facebook to extend base `PassportAuthStrategy`.
  - Added Google and GitHub Auth Strategy by extending base `PassportAuthStrategy`.
  - Removed `passport` and related dependencies from `@keystone-alpha/keystone`.
  - `test-projects/facebook-login` project is renamed into `test-projects/social-login`
  - `social-login` project now support for social login with Twitter, Facebook, Google and GitHub inbuilt strategies from `@keystone-alpha/passport-auth` along with an example of how to implement your own PassportJs strategy for WordPress in `WordPressAuthStrategy.js`

- [ae5cf6cc](https://github.com/keystonejs/keystone-5/commit/ae5cf6cc):

  - List adapter config must now be specified within the `adapterConfig` field, rather than directly on the `config` object.

- [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):

  Remove custom server execution from the CLI.

  The Keystone CLI does not execute custom servers anymore, instead of running `keystone` to start a Keystone instance that has a custom server, run the server file directly with `node`.

  ```diff
  - "start": "keystone",
  + "start": "node server.js"
  ```

### Minor Changes

- [6f598e83](https://github.com/keystonejs/keystone-5/commit/6f598e83):

  - Add `build` and `start` commands

- [6f598e83](https://github.com/keystonejs/keystone-5/commit/6f598e83):

  - Add Admin UI static building

### Patch Changes

- [211b71c1](https://github.com/keystonejs/keystone-5/commit/211b71c1):

  - Fix bug in resolver for createMany mutations

- [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):

  - Add .isRequired and .isUnique properties to field adapters

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

- [60181234](https://github.com/keystonejs/keystone-5/commit/60181234):

  Use `unique()` from `@keystone-alpha/utils`

- [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):

  Use explicit field properties rather than field.config.

* Updated dependencies [e6e95173](https://github.com/keystonejs/keystone-5/commit/e6e95173):
* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
* Updated dependencies [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
  - @keystone-alpha/fields@6.0.0
  - @keystone-alpha/build-field-types@1.0.0
  - @keystone-alpha/access-control@1.0.4
  - @keystone-alpha/utils@3.0.0

## 3.1.0

- [patch][5180d2fb](https://github.com/keystonejs/keystone-5/commit/5180d2fb):

  - Remove erroneous addition of CRUD operations for Auxiliary Lists from GraphQL API

- [minor][cbe80e61](https://github.com/keystonejs/keystone-5/commit/cbe80e61):

  - Expose GraphQL `context` object to hooks for advanced use cases.

- [patch][ec76b500](https://github.com/keystonejs/keystone-5/commit/ec76b500):

  - Don't exclude aux field resolvers from GraphQL schema

- Updated dependencies [85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):
  - @keystone-alpha/fields@5.0.0

## 3.0.0

- [patch][b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):

  - Use named exports from @keystone-alpha/keystone package.

- [patch][b69fb9b7](https://github.com/keystonejs/keystone-5/commit/b69fb9b7):

  - Update dev devependencies

- [patch][baff3c89](https://github.com/keystonejs/keystone-5/commit/baff3c89):

  - Use the updated logger API

- [patch][302930a4](https://github.com/keystonejs/keystone-5/commit/302930a4):

  - Minor internal code cleanups

- [major][656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):

  - `WebServer.start()` no longer takes any arguments. Developer must now explicitly call `keystone.connect()` before calling `WebServer.start()`.

- [major][b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):

  - Make all parts of the API available as named exports.

- Updated dependencies [baff3c89](https://github.com/keystonejs/keystone-5/commit/baff3c89):
- Updated dependencies [37dcee37](https://github.com/keystonejs/keystone-5/commit/37dcee37):
  - @keystone-alpha/logger@2.0.0
  - @keystone-alpha/fields@4.0.0

## 2.0.0

- [major][8d385ede](https://github.com/keystonejs/keystone-5/commit/8d385ede):

  - Remove keystone.getAuxQueryResolvers method

- [major][52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):

  - Replace `Keystone.registerGraphQLQueryMethod` with `Keystone.registerSchema`. Add `schemaName` parameter to `getAccessContext`. The `getGraphQLQuery` parameter to `List` now takes a `schemaName` argument. These changes allow us to register more than one ApolloServer instance in our Keystone system.

## 1.0.4

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone-5/commit/98c02a46):
  - @keystone-alpha/access-control@1.0.2
  - @keystone-alpha/fields@3.0.1
  - @keystone-alpha/utils@2.0.0

## 1.0.3

- Updated dependencies [9a9f214a](https://github.com/keystonejs/keystone-5/commit/9a9f214a):
- Updated dependencies [de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):
  - @keystone-alpha/fields@3.0.0
  - @keystone-alpha/core@2.0.0

## 1.0.2

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone-5/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

- Updated dependencies [dcb93771](https://github.com/keystonejs/keystone-5/commit/dcb93771):
  - @keystone-alpha/fields@2.0.0

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

# @voussoir/keystone

## 1.0.0

- [major] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- Updated dependencies [1db45262]:
  - @voussoir/fields@3.1.0
  - @voussoir/core@3.0.0

# @voussoir/core

## 2.1.0

- [minor] 64e6abcc:

  - Allow lists and fields to specify a schemaDoc field

- [minor] 7a4950bf:

  - Allow mutations: [{ schema: ..., resolver: ...}] to be specified in createList

## 2.0.0

- [minor] 5f891cff:

  - Add a setupHooks method to BaseFieldAdapter

- [minor] aca26f71:

  - Expose access to GraphQL query method within hooks

- [minor] 6471fc4a:

  - Add fieldAdaptersByPath object to field adapters

- [patch] 797dc862:

  - Move itemsQueryMeta onto the base adapter class

- [patch] 266b5733:

  - Don't try to resolve nested mutations which will be later backfilled

- [major] 48773907:

  - Move findFieldAdapterForQuerySegment onto the BaseListAdapter

- [minor] f37a8086:

  - Can now dump the GraphQL schema with keystone.dumpSchema(filePath)

- [patch] e6e3ea06:

  - Explicitly check whether field types are supported by the adapter

- [major] 860c3b80:

  - Add a postConnect method to list adapters to capture all the work which needs to be done after the database has been connected to

- Updated dependencies [723371a0]:
- Updated dependencies [53e27d75]:
- Updated dependencies [5f8043b5]:
- Updated dependencies [a3d5454d]:
  - @voussoir/access-control@0.4.1
  - @voussoir/fields@3.0.0
  - @voussoir/utils@1.0.0

## 1.1.0

- [patch] 8d8666ad:

  - Dependency upgrade: graphql -> 14.0.3, graphql-tools -> 4.0.3

- [minor] 6d8ce0fc:

  - Add createMany and updateMany mutations

## 1.0.0

- [patch] a95e0c69:

  - Report correct gqlName when reporting errors in deleteMutation

- [patch] 21626b66:

  - preSave/postRead item hooks run consistently

- [patch] 84b62eaa:

  - Decouple access of items in the database from operations of them provide room for pre/post hooks

- [patch] cd885800:

  - Update the field hooks API to use the officially sanctioned hook names.

- [patch] c6fff24c:

  - Call field hooks when deleting many items at once.

- [major] c83c9ed5:

  - Add Keystone.getAccessContext and remove List.getAccessControl, List.getFieldAccessControl, and Field.validateAccessControl.

- [patch] ffc98ac4:

  - Rename the access control function parameter `item` to `existingItem`

- [minor] c3ebd9e6:

  - Update resolver code to make all list access checks explicit

- [minor] ebae2d6f:

  - Minor tweaks to the graphQL schema behaviour

- [major] 78fd9555:

  - Field configuration now tasks isRequired and isUnique, rather than required and unique

- [patch] 3801e040:

  - Separate out the pre-hooks for resolving relationship fields from the field.resolveInput hooks

- [major] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- Updated dependencies [01718870]:
  - @voussoir/fields@2.0.0

## 0.7.0

- [patch] d1777cc1:

  - Consolidate logging and error handling mechanisms within core/List/index.js

- [minor] 45d4c379:

  - Update the functional API for Keystone List objects for consistency

- [patch] 9c383fe8:

  - Always use \$set and { new: true } in the mongoose adapter update() method

- Updated dependencies [3ae588b7]:
  - @voussoir/access-control@0.3.0
  - @voussoir/fields@1.4.0

## 0.6.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

## 0.5.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.4.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

## 0.3.0

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [minor] Support unique field constraint for mongoose adapter [750a83e](750a83e)
- [patch] Surface errors that occur at the adapter level during a create mutation. [81641b2](81641b2)
- [patch] Updated dependencies [445b699](445b699)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/fields@1.0.0
  - @voussoir/access-control@0.1.3
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)

# @keystonejs/core

# @keystone-alpha/core

## 2.0.4

- Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
  - @keystone-alpha/server@5.0.0

## 2.0.3

- [patch][b69fb9b7](https://github.com/keystonejs/keystone-5/commit/b69fb9b7):

  - Update dev devependencies

- [patch][78d25c40](https://github.com/keystonejs/keystone-5/commit/78d25c40):

  - Restructure internal code

- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
  - @keystone-alpha/server@4.0.0

## 2.0.2

- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
  - @keystone-alpha/server@3.0.0

## 2.0.1

- [patch][5ddb2ed6](https://github.com/keystonejs/keystone-5/commit/5ddb2ed6):

  - Always display clickable links when starting a server in dev mode

## 2.0.0

- [major][de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):

  - Update authStrategy APIs
    - Removes `authStrategy` from the `config` API of `Webserver`.
    - Removes `authStrategy` from the `serverConfig` of the core `keystone` system builder.
    - Removes the `setAuthStrategy` method from `AdminUI`.
    - Adds `authStrategy` to the `config` API of `AdminUI`.
    - `Webserver` checks `keystone.auth` to determine whether to set up auth session middlewares.

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

# @voussoir/core

## 3.0.0

- [patch] 113e16d4:

  - Remove unused dependencies

- [major] 1db45262:

  - Use the `@voussoir/core` package as the entry point for custom servers.

    **Migration Guide**

      <!-- prettier-ignore -->

    1. Ensure your main entry point is `index.js`
    1. Add the new keystone module: `yarn add @voussoir/keystone`
    1. Remove the old keystone module: `yarn remove @voussoir/core`
    1. Update your imports:
       ```diff
       - const { Keystone } = require('@voussoir/core');
       + const { Keystone } = require('@voussoir/keystone');
       ```
    1. Update your `package.json` to start Keystone like so:
       ```json
       {
         "scripts": {
           "start": "keystone"
         }
       }
       ```
    1. Export your `keystone` and (optional) `admin` instances from `index.js`:
       ```javascript
       const keystone = new Keystone(/* .. */);
       const admin = new AdminUI(/* .. */);
       /* .. */
       module.exports = {
         keystone,
         admin,
       };
       ```
    1. Remove any usage of `@voussoir/server` / instantiations of `new WebServer()`
    1. If using an auth strategy, export it:
       ```javascript
       const authStrategy = keystone.createAuthStrategy(/* .. */);
       /* .. */
       module.exports = {
         keystone,
         admin,
         serverConfig: {
           authStrategy,
         },
       };
       ```
    1. If using any custom routes / modifying `server.app` in any way you'll need a
       _Custom Server_:

       1. Create a `server.js` along side your `index.js`
       1. Add the new core package: `yarn add @voussoir/core`
       1. Start with this boilerplate custom server in `server.js`:

          ```javascript
          const keystoneServer = require('@voussoir/core');

          keystoneServer
            .prepare({ port: 3000 })
            .then(({ server, keystone }) => {
              // [*] Custom routes get attached to `server.app` here.
              // If needed, you can access your Keystone instance via `keystone`.

              return server.start();
            })
            .then(({ port }) => {
              console.log(`Listening on port ${port}`);
            })
            .catch(error => {
              console.error(error);
            });
          ```

       1. Put your custom routes, etc, at the `[*]` marker in `server.js`.

    1. Run `yarn start`
