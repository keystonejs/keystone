# @keystone-alpha/fields-auto-increment

## 2.0.4

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/adapter-knex@6.0.0
  - @keystone-alpha/fields@14.0.0

## 2.0.3

- Updated dependencies [6c4df466](https://github.com/keystonejs/keystone-5/commit/6c4df466):
  - @keystone-alpha/fields@13.1.0
  - @keystone-alpha/adapter-knex@5.0.0

## 2.0.2

- Updated dependencies [4e6a574d](https://github.com/keystonejs/keystone-5/commit/4e6a574d):
  - @keystone-alpha/fields@13.0.0

## 2.0.1

- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d):
  - @keystone-alpha/adapter-knex@4.0.9
  - @keystone-alpha/fields@12.0.0

## 2.0.0

### Major Changes

- [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9): The `.access` property of Fields is now keyed by `schemaName`. As such, a number of getters have been replaced with methods which take `{ schemaName }`.

  - `get gqlOutputFields()` -> `gqlOutputFields({ schemaName })`
  - `get gqlOutputFieldResolvers()` -> `gqlOutputFieldResolvers({ schemaName })`
  - `get gqlAuxFieldResolvers() -> gqlAuxFieldResolvers({ schemaName })`
  - `get gqlAuxQueryResolvers()` -> `gqlAuxQueryResolvers({ schemaName })`
  - `get gqlAuxMutationResolvers()` -> `gqlAuxMutationResolvers({ schemaName })`
  - `get gqlQueryInputFields()` -> `gqlQueryInputFields({ schemaName })`

* Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d):
  - @keystone-alpha/adapter-knex@4.0.8
  - @keystone-alpha/fields@11.0.0

## 1.0.1

- Updated dependencies [144e6e86](https://github.com/keystonejs/keystone-5/commit/144e6e86):
  - @keystone-alpha/fields@10.2.0
  - @keystone-alpha/adapter-knex@4.0.0

## 1.0.0

### Major Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Adding `AutoIncrement` field type
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Adding isIndexed field config and support for in most field types
