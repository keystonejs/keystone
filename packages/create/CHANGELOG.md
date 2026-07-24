# create-keystone-app

## 0.0.0-rc-20260724052901

### Major Changes

- [#9942](https://github.com/keystonejs/keystone/pull/9942) [`74ef343`](https://github.com/keystonejs/keystone/commit/74ef3431af5d30ea94c1dfda5f1012ca25d9a4dc) Thanks [@emmatown](https://github.com/emmatown)! - Removes auto-install, use your preferred package manager to install dependencies instead

- [#9253](https://github.com/keystonejs/keystone/pull/9253) [`b7d0f1b`](https://github.com/keystonejs/keystone/commit/b7d0f1bc01764df7f92ca07289cbba30ad1b467f) Thanks [@dcousens](https://github.com/dcousens)! - Updates the `keystone-app` configuration to the newest major version

- [#9929](https://github.com/keystonejs/keystone/pull/9929) [`da080b7`](https://github.com/keystonejs/keystone/commit/da080b7e6f8c65839f0723f7045a21a71cbfb099) Thanks [@emmatown](https://github.com/emmatown)! - Changes package to exclusively Node ESM. This is intended to be used by `require(esm)` and should not affect consumers beyond requiring a modern Node version. `keystone build` outputs are still CommonJS.

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
