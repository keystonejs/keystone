# @arch-ui/fields

## 2.0.1

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade emotion to 10.0.14

## 2.0.0

### Major Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  - **Blocks**
    - Blocks must now be classes, which implement the `Block` interface.
    - `type` is no longer passed to a Block's constructor (it is expected to know it already).
    - Remove the `embed` block
    - `Block#dependencies` is removed; any depended upon views should be returned from `Block#getAdminViews()`.
    - `Block#extendAdminMeta()` is renamed to `Block#getViewOptions()`.
    - Add new `Block#getAdminViews()` method.
  - **Field Types**
    - `Field#extendViews()` is renamed to `Field#extendAdminViews()`.

## 1.0.0

### Major Changes

- [16befb6a](https://github.com/keystonejs/keystone-5/commit/16befb6a):

  Update the FieldLabel component to take `htmlFor`, `field` and `errors` as props in order to have a consistent mechanism for surfacing the isRequired flag and any access denied errors.

* Updated dependencies [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):
  - @arch-ui/theme@0.0.5

## 0.0.5

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

## 0.0.4

- [patch][e75c105c](https://github.com/keystonejs/keystone-5/commit/e75c105c):

  - admin revamp

## 0.0.3

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

## 0.0.2

- [patch] 23c3fee5:

  - Update babel packages and plugins

- [patch] 113e16d4:

  - Remove unused dependencies
