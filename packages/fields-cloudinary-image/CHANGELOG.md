# @keystonejs/fields-cloudinary-image

## 2.1.3

### Patch Changes

- Updated dependencies [[`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf), [`680169cad`](https://github.com/keystonejs/keystone/commit/680169cad62dd889ec95961cba9df3b4d012887f), [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d)]:
  - @keystonejs/fields@21.1.0
  - @keystonejs/adapter-knex@13.0.0
  - @keystonejs/adapter-mongoose@11.0.0

## 2.1.2

### Patch Changes

- [`88776915a`](https://github.com/keystonejs/keystone/commit/88776915af1b795b54c14a1187eee9a1e3b0ea80) [#4699](https://github.com/keystonejs/keystone/pull/4699) Thanks [@timleslie](https://github.com/timleslie)! - Updated auxillary list name to be compatible with the Prisma adapter requirements.

- Updated dependencies []:
  - @keystonejs/fields@21.0.2

## 2.1.1

### Patch Changes

- Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0), [`d329f07a5`](https://github.com/keystonejs/keystone/commit/d329f07a5ce7ebf5d658a7f90334ba4372a2a72d)]:
  - @keystonejs/adapter-mongoose@10.1.0
  - @keystonejs/fields@21.0.0
  - @keystonejs/fields-content@9.0.4

## 2.1.0

### Minor Changes

- [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c) [#4238](https://github.com/keystonejs/keystone/pull/4238) Thanks [@timleslie](https://github.com/timleslie)! - Added a `.getBackingTypes()` method to all `Field` implementations, which returns `{ path: { optional, type } }`. This method will be used to generate typescript types in our upcoming [new interfaces](https://www.keystonejs.com/blog/roadmap-update).

### Patch Changes

- Updated dependencies [[`7afde2fb5`](https://github.com/keystonejs/keystone/commit/7afde2fb516e1d3824d73a96308abb4a6b022400), [`5216e9dc6`](https://github.com/keystonejs/keystone/commit/5216e9dc6894c1a6e81765c0278dc6f7c4cc617b), [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c)]:
  - @keystonejs/fields@20.1.0

## 2.0.2

### Patch Changes

- Updated dependencies [[`a5e40e6c4`](https://github.com/keystonejs/keystone/commit/a5e40e6c4af1ab38cc2079a0f6e27d39d6b7d546), [`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da)]:
  - @keystonejs/fields@20.0.0
  - @keystonejs/adapter-mongoose@10.0.1
  - @keystonejs/fields-content@9.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [[`5dfa1b8c5`](https://github.com/keystonejs/keystone/commit/5dfa1b8c50b6eb5cc77eb9e28b637db45580e99f), [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74), [`5dfa1b8c5`](https://github.com/keystonejs/keystone/commit/5dfa1b8c50b6eb5cc77eb9e28b637db45580e99f), [`85fa68456`](https://github.com/keystonejs/keystone/commit/85fa684565d8c9c40036d4544b3c0235dbbd327b), [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74)]:
  - @keystonejs/fields-content@9.0.1
  - @keystonejs/adapter-knex@12.0.0
  - @keystonejs/adapter-mongoose@10.0.0
  - @keystonejs/fields@19.0.0

## 2.0.0

### Major Changes

- [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4) [#3298](https://github.com/keystonejs/keystone/pull/3298) Thanks [@timleslie](https://github.com/timleslie)! - Added support for a Prisma adapter to Keystone.

### Patch Changes

- Updated dependencies [[`8c54a34be`](https://github.com/keystonejs/keystone/commit/8c54a34bec0f5f945447a2475f5500415eb154df), [`a02e69987`](https://github.com/keystonejs/keystone/commit/a02e69987902cfde38d820e68cb24b7a20ca1f6f), [`966b5bc70`](https://github.com/keystonejs/keystone/commit/966b5bc7003e0f580528c4dcd46647cc4124b592), [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4), [`3e2ca3a2f`](https://github.com/keystonejs/keystone/commit/3e2ca3a2ffa00cb5aababee572902a78e657ec58), [`bf5801070`](https://github.com/keystonejs/keystone/commit/bf5801070568bbcc1ed4f3394a293bfa5bea8b98), [`cc56990f2`](https://github.com/keystonejs/keystone/commit/cc56990f2e9a4ecf0c112362e8d472b9286f76bc)]:
  - @keystonejs/adapter-knex@11.0.7
  - @keystonejs/fields@18.0.0
  - @keystonejs/adapter-mongoose@9.0.8
  - @keystonejs/fields-content@9.0.0

## 1.0.6

### Patch Changes

- [`95d05dd13`](https://github.com/keystonejs/keystone/commit/95d05dd1328e397b45c69723ce037d174595881d) [#3657](https://github.com/keystonejs/keystone/pull/3657) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `query-string` to `^6.13.2`.

* [`16f271f5f`](https://github.com/keystonejs/keystone/commit/16f271f5fdfc697fb8f9760922626e313ce25971) [#3693](https://github.com/keystonejs/keystone/pull/3693) Thanks [@timleslie](https://github.com/timleslie)! - Removed dependency on `pluralize`.

- [`b6e160678`](https://github.com/keystonejs/keystone/commit/b6e160678b449707261a54a9d565b91663784831) [#3671](https://github.com/keystonejs/keystone/pull/3671) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@primer/octicons-react` to `^11.0.0`.

* [`7d17e861c`](https://github.com/keystonejs/keystone/commit/7d17e861cb3f3a820889ff7c925db1aa875ef473) [#3696](https://github.com/keystonejs/keystone/pull/3696) Thanks [@timleslie](https://github.com/timleslie)! - Disabled APi tests.

* Updated dependencies [[`b32f006ad`](https://github.com/keystonejs/keystone/commit/b32f006ad283f8aa1911f55bbecac9942f3f9f25), [`6f42b0a9d`](https://github.com/keystonejs/keystone/commit/6f42b0a9d231049f9e7523eb78ec621d9c9d6df9), [`06dffc42b`](https://github.com/keystonejs/keystone/commit/06dffc42b08062e3166880146c8fb606493ead12), [`27783bbca`](https://github.com/keystonejs/keystone/commit/27783bbca3b1c5ff05402738c14ffa8db73e542b), [`7a1f8bbdc`](https://github.com/keystonejs/keystone/commit/7a1f8bbdcdf68c9579e17db77fa826e811abcab4), [`6f42b0a9d`](https://github.com/keystonejs/keystone/commit/6f42b0a9d231049f9e7523eb78ec621d9c9d6df9), [`5c1e55721`](https://github.com/keystonejs/keystone/commit/5c1e5572134fa93c9aefbb537676e30cafd0e7d9), [`304701d7c`](https://github.com/keystonejs/keystone/commit/304701d7c23e98c8dc40c0f3f5512a0370107c06), [`aa5b4aa26`](https://github.com/keystonejs/keystone/commit/aa5b4aa269eebc6931d30f6eddc315805c1f4fef), [`b6e160678`](https://github.com/keystonejs/keystone/commit/b6e160678b449707261a54a9d565b91663784831), [`7956d5da0`](https://github.com/keystonejs/keystone/commit/7956d5da00197dc11f5d54f7870b8fa72c05a3c0)]:
  - @keystonejs/fields@17.1.3
  - @keystonejs/adapter-mongoose@9.0.7
  - @arch-ui/button@0.0.22
  - @keystonejs/fields-content@8.0.5
  - @arch-ui/fields@3.0.5
  - @keystonejs/adapter-knex@11.0.6

## 1.0.5

### Patch Changes

- [`dd49d2c04`](https://github.com/keystonejs/keystone/commit/dd49d2c040ea8fb8dfc36d2e556be88ca1b74b15) [#3606](https://github.com/keystonejs/keystone/pull/3606) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused dependencies.

- Updated dependencies [[`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a), [`dd49d2c04`](https://github.com/keystonejs/keystone/commit/dd49d2c040ea8fb8dfc36d2e556be88ca1b74b15), [`8bd44758a`](https://github.com/keystonejs/keystone/commit/8bd44758ac742c95f42151c9fbc16700b698e8e4), [`9dae7a5d0`](https://github.com/keystonejs/keystone/commit/9dae7a5d00a62cd0b7a4470695adc5e1678db3dc), [`bbd6d328f`](https://github.com/keystonejs/keystone/commit/bbd6d328fdc4299acd3f2d2f58b12b4ceca9c8e6), [`fe054e53e`](https://github.com/keystonejs/keystone/commit/fe054e53e71f13a69af1d6dd2a1cd8c68bb31059)]:
  - @keystonejs/adapter-knex@11.0.5
  - @keystonejs/fields-content@8.0.4
  - @keystonejs/fields@17.1.2
  - @keystonejs/adapter-mongoose@9.0.6

## 1.0.4

### Patch Changes

- [`6c97a5534`](https://github.com/keystonejs/keystone/commit/6c97a5534e8a18d15aeac8b0471810fdd4d04f80) [#3577](https://github.com/keystonejs/keystone/pull/3577) Thanks [@timleslie](https://github.com/timleslie)! - Updated test framework to support more detailed field tests.

* [`34fcc7052`](https://github.com/keystonejs/keystone/commit/34fcc7052a24db61f1f2f12c46110c060934f4ca) [#3531](https://github.com/keystonejs/keystone/pull/3531) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `slate-react` to `^0.22.10`.

- [`e62b3308b`](https://github.com/keystonejs/keystone/commit/e62b3308bd841b5f58ac9fa1f84707f9187fda6b) [#3524](https://github.com/keystonejs/keystone/pull/3524) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `node-fetch` to `^2.6.0`.

* [`7036585f2`](https://github.com/keystonejs/keystone/commit/7036585f25c3b690b7a6fd04c39b5b781ff5bcd9) [#3530](https://github.com/keystonejs/keystone/pull/3530) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `slate` to `^0.47.9`.

- [`2e6a06202`](https://github.com/keystonejs/keystone/commit/2e6a06202299b36c36fd3efd895f2280479eac31) [#3532](https://github.com/keystonejs/keystone/pull/3532) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated filter tests across all field types.
  Fixed errors with filtering by `null` in the `Decimal`, `MongoId` and `Uuid` field types.

* [`518718e19`](https://github.com/keystonejs/keystone/commit/518718e197d0a2d723c8e184552ddd5d8e165f12) [#3586](https://github.com/keystonejs/keystone/pull/3586) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `graphql-upload` to `11.0.0`.

- [`5e5ba0b86`](https://github.com/keystonejs/keystone/commit/5e5ba0b869924826adf640e6b1eb1608101e8a8e) [#3553](https://github.com/keystonejs/keystone/pull/3553) Thanks [@singhArmani](https://github.com/singhArmani)! - Added `filter`, `isRequired` and CRUD tests for `CloudinaryImage` field type.

- Updated dependencies [[`cd15192cd`](https://github.com/keystonejs/keystone/commit/cd15192cdae5e476f64a257c196ca569a9440d5a), [`e9bc4367a`](https://github.com/keystonejs/keystone/commit/e9bc4367ac31f3fe3a2898198c600c76c42165b2), [`d500613d8`](https://github.com/keystonejs/keystone/commit/d500613d8917e3cbcea2817501d607eddd3b1a8d), [`6c97a5534`](https://github.com/keystonejs/keystone/commit/6c97a5534e8a18d15aeac8b0471810fdd4d04f80), [`34fcc7052`](https://github.com/keystonejs/keystone/commit/34fcc7052a24db61f1f2f12c46110c060934f4ca), [`c3488c5e8`](https://github.com/keystonejs/keystone/commit/c3488c5e88628b15eb9fe804551c3c5c44c07e0f), [`e62b3308b`](https://github.com/keystonejs/keystone/commit/e62b3308bd841b5f58ac9fa1f84707f9187fda6b), [`7036585f2`](https://github.com/keystonejs/keystone/commit/7036585f25c3b690b7a6fd04c39b5b781ff5bcd9), [`2e6a06202`](https://github.com/keystonejs/keystone/commit/2e6a06202299b36c36fd3efd895f2280479eac31), [`003b856e6`](https://github.com/keystonejs/keystone/commit/003b856e686cc1ee0f984c1acf024c1fa0c27837), [`a42ee3a30`](https://github.com/keystonejs/keystone/commit/a42ee3a306c899a7ae46909fe132522cbeff7812), [`438051442`](https://github.com/keystonejs/keystone/commit/4380514421020f4418a9f966c9fec60e014478b9), [`b3aa85031`](https://github.com/keystonejs/keystone/commit/b3aa850311cbc1622568f69f9cb4b9f46ab9db22), [`518718e19`](https://github.com/keystonejs/keystone/commit/518718e197d0a2d723c8e184552ddd5d8e165f12), [`16fba3b98`](https://github.com/keystonejs/keystone/commit/16fba3b98271410e570a370f610da7cd0686f294), [`28b88abd3`](https://github.com/keystonejs/keystone/commit/28b88abd369f0df12eae72107db7c24323eda4b5)]:
  - @keystonejs/fields@17.1.1
  - @keystonejs/adapter-knex@11.0.4
  - @keystonejs/fields-content@8.0.3
  - @keystonejs/adapter-mongoose@9.0.5

## 1.0.3

### Patch Changes

- [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e) [#3477](https://github.com/keystonejs/keystone/pull/3477) Thanks [@Noviny](https://github.com/Noviny)! - Updating dependencies:

  These changes bring the keystone dev experience inline with installing keystone from npm :D

* [`483b20ec5`](https://github.com/keystonejs/keystone/commit/483b20ec53ff89f1d026c0495fdae5df60a7cf59) [#3487](https://github.com/keystonejs/keystone/pull/3487) Thanks [@singhArmani](https://github.com/singhArmani)! - Updated CRUD API tests for field types.

* Updated dependencies [[`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6), [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e), [`ac44568f9`](https://github.com/keystonejs/keystone/commit/ac44568f91fd54ccbc39accf83bcfb3276ce1a72), [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc), [`483b20ec5`](https://github.com/keystonejs/keystone/commit/483b20ec53ff89f1d026c0495fdae5df60a7cf59), [`0fc878fa9`](https://github.com/keystonejs/keystone/commit/0fc878fa918c3196196f943f195ffaa62fce504b), [`ea367f759`](https://github.com/keystonejs/keystone/commit/ea367f7594f47efc3528d9917cce010b3a16bf4d), [`69d627813`](https://github.com/keystonejs/keystone/commit/69d627813adfc10d29707f5c882ca15621de12a5), [`096d13fc2`](https://github.com/keystonejs/keystone/commit/096d13fc25696ed1769cf817b705dfd80da601b2), [`0153168d7`](https://github.com/keystonejs/keystone/commit/0153168d73ce8cd7ede4eb9c8518e5e2bf859709)]:
  - @keystonejs/adapter-knex@11.0.3
  - @keystonejs/adapter-mongoose@9.0.4
  - @keystonejs/fields@17.1.0
  - @arch-ui/button@0.0.21
  - @arch-ui/fields@3.0.4
  - @arch-ui/input@0.1.11
  - @arch-ui/layout@0.2.14
  - @arch-ui/lozenge@0.0.17
  - @keystonejs/fields-content@8.0.2
  - @arch-ui/theme@0.0.11

## 1.0.2

### Patch Changes

- Updated dependencies [[`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593), [`e8b2e4772`](https://github.com/keystonejs/keystone/commit/e8b2e477206acffb143f19fb14be1e3b4cd0eb91)]:
  - @keystonejs/fields@17.0.0
  - @keystonejs/adapter-knex@11.0.2
  - @keystonejs/adapter-mongoose@9.0.3
  - @keystonejs/fields-content@8.0.1

## 1.0.1

### Patch Changes

- [`47c613a3d`](https://github.com/keystonejs/keystone/commit/47c613a3dc6fee4b0100fc9c995319bbaca70eab) [#3361](https://github.com/keystonejs/keystone/pull/3361) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `fields-cloudinary-image` views not being compiled.

## 1.0.0

### Major Changes

- [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25) [#3280](https://github.com/keystonejs/keystone/pull/3280) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Initial release

### Patch Changes

- Updated dependencies [[`d38a41f25`](https://github.com/keystonejs/keystone/commit/d38a41f25a1b4c90c05d2fb85116dc385d4ee77a), [`5ede731fc`](https://github.com/keystonejs/keystone/commit/5ede731fc58a79e7322b852bdd2d971ece45281e), [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25), [`694f3acfb`](https://github.com/keystonejs/keystone/commit/694f3acfb9faa78aebfcf48cf711165560f16ff7), [`149d6fd6f`](https://github.com/keystonejs/keystone/commit/149d6fd6ff057c17570346063c173376769dcc79), [`e44102e9f`](https://github.com/keystonejs/keystone/commit/e44102e9f7f770b1528d642d763ccf9f88f3cbb1)]:
  - @keystonejs/fields@16.0.0
  - @keystonejs/fields-content@8.0.0
