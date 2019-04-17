# @keystone-alpha/adapter-mongoose

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
