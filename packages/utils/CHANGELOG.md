# @keystone-alpha/utils

## 3.0.2

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade promise utility dependencies

## 3.0.1

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 3.0.0

### Major Changes

- [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):

  - Remove `checkRequiredConfig`, `fixConfigKeys` and `camelize`.

### Minor Changes

- [c9102446](https://github.com/keystonejs/keystone-5/commit/c9102446):

  - Add a mechanism for loading multiple Suspense-aware components in parallel

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

## 2.0.0

- [major][98c02a46](https://github.com/keystonejs/keystone-5/commit/98c02a46):

  - Distribute CommonJS & ESM builds of the @keystone-alpha/utils package.

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

# @voussoir/utils

## 1.0.0

- [major] 723371a0:

  - Correctly surface nested errors from GraphQL

- [minor] aca26f71:

  - Expose access to GraphQL query method within hooks

- [minor] a3d5454d:

  - Add flatMap, noop, identity functions

## 0.3.1

- [patch] 06b9968e:

  - Add zipObj function

## 0.3.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.2.0

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [minor] Added createLazyDeferred method [9c75136](9c75136)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
