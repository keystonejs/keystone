# @keystone-next/keystone

## 4.0.0

### Major Changes

- [`c60b229ec`](https://github.com/keystonejs/keystone/commit/c60b229ec38b4845ac606ee83b9787a97834baf3) [#4299](https://github.com/keystonejs/keystone/pull/4299) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `createKeystone` to `createSystem` to make it consistent with the type names.

* [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882) [#4269](https://github.com/keystonejs/keystone/pull/4269) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `keystone` argument of `KeystoneAdminUIConfig.getAdditionalFiles()` and `KeystoneAdminUIConfig.pageMiddleware()` to `system`.
  Renamed `keystone` argument of `SessionStrategy.start`, `SessionStrategy.end` and `SessionStrategy.get` to `system`.

### Minor Changes

- [`c858a05fe`](https://github.com/keystonejs/keystone/commit/c858a05fee6dc3ed3d80db9fdf50944217bee072) [#4246](https://github.com/keystonejs/keystone/pull/4246) Thanks [@timleslie](https://github.com/timleslie)! - Added `executeGraphQL` and `gqlNames` to the `context` object. This provides the compatibility required to use `@keystonejs/server-side-graphql-client` in projects using the new interfaces.

### Patch Changes

- [`96a1d5226`](https://github.com/keystonejs/keystone/commit/96a1d52263db625cd117ab85cb6a4a5c3888fdca) [#4286](https://github.com/keystonejs/keystone/pull/4286) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed behaviour in withItemData when session listKey and itemId aren't valid

* [`11777cddb`](https://github.com/keystonejs/keystone/commit/11777cddba45b28a9e17a3149b792db121322b46) [#4263](https://github.com/keystonejs/keystone/pull/4263) Thanks [@timleslie](https://github.com/timleslie)! - Renamed the type `Keystone` to `KeystoneSystem` to avoid confusion with the core `Keystone` class.

- [`5866cb81f`](https://github.com/keystonejs/keystone/commit/5866cb81fd462b86851deb0a88e5034f1934ac84) [#4268](https://github.com/keystonejs/keystone/pull/4268) Thanks [@timleslie](https://github.com/timleslie)! - Refactored `createKeystone` to isolate admin UI related setup.

* [`d1ea5e667`](https://github.com/keystonejs/keystone/commit/d1ea5e66750175e907f41a58c15fce86a4b4ea77) [#4264](https://github.com/keystonejs/keystone/pull/4264) Thanks [@timleslie](https://github.com/timleslie)! - Factored out a `_createKeystone` function to allow for backwards compatibility.

- [`9fddeee41`](https://github.com/keystonejs/keystone/commit/9fddeee41b7e0dbb3854e5ce6abea4cdeeaa81d0) [#4300](https://github.com/keystonejs/keystone/pull/4300) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused `connect()` and `disconnect()` functions from the object returned by `implementSession()`.

* [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882) [#4269](https://github.com/keystonejs/keystone/pull/4269) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `keystone` argument of `writeAdminFiles()` to `system`.

* Updated dependencies [[`11777cddb`](https://github.com/keystonejs/keystone/commit/11777cddba45b28a9e17a3149b792db121322b46), [`cbf11a69b`](https://github.com/keystonejs/keystone/commit/cbf11a69b8f2c428e2c0a08dd568b3bc0e0d80f4), [`81a140ee3`](https://github.com/keystonejs/keystone/commit/81a140ee3badc9c032ab02a233a21d011278e173), [`b2de22941`](https://github.com/keystonejs/keystone/commit/b2de229419cc93b69ee4027c387cab9c8d701488), [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882), [`60e061246`](https://github.com/keystonejs/keystone/commit/60e061246bc35b76031f43ff6c07446fe6ad3c6b), [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882)]:
  - @keystone-next/admin-ui@3.0.0
  - @keystone-next/types@4.0.0
  - @keystone-next/fields@3.0.1

## 3.0.0

### Major Changes

- [`98dd7dcff`](https://github.com/keystonejs/keystone/commit/98dd7dcffa797eb40eb1713ba1ac2697dfef95e3) [#4200](https://github.com/keystonejs/keystone/pull/4200) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Renamed CRUD API to Items API and changed property on context from `crud` to `lists`

* [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c) [#4238](https://github.com/keystonejs/keystone/pull/4238) Thanks [@timleslie](https://github.com/timleslie)! - Uses the new `field.getBackingTypes()` method on core field objects to generate types.

### Minor Changes

- [`d2cfd6106`](https://github.com/keystonejs/keystone/commit/d2cfd6106b44b13254ff1e18601ef943c4211faf) [#4183](https://github.com/keystonejs/keystone/pull/4183) Thanks [@JedWatson](https://github.com/JedWatson)! - Always load the session item in withItemData. The second argument to `withItemData` is now optional.

* [`d02957453`](https://github.com/keystonejs/keystone/commit/d029574533c179fa53f65c0e0ba3812dab2ba4ad) [#4239](https://github.com/keystonejs/keystone/pull/4239) Thanks [@timleslie](https://github.com/timleslie)! - Added support for `config.db.onConnect` in the new APIs. This is passed through as `Keystone{ onConnect }` to the core object.

- [`8f4ebd5f7`](https://github.com/keystonejs/keystone/commit/8f4ebd5f70251ccdfb6b5ce14efb9fb59f5d2b3d) [#4201](https://github.com/keystonejs/keystone/pull/4201) Thanks [@JedWatson](https://github.com/JedWatson)! - New internal graphql api

* [`b89377c9c`](https://github.com/keystonejs/keystone/commit/b89377c9c668c6a4b1be742a177cfb50568d48bf) [#4230](https://github.com/keystonejs/keystone/pull/4230) Thanks [@JedWatson](https://github.com/JedWatson)! - Add Cross-Origin Resource Support to the dev server

### Patch Changes

- [`98e8fd4bc`](https://github.com/keystonejs/keystone/commit/98e8fd4bc586c732d629328ef643014ce42442ed) [#4212](https://github.com/keystonejs/keystone/pull/4212) Thanks [@JedWatson](https://github.com/JedWatson)! - Rename KeystoneItemAPI to KeystoneListsAPI

* [`bc198775e`](https://github.com/keystonejs/keystone/commit/bc198775ed27d356017b4a0c6aadeba47e37ce2e) [#4241](https://github.com/keystonejs/keystone/pull/4241) Thanks [@JedWatson](https://github.com/JedWatson)! - Expanded the defaults for labelField to include "label" and "title"

- [`b9e93cb66`](https://github.com/keystonejs/keystone/commit/b9e93cb66e8559858ecfbfee3244a761f821b9ec) [#4236](https://github.com/keystonejs/keystone/pull/4236) Thanks [@timleslie](https://github.com/timleslie)! - Removed unnecessary intermediate functions from initialisation step.

* [`9928da13e`](https://github.com/keystonejs/keystone/commit/9928da13ecca03fed560a42e1071afc59c0feb3b) [#4242](https://github.com/keystonejs/keystone/pull/4242) Thanks [@timleslie](https://github.com/timleslie)! - Removed `name` field from `KeystoneConfig` type, as it doesn't actually do anything.

- [`dce39ca1b`](https://github.com/keystonejs/keystone/commit/dce39ca1be682647b05a2b59710f05e421b140a1) [#4235](https://github.com/keystonejs/keystone/pull/4235) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused utils code and applied internal cosmetic changes.

- Updated dependencies [[`fd4b0d04c`](https://github.com/keystonejs/keystone/commit/fd4b0d04cd9ab8ba12653f1e64fdf08d8cb0c4db), [`c103cde7d`](https://github.com/keystonejs/keystone/commit/c103cde7da198cd7e9adefa763c51e433680e800), [`84e651c3f`](https://github.com/keystonejs/keystone/commit/84e651c3f08fdfc11628490c9d55229dc360f52a), [`98e8fd4bc`](https://github.com/keystonejs/keystone/commit/98e8fd4bc586c732d629328ef643014ce42442ed), [`d02957453`](https://github.com/keystonejs/keystone/commit/d029574533c179fa53f65c0e0ba3812dab2ba4ad), [`549a9a06d`](https://github.com/keystonejs/keystone/commit/549a9a06d9dbeb514aad724ece603a3fa7fc8cb6), [`400a6e50c`](https://github.com/keystonejs/keystone/commit/400a6e50cba643f4b142858bb1cac83a50ab020d), [`302afe226`](https://github.com/keystonejs/keystone/commit/302afe226162452c91d9e2f11f5c29552df70c6a), [`98dd7dcff`](https://github.com/keystonejs/keystone/commit/98dd7dcffa797eb40eb1713ba1ac2697dfef95e3), [`7afde2fb5`](https://github.com/keystonejs/keystone/commit/7afde2fb516e1d3824d73a96308abb4a6b022400), [`8291187de`](https://github.com/keystonejs/keystone/commit/8291187de347784f21e4d856ed1eefbc5b8a103b), [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c), [`36cf9b0a9`](https://github.com/keystonejs/keystone/commit/36cf9b0a9f6c9c2cd3c823146135f86d4152718b), [`6eb4def9a`](https://github.com/keystonejs/keystone/commit/6eb4def9a1be293872e59bcf6472866c0981b45f), [`8f4ebd5f7`](https://github.com/keystonejs/keystone/commit/8f4ebd5f70251ccdfb6b5ce14efb9fb59f5d2b3d), [`2a2a7c00b`](https://github.com/keystonejs/keystone/commit/2a2a7c00b74028b758006219781cbbd22909be85), [`8e77254a2`](https://github.com/keystonejs/keystone/commit/8e77254a262a4c892263e30044803b463750c3e9), [`28e2b43d4`](https://github.com/keystonejs/keystone/commit/28e2b43d4a5a4624b3ad6683e5f4f0116a5971f4), [`b9e643dc6`](https://github.com/keystonejs/keystone/commit/b9e643dc6c66f75bc6d5b6ced74d91ba3ee7533d), [`cfa0d8275`](https://github.com/keystonejs/keystone/commit/cfa0d8275c89f09b89643c801b208161348b4f65), [`9928da13e`](https://github.com/keystonejs/keystone/commit/9928da13ecca03fed560a42e1071afc59c0feb3b), [`0e65409c7`](https://github.com/keystonejs/keystone/commit/0e65409c7416d285fdc4f9da4a7dfb0f652c6cb2)]:
  - @keystone-next/fields@3.0.0
  - @keystone-next/admin-ui@2.0.2
  - @keystone-next/types@3.0.0

## 2.0.0

### Major Changes

- [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797) [#4132](https://github.com/keystonejs/keystone/pull/4132) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add CardValue export from field views

### Patch Changes

- [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec) [#4138](https://github.com/keystonejs/keystone/pull/4138) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Handle non-builtin GraphQL scalar types when generating types

- Updated dependencies [[`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`71b74161d`](https://github.com/keystonejs/keystone/commit/71b74161dfc9d7f0b918a3451cf545935afce94d), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`f3c0f79e3`](https://github.com/keystonejs/keystone/commit/f3c0f79e3005aa6a8e867efef4431b83bbdf9898), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797)]:
  - @keystone-next/types@2.0.0
  - @keystone-next/fields@2.0.0
  - @keystone-next/admin-ui@2.0.0

## 1.0.0

### Major Changes

- [`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c) [#4106](https://github.com/keystonejs/keystone/pull/4106) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release

### Patch Changes

- Updated dependencies [[`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c), [`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da), [`3dd5c570a`](https://github.com/keystonejs/keystone/commit/3dd5c570a27d0795a689407d96fc9623c90a66df)]:
  - @keystone-next/admin-ui@1.0.0
  - @keystone-next/fields@1.0.0
  - @keystone-next/types@1.0.0
  - @keystonejs/adapter-mongoose@10.0.1
  - @keystonejs/keystone@17.1.1
