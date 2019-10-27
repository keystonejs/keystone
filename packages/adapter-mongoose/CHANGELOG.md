# @keystonejs/adapter-mongoose

## 5.1.0

### Minor Changes

- [`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469) [#1851](https://github.com/keystonejs/keystone/pull/1851) Thanks [@jesstelford](https://github.com/jesstelford)! - Added runtime database version validation

### Patch Changes

- [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f) [#1837](https://github.com/keystonejs/keystone/pull/1837) Thanks [@timleslie](https://github.com/timleslie)! - Updated mongo-related dependencies

- Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469), [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f), [`e4a19e3f`](https://github.com/keystonejs/keystone/commit/e4a19e3f3e261ef476aee61d24dd2639eaf61881)]:
  - @keystonejs/keystone@5.1.0
  - @keystonejs/utils@5.1.0
  - @keystonejs/mongo-join-builder@5.0.1

## 5.0.1

### Patch Changes

- [`3c19cddd`](https://github.com/keystonejs/keystone/commit/3c19cddd0b8b8d1e17385a01a813a9e84ec14bb5) [#1838](https://github.com/keystonejs/keystone/pull/1838) Thanks [@jesstelford](https://github.com/jesstelford)! - Adding a new Relationship field when using the Mongoose adapter will no longer
  cause an "\$in needs an array" error to be thrown.

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/fields-mongoid@5.0.0
  - @keystonejs/keystone@5.0.0
  - @keystonejs/logger@5.0.0
  - @keystonejs/mongo-join-builder@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/adapter-mongoose

## 6.0.1

### Patch Changes

- [`768420f5`](https://github.com/keystonejs/keystone-5/commit/768420f567c244d57a4e2a3aaafe628ea9813d9d) [#1781](https://github.com/keystonejs/keystone-5/pull/1781) Thanks [@simonswiss](https://github.com/simonswiss)! - changing require path to "@keystone-alpha" instead of "@keystonejs"

- Updated dependencies [[`0a36b0f4`](https://github.com/keystonejs/keystone-5/commit/0a36b0f403da73a76106b5e14940a789466b4f94), [`3bc02545`](https://github.com/keystonejs/keystone-5/commit/3bc025452fb8e6e69790bdbee032ddfdeeb7dabb), [`a48281ba`](https://github.com/keystonejs/keystone-5/commit/a48281ba605bf5bebc89fcbb36d3e69c17182eec), [`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/keystone@16.1.0
  - @keystone-alpha/fields-mongoid@1.1.6

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
  - @keystone-alpha/mongo-join-builder@4.0.0
  - @keystone-alpha/fields-mongoid@1.1.5

## 5.0.0

### Major Changes

- [b96a3a58](https://github.com/keystonejs/keystone-5/commit/b96a3a58): Remove `.queryBuilder` property of the `MongooseListAdapter`.

### Patch Changes

- [4e6a574d](https://github.com/keystonejs/keystone-5/commit/4e6a574d): Internal refactor to inline the logic which was previously computed by getRelationshipQueryCondition().
- [a48ff0a3](https://github.com/keystonejs/keystone-5/commit/a48ff0a3): Internal refactor to move defintion of modifierConditions closer to where they're used.
- [82dfef03](https://github.com/keystonejs/keystone-5/commit/82dfef03): Move tokenizer functions out of this package and into `mongo-join-builder`.

- Updated dependencies [da4013e4](https://github.com/keystonejs/keystone-5/commit/da4013e4):
- Updated dependencies [157a439d](https://github.com/keystonejs/keystone-5/commit/157a439d):
  - @keystone-alpha/mongo-join-builder@3.0.0

## 4.0.8

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs
- [a7a9249b](https://github.com/keystonejs/keystone-5/commit/a7a9249b): Internal refactor

## 4.0.7

- Updated dependencies [42a45bbd](https://github.com/keystonejs/keystone-5/commit/42a45bbd):
  - @keystone-alpha/keystone@15.1.0

## 4.0.6

- Updated dependencies [b61289b4](https://github.com/keystonejs/keystone-5/commit/b61289b4):
- Updated dependencies [0bba9f07](https://github.com/keystonejs/keystone-5/commit/0bba9f07):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d):
  - @keystone-alpha/keystone@15.0.0
  - @keystone-alpha/fields-mongoid@1.1.2

## 4.0.5

### Patch Changes

- [a7ac4264](https://github.com/keystonejs/keystone-5/commit/a7ac4264): Enabled useUnifiedTopology to address deprecation warning

- Updated dependencies [decf7319](https://github.com/keystonejs/keystone-5/commit/decf7319):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
- Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d):
  - @keystone-alpha/keystone@14.0.0
  - @keystone-alpha/fields-mongoid@1.1.1

## 4.0.4

- Updated dependencies [8d0d98c7](https://github.com/keystonejs/keystone-5/commit/8d0d98c7):
  - @keystone-alpha/keystone@13.0.0

## 4.0.3

- Updated dependencies [33001656](https://github.com/keystonejs/keystone-5/commit/33001656):
  - @keystone-alpha/keystone@12.0.0

## 4.0.2

- Updated dependencies [e42fdb4a](https://github.com/keystonejs/keystone-5/commit/e42fdb4a):
  - @keystone-alpha/keystone@11.0.0

## 4.0.1

- Updated dependencies [b86f0e26](https://github.com/keystonejs/keystone-5/commit/b86f0e26):
  - @keystone-alpha/keystone@10.5.0

## 4.0.0

### Major Changes

- [144e6e86](https://github.com/keystonejs/keystone-5/commit/144e6e86): - API Changes to Adapters: - Configs are now passed directly to the adapters rather than via `adapterConnectOptions`. - Default connections strings changed for both Knex and Mongoose adapters to be more inline with system defaults. - `keystone.connect()` no longer accepts a `to` paramter - the connection options must be passed to the adapter constructor (as above).

## 3.0.1

### Patch Changes

- [ba146456](https://github.com/keystonejs/keystone-5/commit/ba146456): Depend on correct version of @keystone-alpha/fields-mongoid

## 3.0.0

### Major Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Adding isIndexed field config and support for in most field types
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade to mongoose 5.6.5

## 2.2.1

- Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone-5/commit/4007f5dd):
  - @keystone-alpha/keystone@8.0.0

## 2.2.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Allow transforming input types for `equalityConditionsInsensitive` & `stringConditions` methods on the MongooseAdapter.

* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @keystone-alpha/keystone@7.0.0

## 2.1.0

### Minor Changes

- [3958a9c7](https://github.com/keystonejs/keystone-5/commit/3958a9c7):

  Removed the isRequired parameter from MongooseFieldAdapter.buildValidator()

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
  - @keystone-alpha/keystone@6.0.0

## 2.0.1

- Updated dependencies [dfcabe6a](https://github.com/keystonejs/keystone-5/commit/dfcabe6a):
  - @keystone-alpha/keystone@5.0.0

## 2.0.0

### Major Changes

- [9a0456ff](https://github.com/keystonejs/keystone-5/commit/9a0456ff):

  Removing 'dbName' config option

## 1.0.7

### Patch Changes

- [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):

  - Add .isRequired and .isUnique properties to field adapters

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

- [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):

  - `mergeSchemaOptions` now uses `this.isUnique` rather than taking it as a config paramter

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone-5/commit/24cd26ee):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone-5/commit/ae5cf6cc):
* Updated dependencies [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/mongo-join-builder@2.0.1
  - @keystone-alpha/utils@3.0.0

## 1.0.6

- [patch][06464afb](https://github.com/keystonejs/keystone-5/commit/06464afb):

  - Simplify internal APIs

## 1.0.5

- [patch][b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):

  - Use named exports from @keystone-alpha/keystone package.

- [patch][baff3c89](https://github.com/keystonejs/keystone-5/commit/baff3c89):

  - Use the updated logger API

- [patch][302930a4](https://github.com/keystonejs/keystone-5/commit/302930a4):

  - Minor internal code cleanups

- [patch][2f908f30](https://github.com/keystonejs/keystone-5/commit/2f908f30):

  - Use the updated mongo-join-builder package API.

- [patch][8041c67e](https://github.com/keystonejs/keystone-5/commit/8041c67e):

  - Restructure internal code

- Updated dependencies [baff3c89](https://github.com/keystonejs/keystone-5/commit/baff3c89):
- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):
- Updated dependencies [2f908f30](https://github.com/keystonejs/keystone-5/commit/2f908f30):
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/logger@2.0.0
  - @keystone-alpha/mongo-join-builder@2.0.0

## 1.0.4

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone-5/commit/8d385ede):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):
  - @keystone-alpha/keystone@2.0.0

## 1.0.3

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone-5/commit/98c02a46):
  - @keystone-alpha/keystone@1.0.4
  - @keystone-alpha/mongo-join-builder@1.0.3
  - @keystone-alpha/utils@2.0.0

## 1.0.2

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone-5/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

## 1.0.1

- [patch][6ba2fd99](https://github.com/keystonejs/keystone-5/commit/6ba2fd99):

  - Mongoose option useFindAndModify is defaulted to false, resolves deprecation warnings

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone-5/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/adapter-mongoose

## 2.0.1

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] b155d942:

  - Update mongo/mongoose dependencies

## 2.0.0

- [minor] 5f891cff:

  - Add a setupHooks method to BaseFieldAdapter

- [major] 53e27d75:

  - Removes methods from Mongoose adapter classes: getFieldAdapterByQueryConditionKey, getSimpleQueryConditions, getRelationshipQueryConditions, getQueryConditions, getRelationshipQueryConditions, getRefListAdapter, hasQueryCondition.

- [patch] 797dc862:

  - Move itemsQueryMeta onto the base adapter class

- [major] 6471fc4a:

  - Remove mapsToPath method from MongooseListAdapter

- [major] 48773907:

  - Move findFieldAdapterForQuerySegment onto the BaseListAdapter

- [major] 860c3b80:

  - Add a postConnect method to list adapters to capture all the work which needs to be done after the database has been connected to

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [a3d5454d]:
  - @voussoir/core@2.0.0
  - @voussoir/mongo-join-builder@0.3.2
  - @voussoir/utils@1.0.0

## 1.0.0

- [patch] 21626b66:

  - preSave/postRead item hooks run consistently

- [patch] 929b177c:

  - Enable sorting on DateTime fields

- [major] 01718870:

  - Field configuration now tasks isRequired and isUnique, rather than required and unique

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [c83c9ed5]:
- Updated dependencies [c3ebd9e6]:
- Updated dependencies [ebae2d6f]:
- Updated dependencies [78fd9555]:
- Updated dependencies [d22820b1]:
  - @voussoir/core@1.0.0

## 0.5.0

- [patch] ff4b98c5:

  - Consolidate mongoose schema pre/post hooks for field types

- [minor] 9c383fe8:

  - Always use \$set and { new: true } in the mongoose adapter update() method

- [minor] b0d19c24:

  - Use consistent query condition builders across all field types

- Updated dependencies [45d4c379]:
  - @voussoir/core@0.7.0

## 0.4.1

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/core@0.6.0

## 0.4.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/core@0.5.0

## 0.3.2

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/core@0.4.0

## 0.3.1

- [patch] Updated dependencies [74af97e](74af97e)
  - @voussoir/mongo-join-builder@0.2.0

## 0.3.0

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [minor] Support unique field constraint for mongoose adapter [750a83e](750a83e)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/core@0.3.0
  - @voussoir/mongo-join-builder@0.1.3
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
