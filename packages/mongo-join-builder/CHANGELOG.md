# @keystonejs/mongo-join-builder

## 5.0.1

### Patch Changes

- [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f) [#1837](https://github.com/keystonejs/keystone/pull/1837) Thanks [@timleslie](https://github.com/timleslie)! - Updated mongo-related dependencies

* [`e4a19e3f`](https://github.com/keystonejs/keystone/commit/e4a19e3f3e261ef476aee61d24dd2639eaf61881) [#1844](https://github.com/keystonejs/keystone/pull/1844) Thanks [@jesstelford](https://github.com/jesstelford)! - Adding a new Relationship field when using the Mongoose adapter will no longer cause an "\$in requires an array as a second argument, found: missing" error to be thrown.

* Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469)]:
  - @keystonejs/utils@5.1.0

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/utils@5.0.0

# @keystone-alpha/mongo-join-builder

## 4.0.0

### Major Changes

- [`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9) [#1729](https://github.com/keystonejs/keystone-5/pull/1729) Thanks [@timleslie](https://github.com/timleslie)! - This change significantly changes how and when we populate `many`-relationships during queries and mutations.
  The behaviour of the GraphQL API has not changed, but queries should be more performant, particularly for items with many related items.
  The `existingItem` parameter in hooks will no longer have the `many`-relationship fields populated.
  `List.listQuery()` no longer populates `many` relationship fields.
  For most users there should not need to be any changes to code unless they are explicitly relying on a `many`-relationship field in a hook, in which case they will need to execute an explicit query to obtain the desired values.

## 3.0.1

### Patch Changes

- [9baf6d4d](https://github.com/keystonejs/keystone-5/commit/9baf6d4d): Fix import/require mixup

## 3.0.0

### Major Changes

- [da4013e4](https://github.com/keystonejs/keystone-5/commit/da4013e4): Remove the `mongoJoinBuilder()` function and expose the component functions `{ queryParser, pipelineBuilder, mutationBuilder }`.
- [157a439d](https://github.com/keystonejs/keystone-5/commit/157a439d): Update queryParser to access a `{ listAdapter }` rather than a `{ tokenizer }`. This means that `{ simpleTokenizer, relationshipTokenizer, getRelatedListAdapterFromQueryPathFactory}` do not need to be exported from `mongo-join-builder`.

### Minor Changes

- [82dfef03](https://github.com/keystonejs/keystone-5/commit/82dfef03): Temporarily add simpleTokenizer, relationshipTokenizer and getRelatedListAdapterFromQueryPathFactory to the package API.

### Patch Changes

- [d4fb1326](https://github.com/keystonejs/keystone-5/commit/d4fb1326): Refactor internals to simplify tokenizer interfaces.
- [de352135](https://github.com/keystonejs/keystone-5/commit/de352135): Internal refactor to remove `postQueryMutation`.
- [3f0a45da](https://github.com/keystonejs/keystone-5/commit/3f0a45da): Internal refactor to decompose joinBuilder()
- [b2c5277e](https://github.com/keystonejs/keystone-5/commit/b2c5277e): Use compose() function from utils package.

## 2.0.3

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade to mongoose 5.6.5

## 2.0.2

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 2.0.1

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
  - @keystone-alpha/utils@3.0.0

## 2.0.0

- [patch][b69fb9b7](https://github.com/keystonejs/keystone-5/commit/b69fb9b7):

  - Update dev devependencies

- [major][2f908f30](https://github.com/keystonejs/keystone-5/commit/2f908f30):

  - Export { mongoJoinBuilder } as the API, rather than a default export

## 1.0.3

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone-5/commit/98c02a46):
  - @keystone-alpha/utils@2.0.0

## 1.0.2

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone-5/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

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
