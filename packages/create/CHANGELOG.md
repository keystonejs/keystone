# create-keystone-app

## 0.0.0-rc-20260714031626

### Major Changes

- [#9253](https://github.com/keystonejs/keystone/pull/9253) [`b7d0f1b`](https://github.com/keystonejs/keystone/commit/b7d0f1bc01764df7f92ca07289cbba30ad1b467f) Thanks [@dcousens](https://github.com/dcousens)! - Updates the `keystone-app` configuration to the newest major version

### Minor Changes

- [#9872](https://github.com/keystonejs/keystone/pull/9872) [`47dd49a`](https://github.com/keystonejs/keystone/commit/47dd49a24de5c0a4e9ee497f32c01fef1de14d68) Thanks [@emmatown](https://github.com/emmatown)! - Adopt Prisma 7's Rust-free client generator and require applications to provide their Prisma driver adapter through `db.prismaClientOptions`. Move Prisma CLI datasource and schema settings into the `prisma.config.ts`, generate clients outside `node_modules`, and bundle the generated client with the built Keystone config.

## 10.0.3

### Patch Changes

- [#9391](https://github.com/keystonejs/keystone/pull/9391) [`e937bad`](https://github.com/keystonejs/keystone/commit/e937bad31368163f2b7ea2e031a35d305c5feeec) Thanks [@dcousens](https://github.com/dcousens)! - Fix output formatting for CLI instructions

## 10.0.2

### Patch Changes

- [#9314](https://github.com/keystonejs/keystone/pull/9314) [`616907e`](https://github.com/keystonejs/keystone/commit/616907ec9066110e6f15aea689e954a668c7a7f2) Thanks [@dcousens](https://github.com/dcousens)! - Fix starter script error when looking for pre-built schemas

## 10.0.1

### Patch Changes

- [#9275](https://github.com/keystonejs/keystone/pull/9275) [`855bc25`](https://github.com/keystonejs/keystone/commit/855bc256e2fb5174deedb9b409514cfe4a33ebab) Thanks [@dcousens](https://github.com/dcousens)! - Update generated schemas

## 10.0.0

### Major Changes

- [`7c3db4c`](https://github.com/keystonejs/keystone/commit/7c3db4c8ec8d2838ae902c07131e1f2a51372605) Thanks [@iamandrewluca](https://github.com/iamandrewluca)! - Adds support for `npm_config_user_agent` for determining your package manager
