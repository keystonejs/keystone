# @keystone-alpha/field-content

## 3.1.4

### Patch Changes

- Updated dependencies [[`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/fields@15.0.0

## 3.1.3

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/fields@14.0.0

## 3.1.2

- Updated dependencies [4e6a574d](https://github.com/keystonejs/keystone-5/commit/4e6a574d):
  - @keystone-alpha/fields@13.0.0

## 3.1.1

### Patch Changes

- [04aa6a08](https://github.com/keystonejs/keystone-5/commit/04aa6a08): Fix regression when parent list of a Content field had a `where` clause as its access control.

## 3.1.0

### Minor Changes

- [f56ffdfd](https://github.com/keystonejs/keystone-5/commit/f56ffdfd): Apply access control to auxiliary lists

## 3.0.1

- Updated dependencies [7689753c](https://github.com/keystonejs/keystone-5/commit/7689753c):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d):
  - @keystone-alpha/fields@12.0.0
  - @arch-ui/input@0.1.0

## 3.0.0

### Major Changes

- [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9): The `.access` property of Fields is now keyed by `schemaName`. As such, a number of getters have been replaced with methods which take `{ schemaName }`.

  - `get gqlOutputFields()` -> `gqlOutputFields({ schemaName })`
  - `get gqlOutputFieldResolvers()` -> `gqlOutputFieldResolvers({ schemaName })`
  - `get gqlAuxFieldResolvers() -> gqlAuxFieldResolvers({ schemaName })`
  - `get gqlAuxQueryResolvers()` -> `gqlAuxQueryResolvers({ schemaName })`
  - `get gqlAuxMutationResolvers()` -> `gqlAuxMutationResolvers({ schemaName })`
  - `get gqlQueryInputFields()` -> `gqlQueryInputFields({ schemaName })`

* Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d):
  - @keystone-alpha/fields@11.0.0

## 2.1.0

### Minor Changes

- [e049cfcb](https://github.com/keystonejs/keystone-5/commit/e049cfcb): Support defaultValue as a function in view Controllers

## 2.0.2

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade emotion to 10.0.14
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade prettier to 1.18.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade promise utility dependencies

- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9):
  - @keystone-alpha/fields@10.0.0

## 2.0.1

- Updated dependencies [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):
  - @keystone-alpha/fields@9.0.0

## 2.0.0

### Major Changes

- [ac7934fe](https://github.com/keystonejs/keystone-5/commit/ac7934fe):

  Update Slate 0.44.12 -> 0.47.4 & slate-rect 0.21.18 -> 0.22.4

### Patch Changes

- [ac7934fe](https://github.com/keystonejs/keystone-5/commit/ac7934fe):

  Ensure all plugins for default Blocks are added to Slate correctly

## 1.0.0

### Major Changes

- [b6a9f6b9](https://github.com/keystonejs/keystone-5/commit/b6a9f6b9):

  Extract `Content` field into its own package: `@keystone-alpha/field-content`.
