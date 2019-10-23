# @keystone/list-plugins

## 5.0.0

### Major Changes

- [`c7ba40ec`](https://github.com/keystonejs/keystone-5/commit/c7ba40ec98116603c6b7a501d2442e16170ec6be) [#1813](https://github.com/keystonejs/keystone-5/pull/1813) Thanks [@jesstelford](https://github.com/jesstelford)! - - This is the first release of `@keystone/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystone` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystone/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`c7ba40ec`](https://github.com/keystonejs/keystone-5/commit/c7ba40ec98116603c6b7a501d2442e16170ec6be)]:
  - @keystone/fields@5.0.0

# @keystone-alpha/list-plugins

## 1.0.5

### Patch Changes

- Updated dependencies [[`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/fields@15.0.0

## 1.0.4

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/fields@14.0.0

## 1.0.3

- Updated dependencies [4e6a574d](https://github.com/keystonejs/keystone-5/commit/4e6a574d):
  - @keystone-alpha/fields@13.0.0

## 1.0.2

- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d):
  - @keystone-alpha/fields@12.0.0

## 1.0.1

- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
- Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d):
  - @keystone-alpha/fields@11.0.0

## 1.0.0

### Major Changes

- [3469873b](https://github.com/keystonejs/keystone-5/commit/3469873b): added initial release of list-plugins with support for createdAt, updatedAt, createdBy and updatedBy tracking using List plugins feature
  updated login test project to add a list with all possible tracking field options.
