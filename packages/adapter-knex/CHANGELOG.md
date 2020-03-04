# @keystonejs/adapter-knex

## 6.3.1

### Patch Changes

- [`635529c9`](https://github.com/keystonejs/keystone/commit/635529c9f227ae968332cd32e63875c4561af926) [#2431](https://github.com/keystonejs/keystone/pull/2431) Thanks [@Vultraz](https://github.com/Vultraz)! - Skip database version validation when not using a PostgreSQL client.

- Updated dependencies [[`7ce804a8`](https://github.com/keystonejs/keystone/commit/7ce804a877300709375e5bc14206080ab15aec54), [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09), [`3abc5883`](https://github.com/keystonejs/keystone/commit/3abc58831e0f9b5871569a3fa6b21be7dc269cf3), [`8bdbb114`](https://github.com/keystonejs/keystone/commit/8bdbb114f6b2864693ae6e534df6fe8ee8345a60)]:
  - @keystonejs/keystone@5.6.0
  - @keystonejs/fields-auto-increment@5.1.1
  - @keystonejs/utils@5.2.1

## 6.3.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/fields-auto-increment@5.1.0
  - @keystonejs/keystone@5.5.0
  - @keystonejs/logger@5.1.0
  - @keystonejs/utils@5.2.0

## 6.2.0

### Minor Changes

- [`5b058a63`](https://github.com/keystonejs/keystone/commit/5b058a633c84465c9dff7cf940c8cb12bddcf215) [#2292](https://github.com/keystonejs/keystone/pull/2292) - Implemented a basic search on name field. This makes the Relationship and list search work the same as the mongoose adapter.

### Patch Changes

- Updated dependencies [[`eb36cf37`](https://github.com/keystonejs/keystone/commit/eb36cf3731984cc7cf60b60cb1c043962252610f), [`8f54a4eb`](https://github.com/keystonejs/keystone/commit/8f54a4eb2d63ed042d736fd20ab622f326e111b8)]:
  - @keystonejs/keystone@5.4.3

## 6.1.4

### Patch Changes

- [`c335a196`](https://github.com/keystonejs/keystone/commit/c335a19693a804d9ff4af9eb2825c666f851a597) [#2270](https://github.com/keystonejs/keystone/pull/2270) - Added an internal method `_createTables()` to factor out table creation.

* [`5a99cc7a`](https://github.com/keystonejs/keystone/commit/5a99cc7a8523ad5ca83d3e369b604247196fb8f2) [#2262](https://github.com/keystonejs/keystone/pull/2262) - Internal code modifications, no functional changes.

## 6.1.3

### Patch Changes

- [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29) [#2189](https://github.com/keystonejs/keystone/pull/2189) - Upgraded prettier to 1.19.1 and formatted code accordingly.

* [`4cd4499d`](https://github.com/keystonejs/keystone/commit/4cd4499d9d19a5b379b2ae6ab1028c008248629a) [#2190](https://github.com/keystonejs/keystone/pull/2190) - Upgraded `knex` to `^0.20.6` and `pg` to `^7.17.0`.
* Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a), [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29), [`05d07adf`](https://github.com/keystonejs/keystone/commit/05d07adf84059ff565cd2394f68d71d92e657485), [`78193f9c`](https://github.com/keystonejs/keystone/commit/78193f9c9d93655fb0d4b8dc494fbe4c622a4d64)]:
  - @keystonejs/fields-auto-increment@5.0.3
  - @keystonejs/utils@5.1.3
  - @keystonejs/keystone@5.4.1

## 6.1.2

### Patch Changes

- [`a9a00f98`](https://github.com/keystonejs/keystone/commit/a9a00f9815b872ca378a0c32295ad4fc17ded067) [#2125](https://github.com/keystonejs/keystone/pull/2125) - Fix syntax error causing hard crash on boot in Node

## 6.1.1

### Patch Changes

- [`3d2c4b3f`](https://github.com/keystonejs/keystone/commit/3d2c4b3fb8f05e79fc1a4a8e39077058466795a2) [#2112](https://github.com/keystonejs/keystone/pull/2112) - Added knex adaptar database version validiation
- Updated dependencies [[`ae078619`](https://github.com/keystonejs/keystone/commit/ae0786197713db779791bf4da5d92a144d46fe6f), [`3d2c4b3f`](https://github.com/keystonejs/keystone/commit/3d2c4b3fb8f05e79fc1a4a8e39077058466795a2), [`ae078619`](https://github.com/keystonejs/keystone/commit/ae0786197713db779791bf4da5d92a144d46fe6f)]:
  - @keystonejs/keystone@5.4.0
  - @keystonejs/utils@5.1.2

## 6.1.0

### Minor Changes

- [`045af44`](https://github.com/keystonejs/keystone/commit/045af44b1a9fa186dbc04c1d05b07a13ba58e3b0) [#2106](https://github.com/keystonejs/keystone/pull/2106) - Removed logic that (incorrectly) auto-detects when the DB needs to be setup (and nukes existing data).

## 6.0.0

### Major Changes

- [`44b2bc93`](https://github.com/keystonejs/keystone/commit/44b2bc938fd508ac75f6a9cbb364006b9f122711) [#1975](https://github.com/keystonejs/keystone/pull/1975) Thanks [@timleslie](https://github.com/timleslie)! - Removed `KnexListAdapter.createForeignKeys()` method.

* [`a3fdc50e`](https://github.com/keystonejs/keystone/commit/a3fdc50ebb61b38814816804b04d7cb4bc0fc70a) [#1972](https://github.com/keystonejs/keystone/pull/1972) Thanks [@timleslie](https://github.com/timleslie)! - `KnexListAdapter.realKeys` are now computed in the `postConnect()` phase, rather than at object instantiation.

- [`da62aa4a`](https://github.com/keystonejs/keystone/commit/da62aa4a0af9cf27fd59fdcfb6b960e24999254d) [#1971](https://github.com/keystonejs/keystone/pull/1971) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `KnexListAdapter.createAdjacencyTable()` method.

### Patch Changes

- [`8188d76c`](https://github.com/keystonejs/keystone/commit/8188d76cb3f5d3e112ef95fd4e1887db9a520d9d) [#1980](https://github.com/keystonejs/keystone/pull/1980) Thanks [@timleslie](https://github.com/timleslie)! - Removed `KnexRelationshipInterface.createForeignKey()`.

* [`0acdae17`](https://github.com/keystonejs/keystone/commit/0acdae17c4b2bcb234a314ad1aba311981affc8f) [#1999](https://github.com/keystonejs/keystone/pull/1999) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated the code paths for `create` and `update` operations for better internal consistency.

- [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f) [#2006](https://github.com/keystonejs/keystone/pull/2006) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated implementation of all `listAdapter.find\*()` methods to use the `itemsQuery()` API for internal consistency.

* [`860dabec`](https://github.com/keystonejs/keystone/commit/860dabecacdf81aa1563cea9a5d50add8623dac1) [#1973](https://github.com/keystonejs/keystone/pull/1973) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug which generated bad queries for deeply nested queries.

- [`721472e1`](https://github.com/keystonejs/keystone/commit/721472e1801584be5807d6637c646b1755366d3e) [#1976](https://github.com/keystonejs/keystone/pull/1976) Thanks [@timleslie](https://github.com/timleslie)! - Simplified code which performs update operations.
- Updated dependencies [[`77056ebd`](https://github.com/keystonejs/keystone/commit/77056ebdb31e58d27372925e8e24311a8c7d9e33), [`733ac847`](https://github.com/keystonejs/keystone/commit/733ac847cab488dc92a30e7b458191d750fd5a3d), [`e68fc43b`](https://github.com/keystonejs/keystone/commit/e68fc43ba006f9c958f9c81ae20b230d05c2cab6), [`d4d89836`](https://github.com/keystonejs/keystone/commit/d4d89836700413c1da2b76e9b82b649c2cac859d), [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f), [`1f4dc33d`](https://github.com/keystonejs/keystone/commit/1f4dc33d8a5ac4e38427eb215a7a8bc3504ae153), [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071), [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64)]:
  - @keystonejs/keystone@5.3.0
  - @keystonejs/fields-auto-increment@5.0.1

## 5.1.0

### Minor Changes

- [`b68b74f3`](https://github.com/keystonejs/keystone/commit/b68b74f3e77ebd91711c72aac369ab2d5905cb36) [#1903](https://github.com/keystonejs/keystone/pull/1903) Thanks [@timleslie](https://github.com/timleslie)! - Added `.tableName` property to `KnexListAdapter`.

### Patch Changes

- [`0154f892`](https://github.com/keystonejs/keystone/commit/0154f892a1771b4f88b35f34a1ba47eaf1721dfe) [#1914](https://github.com/keystonejs/keystone/pull/1914) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded `pg` and `knex` dependencies.
- Updated dependencies [[`45fd7ab8`](https://github.com/keystonejs/keystone/commit/45fd7ab899655364d0071c0d276d188378944ff5), [`b0756c65`](https://github.com/keystonejs/keystone/commit/b0756c65525625919c72364d8cefc32d864c7c0e), [`d132a3c6`](https://github.com/keystonejs/keystone/commit/d132a3c64aec707b98ed9a9ceffee44a98749b0a)]:
  - @keystonejs/keystone@5.1.1

## 5.0.1

### Patch Changes

- [`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469) [#1851](https://github.com/keystonejs/keystone/pull/1851) Thanks [@jesstelford](https://github.com/jesstelford)! - Added runtime database version validation

- Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469)]:
  - @keystonejs/keystone@5.1.0
  - @keystonejs/utils@5.1.0

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/fields-auto-increment@5.0.0
  - @keystonejs/keystone@5.0.0
  - @keystonejs/logger@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/adapter-knex

## 6.0.2

### Patch Changes

- [`768420f5`](https://github.com/keystonejs/keystone-5/commit/768420f567c244d57a4e2a3aaafe628ea9813d9d) [#1781](https://github.com/keystonejs/keystone-5/pull/1781) Thanks [@simonswiss](https://github.com/simonswiss)! - changing require path to "@keystone-alpha" instead of "@keystonejs"

- Updated dependencies [[`0a36b0f4`](https://github.com/keystonejs/keystone-5/commit/0a36b0f403da73a76106b5e14940a789466b4f94), [`3bc02545`](https://github.com/keystonejs/keystone-5/commit/3bc025452fb8e6e69790bdbee032ddfdeeb7dabb), [`a48281ba`](https://github.com/keystonejs/keystone-5/commit/a48281ba605bf5bebc89fcbb36d3e69c17182eec), [`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/keystone@16.1.0
  - @keystone-alpha/fields-auto-increment@2.0.5

## 6.0.1

### Patch Changes

- [`64ac0665`](https://github.com/keystonejs/keystone-5/commit/64ac0665a0b8b52a7c68678f6d478c8206d82e95) [#1770](https://github.com/keystonejs/keystone-5/pull/1770) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Fixes the help text shown when no db is initialised

## 6.0.0

### Major Changes

- [`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9) [#1729](https://github.com/keystonejs/keystone-5/pull/1729) Thanks [@timleslie](https://github.com/timleslie)! - This change significantly changes how and when we populate `many`-relationships during queries and mutations.
  The behaviour of the GraphQL API has not changed, but queries should be more performant, particularly for items with many related items.
  The `existingItem` parameter in hooks will no longer have the `many`-relationship fields populated.
  `List.listQuery()` no longer populates `many` relationship fields.
  For most users there should not need to be any changes to code unless they are explicitly relying on a `many`-relationship field in a hook, in which case they will need to execute an explicit query to obtain the desired values.

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/keystone@16.0.0
  - @keystone-alpha/fields-auto-increment@2.0.4

## 5.0.0

### Major Changes

- [6c4df466](https://github.com/keystonejs/keystone-5/commit/6c4df466): `KnexListAdapter.findById()` will no longer populate `many` relationship fields.

### Patch Changes

- [84f4dbad](https://github.com/keystonejs/keystone-5/commit/84f4dbad): handle errors better when knex connection is an object

## 4.0.11

### Patch Changes

- [629e1ea9](https://github.com/keystonejs/keystone-5/commit/629e1ea9): Fix a bug which limited the number of items in a many-relatinoship to 65K
- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 4.0.10

- Updated dependencies [42a45bbd](https://github.com/keystonejs/keystone-5/commit/42a45bbd):
  - @keystone-alpha/keystone@15.1.0

## 4.0.9

- Updated dependencies [b61289b4](https://github.com/keystonejs/keystone-5/commit/b61289b4):
- Updated dependencies [0bba9f07](https://github.com/keystonejs/keystone-5/commit/0bba9f07):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d):
  - @keystone-alpha/keystone@15.0.0
  - @keystone-alpha/fields-auto-increment@2.0.1

## 4.0.8

- Updated dependencies [decf7319](https://github.com/keystonejs/keystone-5/commit/decf7319):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
- Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d):
  - @keystone-alpha/keystone@14.0.0
  - @keystone-alpha/fields-auto-increment@2.0.0

## 4.0.7

- Updated dependencies [8d0d98c7](https://github.com/keystonejs/keystone-5/commit/8d0d98c7):
  - @keystone-alpha/keystone@13.0.0

## 4.0.6

### Patch Changes

- [7e280f57](https://github.com/keystonejs/keystone-5/commit/7e280f57): Updates warning message when knex cannot find a database

## 4.0.5

- Updated dependencies [33001656](https://github.com/keystonejs/keystone-5/commit/33001656):
  - @keystone-alpha/keystone@12.0.0

## 4.0.4

- Updated dependencies [e42fdb4a](https://github.com/keystonejs/keystone-5/commit/e42fdb4a):
  - @keystone-alpha/keystone@11.0.0

## 4.0.3

- Updated dependencies [b86f0e26](https://github.com/keystonejs/keystone-5/commit/b86f0e26):
  - @keystone-alpha/keystone@10.5.0

## 4.0.2

### Patch Changes

- [5631ce3c](https://github.com/keystonejs/keystone-5/commit/5631ce3c): Faster Knex query generation
- [b8d30f57](https://github.com/keystonejs/keystone-5/commit/b8d30f57): Minor performance improvements to Knex adapter

## 4.0.1

### Patch Changes

- [3eeb07c7](https://github.com/keystonejs/keystone-5/commit/3eeb07c7): - Re-instate default config for Knex adapter
  - Throw the correct error object when a connection error occurs in the Knex
    Database

## 4.0.0

### Major Changes

- [144e6e86](https://github.com/keystonejs/keystone-5/commit/144e6e86): - API Changes to Adapters: - Configs are now passed directly to the adapters rather than via `adapterConnectOptions`. - Default connections strings changed for both Knex and Mongoose adapters to be more inline with system defaults. - `keystone.connect()` no longer accepts a `to` paramter - the connection options must be passed to the adapter constructor (as above).

### Patch Changes

- [87155453](https://github.com/keystonejs/keystone-5/commit/87155453): Refactor Knex query builder to fix many-to-many filtering in complex queries, and reduce the number of database calls
- [e049cfcb](https://github.com/keystonejs/keystone-5/commit/e049cfcb): Knex adapter is smarter about default values

## 3.0.0

### Major Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Adding isIndexed field config and support for in most field types
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade knex to 0.19.0
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Fixing application of some field config on knex
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Adding `AutoIncrement` field type
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Reload all columns after insert (knex); fixes #1399

## 2.1.0

### Minor Changes

- [18064167](https://github.com/keystonejs/keystone-5/commit/18064167):

  Adding `knexOptions` to the KnexFieldAdapter to support DB-level config for nullability (`isNotNullable`) and defaults (`defaultTo`)

* Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone-5/commit/4007f5dd):
  - @keystone-alpha/keystone@8.0.0

## 2.0.0

### Major Changes

- [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):

  Refactoring the knex adapter (and field adapters) to give the field type more control of the table schema (add 0 or multiple columns, etc)

## 1.1.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Move Knex Database Dropping from _always_ to _with config `dropDatabase: true`_.

* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @keystone-alpha/keystone@7.0.0

## 1.0.9

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
  - @keystone-alpha/keystone@6.0.0

## 1.0.8

- Updated dependencies [dfcabe6a](https://github.com/keystonejs/keystone-5/commit/dfcabe6a):
  - @keystone-alpha/keystone@5.0.0

## 1.0.7

### Patch Changes

- [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):

  - Add .isRequired and .isUnique properties to field adapters

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone-5/commit/24cd26ee):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone-5/commit/ae5cf6cc):
* Updated dependencies [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/utils@3.0.0

## 1.0.6

- [patch][4eb2dcd0](https://github.com/keystonejs/keystone-5/commit/4eb2dcd0):

  - Fix bug in \_some, \_none, \_every queries

## 1.0.5

- [patch][b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):

  - Use named exports from @keystone-alpha/keystone package.

- [patch][3e3738dd](https://github.com/keystonejs/keystone-5/commit/3e3738dd):

  - Restructure internal code

- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):
  - @keystone-alpha/keystone@3.0.0

## 1.0.4

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone-5/commit/8d385ede):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):
  - @keystone-alpha/keystone@2.0.0

## 1.0.3

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone-5/commit/98c02a46):
  - @keystone-alpha/keystone@1.0.4
  - @keystone-alpha/utils@2.0.0

## 1.0.2

- [patch][3a775092](https://github.com/keystonejs/keystone-5/commit/3a775092):

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

# @voussoir/adapter-knex

## 0.0.3

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

## 0.0.2

- [patch] 6471fc4a:

  - Add fieldAdaptersByPath object to field adapters
