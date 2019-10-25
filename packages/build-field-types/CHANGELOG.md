# @keystonejs/build-field-types

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/build-field-types

## 1.0.6

### Patch Changes

- [4e6a574d](https://github.com/keystonejs/keystone-5/commit/4e6a574d): Remove lodash.omitby dependency

## 1.0.5

### Patch Changes

- [37b52b7b](https://github.com/keystonejs/keystone-5/commit/37b52b7b): support windows paths in development build

## 1.0.4

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade jest dependency
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade emotion to 10.0.14
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade prettier to 1.18.2

## 1.0.3

### Patch Changes

- [afc7e835](https://github.com/keystonejs/keystone-5/commit/afc7e835):

  Remove broken automatic @babel/runtime installation

- [a738a247](https://github.com/keystonejs/keystone-5/commit/a738a247):

  Improve entrypoint package.json creation
  Remove dead code
  Update success messages

## 1.0.2

### Patch Changes

- [01f12bfb](https://github.com/keystonejs/keystone-5/commit/01f12bfb):

  Remove copy of preconstruct's require hook and use @preconstruct/hook instead

## 1.0.1

### Patch Changes

- [e502af66](https://github.com/keystonejs/keystone-5/commit/e502af66):

  Fix dist directories not being cleared before builds causing broken builds with build-field-types

## 1.0.0

### Major Changes

- [e6e95173](https://github.com/keystonejs/keystone-5/commit/e6e95173):

  - Remove `devBabelPlugin` export which is unnecessary now because there is now a runtime implementation of `importView` for dev
  - Remove `aliases` export which is superseded by the `dev` command

### Minor Changes

- [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):

  - Create build-field-types package

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies
