# @keystonejs/fields-unsplash

## 2.1.0

### Minor Changes

- [`69d627813`](https://github.com/keystonejs/keystone/commit/69d627813adfc10d29707f5c882ca15621de12a5) [#3501](https://github.com/keystonejs/keystone/pull/3501) Thanks [@singhArmani](https://github.com/singhArmani)! - Removed unsupported filters for `File`, `CloudinaryImage`, `LocationGoogle`, `Unsplash`, and `OEmbed` field types.

### Patch Changes

- [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e) [#3477](https://github.com/keystonejs/keystone/pull/3477) Thanks [@Noviny](https://github.com/Noviny)! - Updating dependencies:

  These changes bring the keystone dev experience inline with installing keystone from npm :D

* [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc) [#3438](https://github.com/keystonejs/keystone/pull/3438) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Apollo GraphQL package dependencies.

- [`483b20ec5`](https://github.com/keystonejs/keystone/commit/483b20ec53ff89f1d026c0495fdae5df60a7cf59) [#3487](https://github.com/keystonejs/keystone/pull/3487) Thanks [@singhArmani](https://github.com/singhArmani)! - Updated CRUD API tests for field types.

* [`febe9701e`](https://github.com/keystonejs/keystone/commit/febe9701e4715680817dd8172954c006fab70681) [#3473](https://github.com/keystonejs/keystone/pull/3473) Thanks [@singhArmani](https://github.com/singhArmani)! - Added `filter` and `isRequired` API tests for `Unsplash` field type.

* Updated dependencies [[`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6), [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e), [`ac44568f9`](https://github.com/keystonejs/keystone/commit/ac44568f91fd54ccbc39accf83bcfb3276ce1a72), [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc), [`483b20ec5`](https://github.com/keystonejs/keystone/commit/483b20ec53ff89f1d026c0495fdae5df60a7cf59), [`0fc878fa9`](https://github.com/keystonejs/keystone/commit/0fc878fa918c3196196f943f195ffaa62fce504b), [`ea367f759`](https://github.com/keystonejs/keystone/commit/ea367f7594f47efc3528d9917cce010b3a16bf4d), [`69d627813`](https://github.com/keystonejs/keystone/commit/69d627813adfc10d29707f5c882ca15621de12a5), [`096d13fc2`](https://github.com/keystonejs/keystone/commit/096d13fc25696ed1769cf817b705dfd80da601b2), [`0153168d7`](https://github.com/keystonejs/keystone/commit/0153168d73ce8cd7ede4eb9c8518e5e2bf859709)]:
  - @keystonejs/adapter-knex@11.0.3
  - @keystonejs/adapter-mongoose@9.0.4
  - @keystonejs/fields@17.1.0
  - @arch-ui/fields@3.0.4
  - @arch-ui/input@0.1.11
  - @keystonejs/fields-content@8.0.2

## 2.0.0

### Major Changes

- [`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593) [#3394](https://github.com/keystonejs/keystone/pull/3394) Thanks [@timleslie](https://github.com/timleslie)! - Converted `Field` getters `.gqlUpdateInputFields` and `.gqlCreateInputFields` into methods, `.gqlUpdateInputFields({ schemaName })` and `...gqlCreateInputFields({ schemaName })`.

### Patch Changes

- Updated dependencies [[`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593), [`e8b2e4772`](https://github.com/keystonejs/keystone/commit/e8b2e477206acffb143f19fb14be1e3b4cd0eb91)]:
  - @keystonejs/fields@17.0.0
  - @keystonejs/adapter-knex@11.0.2
  - @keystonejs/adapter-mongoose@9.0.3
  - @keystonejs/fields-content@8.0.1

## 1.0.0

### Major Changes

- [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25) [#3280](https://github.com/keystonejs/keystone/pull/3280) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Initial release

### Patch Changes

- Updated dependencies [[`d38a41f25`](https://github.com/keystonejs/keystone/commit/d38a41f25a1b4c90c05d2fb85116dc385d4ee77a), [`5ede731fc`](https://github.com/keystonejs/keystone/commit/5ede731fc58a79e7322b852bdd2d971ece45281e), [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25), [`694f3acfb`](https://github.com/keystonejs/keystone/commit/694f3acfb9faa78aebfcf48cf711165560f16ff7), [`149d6fd6f`](https://github.com/keystonejs/keystone/commit/149d6fd6ff057c17570346063c173376769dcc79), [`e44102e9f`](https://github.com/keystonejs/keystone/commit/e44102e9f7f770b1528d642d763ccf9f88f3cbb1)]:
  - @keystonejs/fields@16.0.0
  - @keystonejs/fields-content@8.0.0
