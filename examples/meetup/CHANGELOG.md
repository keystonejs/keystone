# @keystonejs/demo-project-meetup

## 6.2.13

### Patch Changes

- [`75d3c521e`](https://github.com/keystonejs/keystone/commit/75d3c521e4f1f0a1eec9bc91319839a2afc000e0) [#4770](https://github.com/keystonejs/keystone/pull/4770) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded Next.js dependency to `10.0.5`.

- Updated dependencies [[`75d3c521e`](https://github.com/keystonejs/keystone/commit/75d3c521e4f1f0a1eec9bc91319839a2afc000e0)]:
  - @keystonejs/app-next@6.0.0

## 6.2.12

### Patch Changes

- [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9) [#3222](https://github.com/keystonejs/keystone/pull/3222) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for multiple database adapters in a single `Keystone` system. The `adapters` and `defaultAdapter` config options were removed from the `Keystone()` constructor. If you were accessing the adapter object via `keystone.adapters.KnexAdapter` or `keystone.adapters.MongooseAdapter` you should now simply access `keystone.adapter`.

- Updated dependencies [[`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf), [`680169cad`](https://github.com/keystonejs/keystone/commit/680169cad62dd889ec95961cba9df3b4d012887f), [`621db113a`](https://github.com/keystonejs/keystone/commit/621db113a6a579cc3da19ae9cef50dc63ac8ca55), [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d), [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9)]:
  - @keystonejs/fields@21.1.0
  - @keystonejs/session@8.2.0
  - @keystonejs/adapter-mongoose@11.0.0
  - @keystonejs/keystone@19.0.0
  - @keystonejs/fields-cloudinary-image@2.1.3

## 6.2.11

### Patch Changes

- [`0dfb63414`](https://github.com/keystonejs/keystone/commit/0dfb6341412c3c7ae60f069d37fa96e0c9adc900) [#4304](https://github.com/keystonejs/keystone/pull/4304) Thanks [@timleslie](https://github.com/timleslie)! - Updated `protectIdenties` from the default `false` to `process.env.NODE_ENV === 'production'`, to provide a better balance of protection and convenience.

- Updated dependencies [[`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95), [`cf2819544`](https://github.com/keystonejs/keystone/commit/cf2819544426def260ada5eb18fdc9b8a01e9438), [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95), [`0dfb63414`](https://github.com/keystonejs/keystone/commit/0dfb6341412c3c7ae60f069d37fa96e0c9adc900)]:
  - @keystonejs/keystone@18.0.0
  - @keystonejs/app-graphql@6.2.0
  - @keystonejs/adapter-mongoose@10.1.1
  - @keystonejs/auth-password@6.0.0

## 6.2.10

### Patch Changes

- Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0), [`f8873064b`](https://github.com/keystonejs/keystone/commit/f8873064b667d62001afe7950e33d019bcff7be3), [`d329f07a5`](https://github.com/keystonejs/keystone/commit/d329f07a5ce7ebf5d658a7f90334ba4372a2a72d)]:
  - @keystonejs/adapter-mongoose@10.1.0
  - @keystonejs/fields@21.0.0
  - @keystonejs/app-admin-ui@7.3.12
  - @keystonejs/auth-password@5.1.18
  - @keystonejs/fields-cloudinary-image@2.1.1
  - @keystonejs/fields-wysiwyg-tinymce@5.3.15

## 6.2.9

### Patch Changes

- Updated dependencies [[`a5e40e6c4`](https://github.com/keystonejs/keystone/commit/a5e40e6c4af1ab38cc2079a0f6e27d39d6b7d546), [`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da), [`3dd5c570a`](https://github.com/keystonejs/keystone/commit/3dd5c570a27d0795a689407d96fc9623c90a66df), [`2b682d2c1`](https://github.com/keystonejs/keystone/commit/2b682d2c1b6dc798a8913e4d2e09767c7a2980ac)]:
  - @keystonejs/fields@20.0.0
  - @keystonejs/adapter-mongoose@10.0.1
  - @keystonejs/keystone@17.1.1
  - @keystonejs/app-admin-ui@7.3.9
  - @keystonejs/auth-password@5.1.17
  - @keystonejs/fields-cloudinary-image@2.0.2
  - @keystonejs/fields-wysiwyg-tinymce@5.3.13

## 6.2.8

### Patch Changes

- Updated dependencies [[`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74), [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74)]:
  - @keystonejs/adapter-mongoose@10.0.0
  - @keystonejs/fields@19.0.0
  - @keystonejs/fields-cloudinary-image@2.0.1
  - @keystonejs/app-admin-ui@7.3.8
  - @keystonejs/auth-password@5.1.16
  - @keystonejs/fields-wysiwyg-tinymce@5.3.12

## 6.2.7

### Patch Changes

- Updated dependencies [[`481329c2b`](https://github.com/keystonejs/keystone/commit/481329c2bd404419efddfd0ed6f3db9a86a30f91), [`01b79349e`](https://github.com/keystonejs/keystone/commit/01b79349e625870193933aa044bdf27f8c75753e), [`48623ae44`](https://github.com/keystonejs/keystone/commit/48623ae44568bae1af2861003fa9922a0118cc57), [`a02e69987`](https://github.com/keystonejs/keystone/commit/a02e69987902cfde38d820e68cb24b7a20ca1f6f), [`966b5bc70`](https://github.com/keystonejs/keystone/commit/966b5bc7003e0f580528c4dcd46647cc4124b592), [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4), [`5799f3e48`](https://github.com/keystonejs/keystone/commit/5799f3e483fdf7db8ab1f868b26628fa85bbbb43), [`cc56990f2`](https://github.com/keystonejs/keystone/commit/cc56990f2e9a4ecf0c112362e8d472b9286f76bc), [`df0687184`](https://github.com/keystonejs/keystone/commit/df068718456d23819a7cae491870be4560b2010d), [`cc56990f2`](https://github.com/keystonejs/keystone/commit/cc56990f2e9a4ecf0c112362e8d472b9286f76bc)]:
  - @keystonejs/email@5.2.0
  - @keystonejs/app-admin-ui@7.3.7
  - @keystonejs/fields@18.0.0
  - @keystonejs/adapter-mongoose@9.0.8
  - @keystonejs/fields-cloudinary-image@2.0.0
  - @keystonejs/file-adapters@7.0.8
  - @keystonejs/keystone@17.0.0
  - @keystonejs/auth-password@5.1.15
  - @keystonejs/fields-wysiwyg-tinymce@5.3.11

## 6.2.6

### Patch Changes

- [`92b34a74e`](https://github.com/keystonejs/keystone/commit/92b34a74e699e3a101f53064e52932b7daeccbfc) [#3640](https://github.com/keystonejs/keystone/pull/3640) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `apollo-upload-client` to `^14.1.2`.

* [`b32f006ad`](https://github.com/keystonejs/keystone/commit/b32f006ad283f8aa1911f55bbecac9942f3f9f25) [#3666](https://github.com/keystonejs/keystone/pull/3666) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@apollo/client` to `^3.2.0`.

- [`304701d7c`](https://github.com/keystonejs/keystone/commit/304701d7c23e98c8dc40c0f3f5512a0370107c06) [#3585](https://github.com/keystonejs/keystone/pull/3585) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `graphql` to `^15.3.0`.

- Updated dependencies [[`92b34a74e`](https://github.com/keystonejs/keystone/commit/92b34a74e699e3a101f53064e52932b7daeccbfc), [`b32f006ad`](https://github.com/keystonejs/keystone/commit/b32f006ad283f8aa1911f55bbecac9942f3f9f25), [`6f42b0a9d`](https://github.com/keystonejs/keystone/commit/6f42b0a9d231049f9e7523eb78ec621d9c9d6df9), [`4d8b4a04e`](https://github.com/keystonejs/keystone/commit/4d8b4a04ef2f5ab616cc425e87e75e9a5bbf6abe), [`95d05dd13`](https://github.com/keystonejs/keystone/commit/95d05dd1328e397b45c69723ce037d174595881d), [`06dffc42b`](https://github.com/keystonejs/keystone/commit/06dffc42b08062e3166880146c8fb606493ead12), [`27783bbca`](https://github.com/keystonejs/keystone/commit/27783bbca3b1c5ff05402738c14ffa8db73e542b), [`7a1f8bbdc`](https://github.com/keystonejs/keystone/commit/7a1f8bbdcdf68c9579e17db77fa826e811abcab4), [`83007be79`](https://github.com/keystonejs/keystone/commit/83007be798ebd751d7eb708cde366dc35999af72), [`a14283b9c`](https://github.com/keystonejs/keystone/commit/a14283b9c9d80e8a38adede567695bf7e89cbcb9), [`38e3ad9c3`](https://github.com/keystonejs/keystone/commit/38e3ad9c3e7124d06f11c7046821c857cf7f9ad2), [`16f271f5f`](https://github.com/keystonejs/keystone/commit/16f271f5fdfc697fb8f9760922626e313ce25971), [`6f42b0a9d`](https://github.com/keystonejs/keystone/commit/6f42b0a9d231049f9e7523eb78ec621d9c9d6df9), [`5c1e55721`](https://github.com/keystonejs/keystone/commit/5c1e5572134fa93c9aefbb537676e30cafd0e7d9), [`304701d7c`](https://github.com/keystonejs/keystone/commit/304701d7c23e98c8dc40c0f3f5512a0370107c06), [`7a1f8bbdc`](https://github.com/keystonejs/keystone/commit/7a1f8bbdcdf68c9579e17db77fa826e811abcab4), [`d95010eea`](https://github.com/keystonejs/keystone/commit/d95010eea35f40274f412dad5c2fed6b16ae6c60), [`6a7395d58`](https://github.com/keystonejs/keystone/commit/6a7395d5848c6630b8e3943bcd9e3245aa6e2574), [`1c99f76d3`](https://github.com/keystonejs/keystone/commit/1c99f76d3c1dc02e08c3e39259c39cfd89d829a3), [`aa5b4aa26`](https://github.com/keystonejs/keystone/commit/aa5b4aa269eebc6931d30f6eddc315805c1f4fef), [`b6e160678`](https://github.com/keystonejs/keystone/commit/b6e160678b449707261a54a9d565b91663784831), [`104232785`](https://github.com/keystonejs/keystone/commit/104232785aac856be6a3ba55f8fa0fd8357237ed), [`7d17e861c`](https://github.com/keystonejs/keystone/commit/7d17e861cb3f3a820889ff7c925db1aa875ef473), [`287e031fa`](https://github.com/keystonejs/keystone/commit/287e031facafe66ef71b0f6d6ee558904251589f), [`7956d5da0`](https://github.com/keystonejs/keystone/commit/7956d5da00197dc11f5d54f7870b8fa72c05a3c0)]:
  - @keystonejs/app-admin-ui@7.3.6
  - @keystonejs/fields@17.1.3
  - @keystonejs/file-adapters@7.0.7
  - @keystonejs/fields-cloudinary-image@1.0.6
  - @keystonejs/adapter-mongoose@9.0.7
  - @keystonejs/keystone@16.0.0
  - @keystonejs/app-graphql@6.1.3
  - @keystonejs/email@5.1.9
  - @keystonejs/fields-wysiwyg-tinymce@5.3.10

## 6.2.5

### Patch Changes

- [`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a) [#3610](https://github.com/keystonejs/keystone/pull/3610) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `prettier` to `^2.1.1`.

* [`fe054e53e`](https://github.com/keystonejs/keystone/commit/fe054e53e71f13a69af1d6dd2a1cd8c68bb31059) [#3635](https://github.com/keystonejs/keystone/pull/3635) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@apollo/client` to `^3.1.5`.

* Updated dependencies [[`8b0fd66bb`](https://github.com/keystonejs/keystone/commit/8b0fd66bbd73a99a4ed321ce737b5dc33e2d11d3), [`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a), [`dd49d2c04`](https://github.com/keystonejs/keystone/commit/dd49d2c040ea8fb8dfc36d2e556be88ca1b74b15), [`d7eac6629`](https://github.com/keystonejs/keystone/commit/d7eac662956fc2dffd9ea5cfedf60e51ecc1b80d), [`8bd44758a`](https://github.com/keystonejs/keystone/commit/8bd44758ac742c95f42151c9fbc16700b698e8e4), [`8cae7cff5`](https://github.com/keystonejs/keystone/commit/8cae7cff513187ec6e740c4b17afb2b753fe625a), [`3599776bd`](https://github.com/keystonejs/keystone/commit/3599776bd160e7b46ceca3d81a22ddb6bd7941a2), [`77aa2d7d1`](https://github.com/keystonejs/keystone/commit/77aa2d7d156a83759a7f3c26e8c5bd019966b054), [`ddf5f6ae9`](https://github.com/keystonejs/keystone/commit/ddf5f6ae9418ff0c14de2273e329eed5441ce5bb), [`7908f5be6`](https://github.com/keystonejs/keystone/commit/7908f5be608f1debf625f1db3c68a1121e2b320a), [`7c47967d3`](https://github.com/keystonejs/keystone/commit/7c47967d3f8a6e0026f9cd0108ff1dafc8d331b9), [`4e9cf67c2`](https://github.com/keystonejs/keystone/commit/4e9cf67c235f58f9158facac1b5ce9830905b9ef), [`c08200087`](https://github.com/keystonejs/keystone/commit/c082000871947eb0a2415ac7355c89bc7b277383), [`f0d91f9f2`](https://github.com/keystonejs/keystone/commit/f0d91f9f285df3379011b6f450a6a70c3fbb3170), [`d07f6bfb6`](https://github.com/keystonejs/keystone/commit/d07f6bfb6b3bd65036c2030d2758abdf4eca1a9e), [`fe054e53e`](https://github.com/keystonejs/keystone/commit/fe054e53e71f13a69af1d6dd2a1cd8c68bb31059), [`379c78240`](https://github.com/keystonejs/keystone/commit/379c78240d788875d97642e1f53120818ad64aff)]:
  - @keystonejs/server-side-graphql-client@1.1.2
  - @keystonejs/app-admin-ui@7.3.5
  - @keystonejs/fields@17.1.2
  - @keystonejs/file-adapters@7.0.6
  - @keystonejs/keystone@15.0.0
  - @keystonejs/fields-cloudinary-image@1.0.5
  - @keystonejs/email@5.1.8
  - @keystonejs/fields-wysiwyg-tinymce@5.3.9
  - @keystonejs/adapter-mongoose@9.0.6

## 6.2.4

### Patch Changes

- [`cd15192cd`](https://github.com/keystonejs/keystone/commit/cd15192cdae5e476f64a257c196ca569a9440d5a) [#3510](https://github.com/keystonejs/keystone/pull/3510) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `graphql` to `^14.7.0`.

* [`4fc501203`](https://github.com/keystonejs/keystone/commit/4fc501203226a549e41a696985c68b2ba3af74a4) [#3558](https://github.com/keystonejs/keystone/pull/3558) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `next` to `^9.5.3`.

- [`a42ee3a30`](https://github.com/keystonejs/keystone/commit/a42ee3a306c899a7ae46909fe132522cbeff7812) [#3508](https://github.com/keystonejs/keystone/pull/3508) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `date-fns` to `^2.16.1`.

* [`639a11f75`](https://github.com/keystonejs/keystone/commit/639a11f75e6667b421624875ecd312a9fbf87abe) [#3534](https://github.com/keystonejs/keystone/pull/3534) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Renamed `demo-projects` folder to `examples` to allow for future smaller focused examples.

- [`28b88abd3`](https://github.com/keystonejs/keystone/commit/28b88abd369f0df12eae72107db7c24323eda4b5) [#3507](https://github.com/keystonejs/keystone/pull/3507) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Apollo GraphQL packages dependencies.

- Updated dependencies [[`e8e2baa7b`](https://github.com/keystonejs/keystone/commit/e8e2baa7b1a9330cb483c2f30682d64f857d314c), [`cd15192cd`](https://github.com/keystonejs/keystone/commit/cd15192cdae5e476f64a257c196ca569a9440d5a), [`7bfdb79ee`](https://github.com/keystonejs/keystone/commit/7bfdb79ee43235418f098e5fe7412968dcf6c397), [`5fb75bab6`](https://github.com/keystonejs/keystone/commit/5fb75bab638c59ccf690c46d862b9801bf1d28f6), [`4fc501203`](https://github.com/keystonejs/keystone/commit/4fc501203226a549e41a696985c68b2ba3af74a4), [`7fb51fba4`](https://github.com/keystonejs/keystone/commit/7fb51fba4682ded82df99330b4fe69b8bad0a2ce), [`d500613d8`](https://github.com/keystonejs/keystone/commit/d500613d8917e3cbcea2817501d607eddd3b1a8d), [`6c97a5534`](https://github.com/keystonejs/keystone/commit/6c97a5534e8a18d15aeac8b0471810fdd4d04f80), [`3a1f4d1e2`](https://github.com/keystonejs/keystone/commit/3a1f4d1e26bfa6cb553761b42a7f05d09a41a3b4), [`729e897e6`](https://github.com/keystonejs/keystone/commit/729e897e689f2673f38d6c0caf22e7cee7ee8ff3), [`34fcc7052`](https://github.com/keystonejs/keystone/commit/34fcc7052a24db61f1f2f12c46110c060934f4ca), [`d3a4f9263`](https://github.com/keystonejs/keystone/commit/d3a4f9263de0d11a1613e420f660eccc2a48172d), [`743646a59`](https://github.com/keystonejs/keystone/commit/743646a59c91d02d09000bb21c80e6311bc12645), [`a21517ece`](https://github.com/keystonejs/keystone/commit/a21517ecee1e3bca6909ca996057b98833ea9313), [`40b751ad6`](https://github.com/keystonejs/keystone/commit/40b751ad6f09aec137ef42df10fdbb1240173afb), [`c3488c5e8`](https://github.com/keystonejs/keystone/commit/c3488c5e88628b15eb9fe804551c3c5c44c07e0f), [`e62b3308b`](https://github.com/keystonejs/keystone/commit/e62b3308bd841b5f58ac9fa1f84707f9187fda6b), [`7036585f2`](https://github.com/keystonejs/keystone/commit/7036585f25c3b690b7a6fd04c39b5b781ff5bcd9), [`2e6a06202`](https://github.com/keystonejs/keystone/commit/2e6a06202299b36c36fd3efd895f2280479eac31), [`a42ee3a30`](https://github.com/keystonejs/keystone/commit/a42ee3a306c899a7ae46909fe132522cbeff7812), [`d71f98791`](https://github.com/keystonejs/keystone/commit/d71f987917509a206b1e0a994dbc6641a7cf4e06), [`438051442`](https://github.com/keystonejs/keystone/commit/4380514421020f4418a9f966c9fec60e014478b9), [`b3aa85031`](https://github.com/keystonejs/keystone/commit/b3aa850311cbc1622568f69f9cb4b9f46ab9db22), [`518718e19`](https://github.com/keystonejs/keystone/commit/518718e197d0a2d723c8e184552ddd5d8e165f12), [`16fba3b98`](https://github.com/keystonejs/keystone/commit/16fba3b98271410e570a370f610da7cd0686f294), [`28b88abd3`](https://github.com/keystonejs/keystone/commit/28b88abd369f0df12eae72107db7c24323eda4b5), [`16e4d91a2`](https://github.com/keystonejs/keystone/commit/16e4d91a20cc6a079c60ea9801381da55444b1e1), [`5e5ba0b86`](https://github.com/keystonejs/keystone/commit/5e5ba0b869924826adf640e6b1eb1608101e8a8e)]:
  - @keystonejs/app-admin-ui@7.3.4
  - @keystonejs/app-graphql@6.1.2
  - @keystonejs/fields@17.1.1
  - @keystonejs/keystone@14.0.2
  - @keystonejs/app-next@5.2.3
  - @keystonejs/file-adapters@7.0.5
  - @keystonejs/fields-cloudinary-image@1.0.4
  - @keystonejs/fields-wysiwyg-tinymce@5.3.8
  - @keystonejs/email@5.1.7
  - @keystonejs/adapter-mongoose@9.0.5

## 6.2.3

### Patch Changes

- [`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6) [#3481](https://github.com/keystonejs/keystone/pull/3481) Thanks [@Noviny](https://github.com/Noviny)! - Updated dependencies through a major version - this shouldn't require change by consumers.

* [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e) [#3477](https://github.com/keystonejs/keystone/pull/3477) Thanks [@Noviny](https://github.com/Noviny)! - Updating dependencies:

  These changes bring the keystone dev experience inline with installing keystone from npm :D

- [`db0797f7f`](https://github.com/keystonejs/keystone/commit/db0797f7f442c2c42cc941633930de527c722f48) [#3465](https://github.com/keystonejs/keystone/pull/3465) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused body-parser dependency.

* [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc) [#3438](https://github.com/keystonejs/keystone/pull/3438) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Apollo GraphQL package dependencies.

* Updated dependencies [[`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6), [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e), [`db0797f7f`](https://github.com/keystonejs/keystone/commit/db0797f7f442c2c42cc941633930de527c722f48), [`ac44568f9`](https://github.com/keystonejs/keystone/commit/ac44568f91fd54ccbc39accf83bcfb3276ce1a72), [`64d745013`](https://github.com/keystonejs/keystone/commit/64d745013fd2cccc1fb14c4f02ac84778b5c9abc), [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc), [`483b20ec5`](https://github.com/keystonejs/keystone/commit/483b20ec53ff89f1d026c0495fdae5df60a7cf59), [`0fc878fa9`](https://github.com/keystonejs/keystone/commit/0fc878fa918c3196196f943f195ffaa62fce504b), [`ea367f759`](https://github.com/keystonejs/keystone/commit/ea367f7594f47efc3528d9917cce010b3a16bf4d), [`69d627813`](https://github.com/keystonejs/keystone/commit/69d627813adfc10d29707f5c882ca15621de12a5), [`dc689f9ac`](https://github.com/keystonejs/keystone/commit/dc689f9ac8e213137dfed9e81992bbe4318b44ae), [`07e246d15`](https://github.com/keystonejs/keystone/commit/07e246d15586dede7fa9a04bcc13020c8c5c3a25), [`7f04d9dd2`](https://github.com/keystonejs/keystone/commit/7f04d9dd21ad792b540d9e0a5d83356c091597ad), [`0153168d7`](https://github.com/keystonejs/keystone/commit/0153168d73ce8cd7ede4eb9c8518e5e2bf859709)]:
  - @keystonejs/adapter-mongoose@9.0.4
  - @keystonejs/email@5.1.6
  - @keystonejs/fields@17.1.0
  - @keystonejs/file-adapters@7.0.4
  - @keystonejs/keystone@14.0.1
  - @keystonejs/app-admin-ui@7.3.3
  - @keystonejs/app-next@5.2.2
  - @keystonejs/fields-cloudinary-image@1.0.3
  - @keystonejs/fields-wysiwyg-tinymce@5.3.7
  - @keystonejs/session@8.1.1
  - @keystonejs/app-graphql@6.1.1

## 6.2.2

### Patch Changes

- Updated dependencies [[`25f50dadc`](https://github.com/keystonejs/keystone/commit/25f50dadc07d888de18d485244c84d17462dce2e), [`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593), [`fba90ac5d`](https://github.com/keystonejs/keystone/commit/fba90ac5db7328e952c44cb7c0bb8db76dd954b8), [`e8b2e4772`](https://github.com/keystonejs/keystone/commit/e8b2e477206acffb143f19fb14be1e3b4cd0eb91), [`18caa44b8`](https://github.com/keystonejs/keystone/commit/18caa44b8603a424f6e7d700c6c4340a92d02451), [`f714ac1e2`](https://github.com/keystonejs/keystone/commit/f714ac1e2c49ef44d756e35042bdb7da6db589a7), [`c243839c1`](https://github.com/keystonejs/keystone/commit/c243839c12abc8cffe8ff788fe57dcb880dc3a41)]:
  - @keystonejs/keystone@14.0.0
  - @keystonejs/fields@17.0.0
  - @keystonejs/app-admin-ui@7.3.2
  - @keystonejs/fields-wysiwyg-tinymce@5.3.6
  - @keystonejs/adapter-mongoose@9.0.3
  - @keystonejs/auth-password@5.1.14
  - @keystonejs/fields-cloudinary-image@1.0.2

## 6.2.1

### Patch Changes

- [`30bfdc158`](https://github.com/keystonejs/keystone/commit/30bfdc1586009cca8ff027b95fc68063047e8621) [#3372](https://github.com/keystonejs/keystone/pull/3372) Thanks [@singhArmani](https://github.com/singhArmani)! - **Fixed the `CloudinaryImage` field import in meetup demo**

  The `CloudinaryImage` was wrongly imported from `@keystonejs/fields` package causing an invalid type error.

  This change imports it correctly from `@keystonejs/fields-cloudinary-image`.

- Updated dependencies [[`9338f3739`](https://github.com/keystonejs/keystone/commit/9338f3739ecff5f626a713a06ce65c1e29888d25), [`3db2f3956`](https://github.com/keystonejs/keystone/commit/3db2f395688342fe9a1dda14be5ce8308c9c39a6), [`7e78ffdaa`](https://github.com/keystonejs/keystone/commit/7e78ffdaa96050e49e8e2678a3c4f1897fedae4f), [`72cd47b35`](https://github.com/keystonejs/keystone/commit/72cd47b357052b69e1d525758ff8a1a0cf44c5c2), [`7b0875723`](https://github.com/keystonejs/keystone/commit/7b0875723783780988f2dee4e5ee406a3b44ca98), [`2f76473ae`](https://github.com/keystonejs/keystone/commit/2f76473ae045b1d8b48688ac6de842c51a2fc345), [`0369985e3`](https://github.com/keystonejs/keystone/commit/0369985e320afd6112f2664f8a8edc1ed7167130), [`9338f3739`](https://github.com/keystonejs/keystone/commit/9338f3739ecff5f626a713a06ce65c1e29888d25), [`7422922f5`](https://github.com/keystonejs/keystone/commit/7422922f5649a2b52699f67a77645e9c91800688), [`df8f92a37`](https://github.com/keystonejs/keystone/commit/df8f92a378d2d787f5bee774f013767c09ec35cf), [`cc5bb8915`](https://github.com/keystonejs/keystone/commit/cc5bb891579281338ad7fad0873531be81d877d4), [`1b3943e4f`](https://github.com/keystonejs/keystone/commit/1b3943e4f66c61c446085736949c6b83e9087afb), [`b300720eb`](https://github.com/keystonejs/keystone/commit/b300720eb4e079bc30efb17ed3b48ab71cadc160)]:
  - @keystonejs/fields@16.1.0
  - @keystonejs/adapter-mongoose@9.0.2
  - @keystonejs/server-side-graphql-client@1.1.1
  - @keystonejs/file-adapters@7.0.3
  - @keystonejs/keystone@13.1.1
  - @keystonejs/app-admin-ui@7.3.1

## 6.2.0

### Minor Changes

- [`694f3acfb`](https://github.com/keystonejs/keystone/commit/694f3acfb9faa78aebfcf48cf711165560f16ff7) [#3125](https://github.com/keystonejs/keystone/pull/3125) Thanks [@Vultraz](https://github.com/Vultraz)! - Migrated to Apollo Client v3.

### Patch Changes

- Updated dependencies [[`d38a41f25`](https://github.com/keystonejs/keystone/commit/d38a41f25a1b4c90c05d2fb85116dc385d4ee77a), [`845b6a21b`](https://github.com/keystonejs/keystone/commit/845b6a21b62e615135eb738ad332fc035b93191b), [`5ede731fc`](https://github.com/keystonejs/keystone/commit/5ede731fc58a79e7322b852bdd2d971ece45281e), [`1a89bbdc6`](https://github.com/keystonejs/keystone/commit/1a89bbdc6b2122a5c8217e6f6c750f7cfb69dc2c), [`f8d4b175b`](https://github.com/keystonejs/keystone/commit/f8d4b175bbc29962569acb24b34c29c44b61791f), [`356dd27da`](https://github.com/keystonejs/keystone/commit/356dd27dab4ee6c89a9381dc92eef9534db52fc0), [`318e39b74`](https://github.com/keystonejs/keystone/commit/318e39b74b2fa3152d4ff09bccec93238e8345ef), [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25), [`b0af7d5ba`](https://github.com/keystonejs/keystone/commit/b0af7d5baa6ceea8d80215afa290fd76240ee823), [`694f3acfb`](https://github.com/keystonejs/keystone/commit/694f3acfb9faa78aebfcf48cf711165560f16ff7), [`149d6fd6f`](https://github.com/keystonejs/keystone/commit/149d6fd6ff057c17570346063c173376769dcc79), [`e44102e9f`](https://github.com/keystonejs/keystone/commit/e44102e9f7f770b1528d642d763ccf9f88f3cbb1), [`356dd27da`](https://github.com/keystonejs/keystone/commit/356dd27dab4ee6c89a9381dc92eef9534db52fc0), [`7650ecd3e`](https://github.com/keystonejs/keystone/commit/7650ecd3e60b52983015ac0058b8b0066b074e1e), [`ed2f8c31b`](https://github.com/keystonejs/keystone/commit/ed2f8c31b13eadb39a045cc351777add81621ede)]:
  - @keystonejs/fields@16.0.0
  - @keystonejs/keystone@13.1.0
  - @keystonejs/server-side-graphql-client@1.1.0
  - @keystonejs/session@8.1.0
  - @keystonejs/fields-wysiwyg-tinymce@5.3.5
  - @keystonejs/app-admin-ui@7.3.0
  - @keystonejs/auth-password@5.1.13

## 6.1.5

### Patch Changes

- [`acaf19cd9`](https://github.com/keystonejs/keystone/commit/acaf19cd9679861234e67f9e130aea83d052f01e) [#3301](https://github.com/keystonejs/keystone/pull/3301) Thanks [@MadeByMike](https://github.com/MadeByMike)! - No functional changes. Update all internal usages of `keystone.createItems` to the new `createItems` function.

* [`16730291d`](https://github.com/keystonejs/keystone/commit/16730291d6724baeea8cb7a1f25ea3dfe47db6a3) [#3315](https://github.com/keystonejs/keystone/pull/3315) Thanks [@gautamsi](https://github.com/gautamsi)! - Updated Next.js to 9.5.1 which make revalidate prop a stable api.

* Updated dependencies [[`af5171563`](https://github.com/keystonejs/keystone/commit/af51715637433bcdd2538835c98ac71a8eb86122), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2), [`271f1a40b`](https://github.com/keystonejs/keystone/commit/271f1a40b97e03aaa00ce920a6515b8f18669428), [`acaf19cd9`](https://github.com/keystonejs/keystone/commit/acaf19cd9679861234e67f9e130aea83d052f01e), [`22b4a5c1a`](https://github.com/keystonejs/keystone/commit/22b4a5c1a13c3cca47190467be9d56e836f180f1), [`7da9d67d7`](https://github.com/keystonejs/keystone/commit/7da9d67d7d481c44a81406c6b34540a3f0a8340d), [`afe661e60`](https://github.com/keystonejs/keystone/commit/afe661e607539df13584d460e1016ba0fa883cb8), [`16730291d`](https://github.com/keystonejs/keystone/commit/16730291d6724baeea8cb7a1f25ea3dfe47db6a3), [`04f9be03d`](https://github.com/keystonejs/keystone/commit/04f9be03de7fe82035205379208511c6e49890b3), [`ef7074977`](https://github.com/keystonejs/keystone/commit/ef70749775ce1565eafd7f94c3d7438c8ebd474e), [`b53b6fe5a`](https://github.com/keystonejs/keystone/commit/b53b6fe5a8cbefba20008ca54ee3fe4b346e8497), [`e07c42d4e`](https://github.com/keystonejs/keystone/commit/e07c42d4ec75d5703bec4a2e419a42d18bed90ca), [`5a3849806`](https://github.com/keystonejs/keystone/commit/5a3849806d00e62b722461d02f6e4639bc45c1eb), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2), [`24af20b38`](https://github.com/keystonejs/keystone/commit/24af20b38ab89a452edc7a060c9bc936cda55a4a), [`c3883e01c`](https://github.com/keystonejs/keystone/commit/c3883e01c01b83cf5938de9bebf2dd68f4861364), [`fd2b8d1cf`](https://github.com/keystonejs/keystone/commit/fd2b8d1cf0b23b177951d65006a0d0faf666a5d6), [`2e10b1083`](https://github.com/keystonejs/keystone/commit/2e10b1083c0ab3925b877f16543c3d302f618313)]:
  - @keystonejs/fields@15.0.0
  - @keystonejs/keystone@13.0.0
  - @keystonejs/server-side-graphql-client@1.0.0
  - @keystonejs/app-next@5.2.1
  - @keystonejs/app-admin-ui@7.2.0
  - @keystonejs/app-graphql@6.1.0
  - @keystonejs/fields-wysiwyg-tinymce@5.3.4
  - @keystonejs/auth-password@5.1.12
  - @keystonejs/adapter-mongoose@9.0.1

## 6.1.4

### Patch Changes

- [`49984caae`](https://github.com/keystonejs/keystone/commit/49984caaec803ed86b027c9634ac6b3f671e9ba7) [#3227](https://github.com/keystonejs/keystone/pull/3227) Thanks [@Vultraz](https://github.com/Vultraz)! - Moved `name` config option from Keystone constructor to Admin UI constructor.

* [`caf302129`](https://github.com/keystonejs/keystone/commit/caf3021295c4136ea48585d1687ad6fbf58ed4aa) [#3229](https://github.com/keystonejs/keystone/pull/3229) Thanks [@singhArmani](https://github.com/singhArmani)! - Updated usage of Apollo based on Next.js [example](https://github.com/vercel/next.js/blob/canary/examples/with-apollo).

  The **key changes** are:

  - Less boilerplate code for setting/initializing Apollo Client
  - Update home, events and about page to opt in for SSG
  - Removed MyApp.getIntialProps as it will stop the [Auto Static optimization](https://nextjs.org/docs/api-reference/data-fetching/getInitialProps#caveats).
  - Handle the authentication in client-side only.

* Updated dependencies [[`5ad84ccd8`](https://github.com/keystonejs/keystone/commit/5ad84ccd8d008188e293629e90a4d7e7fde55333), [`35335df8e`](https://github.com/keystonejs/keystone/commit/35335df8eb64541dc5c5685e89883f35aa85d3f5), [`61cdafe20`](https://github.com/keystonejs/keystone/commit/61cdafe20e0a22b5a1f9b6a2dcc4aefa45a26902), [`8480f889a`](https://github.com/keystonejs/keystone/commit/8480f889a492d83ee805f19877d49fd112117939), [`e710cd445`](https://github.com/keystonejs/keystone/commit/e710cd445bfb71317ca38622cc3795da61d13dff), [`49984caae`](https://github.com/keystonejs/keystone/commit/49984caaec803ed86b027c9634ac6b3f671e9ba7), [`136cb505c`](https://github.com/keystonejs/keystone/commit/136cb505ce11931de7fc470debe438e335588781), [`02f069f0b`](https://github.com/keystonejs/keystone/commit/02f069f0b6e28ccfe6d5cdeb59ab01bde27a655e), [`e6117d259`](https://github.com/keystonejs/keystone/commit/e6117d259e0ceeacc0b42e3db0bd39dd39537090), [`4b95d8a46`](https://github.com/keystonejs/keystone/commit/4b95d8a46d53d32b2873e350716311441cd37262), [`e114894d1`](https://github.com/keystonejs/keystone/commit/e114894d1bbcea8940cf14486fc336aa8d112da7), [`e63b9f25a`](https://github.com/keystonejs/keystone/commit/e63b9f25adb64cecf0f65c6f97fe30c95e483996), [`5fc97cbf4`](https://github.com/keystonejs/keystone/commit/5fc97cbf4489587a3a8cb38c04ba81fc2cb1fc5a), [`56e1798d6`](https://github.com/keystonejs/keystone/commit/56e1798d6815723cfba01e6d7dc6b4fe73d4447b), [`06f86c6f5`](https://github.com/keystonejs/keystone/commit/06f86c6f5c573411f0efda565a269d1d7ccb3c66), [`0cbb7e7b0`](https://github.com/keystonejs/keystone/commit/0cbb7e7b096c2a99685631a601fce7273d03cc70), [`81b4df318`](https://github.com/keystonejs/keystone/commit/81b4df3182fc63c583e3fae5c05c528b678cab95), [`e6909b003`](https://github.com/keystonejs/keystone/commit/e6909b0037c9d3dc4fc6131da7968a424ce02be9), [`c9ca62876`](https://github.com/keystonejs/keystone/commit/c9ca628765f1ecb599c8556de2d31567ddf12504), [`3ce644d5f`](https://github.com/keystonejs/keystone/commit/3ce644d5f2b6e674adb2f155c0e729536079347a), [`622cc7d69`](https://github.com/keystonejs/keystone/commit/622cc7d6976ecb71f5b135c931ac0fcb4afdb1c7), [`51aef1ef0`](https://github.com/keystonejs/keystone/commit/51aef1ef06a89422e89a6118b7820848d5970669)]:
  - @keystonejs/keystone@12.0.0
  - @keystonejs/file-adapters@7.0.2
  - @keystonejs/session@8.0.0
  - @keystonejs/app-admin-ui@7.1.0
  - @keystonejs/fields@14.0.0
  - @keystonejs/adapter-mongoose@9.0.0
  - @keystonejs/app-graphql@6.0.0
  - @keystonejs/fields-wysiwyg-tinymce@5.3.3
  - @keystonejs/auth-password@5.1.11

## 6.1.3

### Patch Changes

- [`70718864f`](https://github.com/keystonejs/keystone/commit/70718864fcf12b07dbc37018924a7a401637efc0) [#3162](https://github.com/keystonejs/keystone/pull/3162) Thanks [@timleslie](https://github.com/timleslie)! - Updated to use `context.executeGraphQL` for all server-side GraphQL operations.

- Updated dependencies [[`3ecf74462`](https://github.com/keystonejs/keystone/commit/3ecf74462524f4940474eaf75eea958acbda9ee4), [`4884ce609`](https://github.com/keystonejs/keystone/commit/4884ce6094b3c9ec203c702a5de97b983bd14176)]:
  - @keystonejs/keystone@11.1.1
  - @keystonejs/fields@13.0.1

## 6.1.2

### Patch Changes

- [`b693b2fa8`](https://github.com/keystonejs/keystone/commit/b693b2fa8a391d7f5bcfbea11061679bd4b559d8) [#3002](https://github.com/keystonejs/keystone/pull/3002) Thanks [@timleslie](https://github.com/timleslie)! - The `CalendarDay` field type options `yearRangeFrom` and `yearRangeTo` have been removed, and replaced with `dateFrom` and `dateTo`. These options take an ISO8601 formatted date string in the form `YYYY-MM-DD`, e.g. `2020-06-30`. These values are now validated on the server-side, rather than just on the client-side within the Admin UI.

  If you are currently using `yearRangeFrom` or `yearRangeTo` you will need to make the following change:

  ```
  birthday: { type: CalendarDay, yearRangeFrom: 1900, yearRangeTo: 2100 }
  ```

  becomes

  ```
  birthday: { type: CalendarDay, dateFrom: '1900-01-01', dateTo: '2100-12-31' }
  ```

- Updated dependencies [[`c235e34c7`](https://github.com/keystonejs/keystone/commit/c235e34c7a72cd05b05b3d1af08c93c1e98a8e91), [`dec3d336a`](https://github.com/keystonejs/keystone/commit/dec3d336adbe8156722fbe65f315a57b2f5c08e7), [`78a5d5a45`](https://github.com/keystonejs/keystone/commit/78a5d5a457f80bba592e5a81056125b11469a5a8), [`2e5a93dee`](https://github.com/keystonejs/keystone/commit/2e5a93dee5be11bf020c1397c7653bdf07a90d24), [`1c69f4dc8`](https://github.com/keystonejs/keystone/commit/1c69f4dc8ab1eb23bc0a34850f48a51f2e9f1dce), [`b693b2fa8`](https://github.com/keystonejs/keystone/commit/b693b2fa8a391d7f5bcfbea11061679bd4b559d8), [`950f23443`](https://github.com/keystonejs/keystone/commit/950f23443ef8f1a176a3cf6b039f93a29d954f5e), [`3c3c67abb`](https://github.com/keystonejs/keystone/commit/3c3c67abb5ec82155fec893d389eac3bbeb12bbd)]:
  - @keystonejs/fields-wysiwyg-tinymce@5.3.1
  - @keystonejs/fields@13.0.0
  - @keystonejs/keystone@11.1.0
  - @keystonejs/app-admin-ui@7.0.3
  - @keystonejs/auth-password@5.1.10

## 6.1.1

### Patch Changes

- Updated dependencies [[`8df24d2ab`](https://github.com/keystonejs/keystone/commit/8df24d2ab4bed8a7fc1a856c20a571781dd7c04e), [`083621c90`](https://github.com/keystonejs/keystone/commit/083621c9043a26af6fd48a57646e96b062c625a1), [`2a7f22062`](https://github.com/keystonejs/keystone/commit/2a7f220628bb0b4d58d0a4dca370e8922a25da80), [`37f57c39a`](https://github.com/keystonejs/keystone/commit/37f57c39ac490fa8a67499ac7ac75a8c04af41bf), [`33046a66f`](https://github.com/keystonejs/keystone/commit/33046a66f33a82cf099880303b44d9736344667d), [`7c38e2671`](https://github.com/keystonejs/keystone/commit/7c38e267143491f38699326f02764f40f337d416), [`835866e1a`](https://github.com/keystonejs/keystone/commit/835866e1a2954113d809c9f0bac186485ac6212b)]:
  - @keystonejs/keystone@11.0.0
  - @keystonejs/app-admin-ui@7.0.2
  - @keystonejs/adapter-mongoose@8.1.3

## 6.1.0

### Minor Changes

- [`eaf5d0084`](https://github.com/keystonejs/keystone/commit/eaf5d008430fe0b9ed0b713602c59138924b42b8) [#3080](https://github.com/keystonejs/keystone/pull/3080) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated Next.js dependency to 9.4.4.

### Patch Changes

- Updated dependencies [[`463f55233`](https://github.com/keystonejs/keystone/commit/463f552335013d5ba9ebf2e8f7a9ebf8e2b0e0db), [`eaf5d0084`](https://github.com/keystonejs/keystone/commit/eaf5d008430fe0b9ed0b713602c59138924b42b8)]:
  - @keystonejs/keystone@10.1.0
  - @keystonejs/app-next@5.2.0

## 6.0.1

### Patch Changes

- [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb) [#2990](https://github.com/keystonejs/keystone/pull/2990) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated various Apollo dependencies to their latest versions.

* [`d0b2485c4`](https://github.com/keystonejs/keystone/commit/d0b2485c49c4a2de598a505df05c8109c9ca436f) [#3079](https://github.com/keystonejs/keystone/pull/3079) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed a date-fns warning about string arguments.

* Updated dependencies [[`4104e1f15`](https://github.com/keystonejs/keystone/commit/4104e1f15c545c05f680e8d16413862e875ca57a), [`c2ebb51c7`](https://github.com/keystonejs/keystone/commit/c2ebb51c786297879fe9fac2007804055631e9e2), [`c3faeeff4`](https://github.com/keystonejs/keystone/commit/c3faeeff41f9b29a9fc31ca4e7778b596fcb20b9), [`f493eecc3`](https://github.com/keystonejs/keystone/commit/f493eecc34a0f1a6ba9f8eea1c34882784c1b5fe), [`b61987552`](https://github.com/keystonejs/keystone/commit/b619875520aa3b10d104794140f7977ffaebfbf0), [`397982096`](https://github.com/keystonejs/keystone/commit/39798209642571d3ba698e11410f5161cd1943bb), [`538378e4e`](https://github.com/keystonejs/keystone/commit/538378e4eb143dbe6e7a943408e0af302eb86b85), [`b5f89b305`](https://github.com/keystonejs/keystone/commit/b5f89b305eb8aaf63c3afc9f45f7aa7e4ce3f7b7), [`9f67e0e91`](https://github.com/keystonejs/keystone/commit/9f67e0e912b4f7dcb90fcb07c4b30bd6c45de464), [`ea9608342`](https://github.com/keystonejs/keystone/commit/ea960834262cec66f52fa39c1b3b07b702b3cd4d), [`8fddd97b2`](https://github.com/keystonejs/keystone/commit/8fddd97b20f1928ff7306d5d0dcc96e58ffe55fb), [`c1e6e6ff3`](https://github.com/keystonejs/keystone/commit/c1e6e6ff374fbac71535da0cc2badde0c13569e2), [`fdfb01417`](https://github.com/keystonejs/keystone/commit/fdfb01417b6d330342f4b6c326767c9567e35ca5), [`83548d43d`](https://github.com/keystonejs/keystone/commit/83548d43d661959a34a6de475994430ee1de3a1d), [`5ea313461`](https://github.com/keystonejs/keystone/commit/5ea313461aa2cba310b2634cc87780092c84b5be), [`cbfc67470`](https://github.com/keystonejs/keystone/commit/cbfc6747011329f7210e79ebe228f44ed8607321), [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb), [`3204ae785`](https://github.com/keystonejs/keystone/commit/3204ae78576b0ab5649d5f5ae9cfbb1def347af1), [`cced67b8f`](https://github.com/keystonejs/keystone/commit/cced67b8f9785348d79b23a89405fcc474461c14), [`da8ca8835`](https://github.com/keystonejs/keystone/commit/da8ca8835a910cc9b2f53e12ddaef88ffc194695), [`04c57fa78`](https://github.com/keystonejs/keystone/commit/04c57fa7840714d3413e093d468b78d740c95c9a), [`fd4e9100a`](https://github.com/keystonejs/keystone/commit/fd4e9100a636e0654db45d2471ce47a19b753647), [`614164c58`](https://github.com/keystonejs/keystone/commit/614164c5804b20800938efe781face46f5aea7bc), [`f33388b50`](https://github.com/keystonejs/keystone/commit/f33388b5061d59747ab46e238f43e9b08f52bd1e), [`4b06157be`](https://github.com/keystonejs/keystone/commit/4b06157be6cffde2d88969823f7c410fefd82317), [`649017fbd`](https://github.com/keystonejs/keystone/commit/649017fbd5ea17c36e8c49d44836e1f2bcae2692), [`6ab523476`](https://github.com/keystonejs/keystone/commit/6ab523476ceca5ad57e7833ebd172b2da6c0b5fd), [`839666e25`](https://github.com/keystonejs/keystone/commit/839666e25d8bffefd034e6344e11d72dd43b925b), [`9ca0733e5`](https://github.com/keystonejs/keystone/commit/9ca0733e57b525a7efdfdedfb7c80364e186994e), [`7203c5889`](https://github.com/keystonejs/keystone/commit/7203c588901c46fae1550f3596cab43a1dd5052a), [`d2390b703`](https://github.com/keystonejs/keystone/commit/d2390b703d30e0b4264ab6ed9b1ba4d7bb9fca6c), [`34a9816d3`](https://github.com/keystonejs/keystone/commit/34a9816d3c40a35409be735e748cea2c6d5aa895), [`64c0d68ac`](https://github.com/keystonejs/keystone/commit/64c0d68acb1ee969097a8fe59b5c296473790c5c), [`60db743aa`](https://github.com/keystonejs/keystone/commit/60db743aa79f6590d6a3ebb0169021f1c36f64cc), [`326242533`](https://github.com/keystonejs/keystone/commit/3262425335de5eee6979e38ebb45f19a22c1ee1a), [`b15221ac2`](https://github.com/keystonejs/keystone/commit/b15221ac21746b1380ddb31395cdd386d52920a9), [`16649fa55`](https://github.com/keystonejs/keystone/commit/16649fa556ae3723ca97eb0752653259ccae4bc2), [`ba363d9a8`](https://github.com/keystonejs/keystone/commit/ba363d9a82d3ca3ec464547a5d9e38354bc2a172), [`170faf568`](https://github.com/keystonejs/keystone/commit/170faf568fef5b74147791476b466dc7a25c7d6f), [`927150d81`](https://github.com/keystonejs/keystone/commit/927150d81e297fdb5c8ccad087ea255b861dfe32), [`c7599a46f`](https://github.com/keystonejs/keystone/commit/c7599a46f05108b10b3a805a20b77b4d834e616d), [`b696b2acb`](https://github.com/keystonejs/keystone/commit/b696b2acbf7def8dba41f46ccef5ff852703b95a), [`d970580e1`](https://github.com/keystonejs/keystone/commit/d970580e14904ba2f2ac5e969257e71f77ab67d7), [`1cc3deaf0`](https://github.com/keystonejs/keystone/commit/1cc3deaf0b0a48aecb0f0f2454f4fe2634e1da5f), [`070519dbe`](https://github.com/keystonejs/keystone/commit/070519dbec289b759759343d084bc5d2de9d4b37), [`10babad4b`](https://github.com/keystonejs/keystone/commit/10babad4b4135738bc0633b113e5c96d3ddb9e9f), [`24f5ab51c`](https://github.com/keystonejs/keystone/commit/24f5ab51c69d744fb0e1f47a0723c2cc70492010), [`de27d2c16`](https://github.com/keystonejs/keystone/commit/de27d2c16b520ae5126a74efb85c70ae88ae6b60), [`c35f9cd1c`](https://github.com/keystonejs/keystone/commit/c35f9cd1cba5bf27eb9cf7cc1a113716bc4a50ef)]:
  - @keystonejs/keystone@10.0.0
  - @keystonejs/app-admin-ui@7.0.0
  - @keystonejs/fields-wysiwyg-tinymce@5.3.0
  - @keystonejs/fields@12.0.0
  - @keystonejs/auth-password@5.1.9
  - @keystonejs/app-graphql@5.1.8
  - @keystonejs/file-adapters@7.0.0
  - @keystonejs/adapter-mongoose@8.1.2

## 6.0.0

### Major Changes

- [`e9a0de2c`](https://github.com/keystonejs/keystone/commit/e9a0de2cc03c211beca01ec206244105bdca6afc) [#2927](https://github.com/keystonejs/keystone/pull/2927) Thanks [@Vultraz](https://github.com/Vultraz)! - Upgraded to date-fns 2.x. This version uses [Unicode tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table) for its formatting strings. A conversion table is available [here](https://github.com/date-fns/date-fns/blob/master/CHANGELOG.md#200---2019-08-20).

  This change only affects the `CalendarDay` and `DateTime` fields' `format` config option.

  The following script utilizes the [`@date-fns/upgrade`](https://github.com/date-fns/date-fns-upgrade) package and can be used to convert old formatting strings:

  ```js
  const { convertTokens } = require('@date-fns/upgrade/v2');

  console.table(
    [
      // Add date-dns 1.x formatting strings here.
    ].map(str => ({
      v1: str,
      v2: convertTokens(str).replace(/'/g, ''),
    }))
  );
  ```

  Do note this converts symbols to standalone style as opposed to formatted style which may not always be desired. For example, `DD/MM/YYYY` would be converted to `dd/LL/yyyy` instead of `dd/MM/yyyy`. See [here](http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Stand-Alone-vs.-Format-Styles) for more information on which you should use.

### Patch Changes

- Updated dependencies [[`2b0f6441`](https://github.com/keystonejs/keystone/commit/2b0f6441e50787a4a82f417b573078717b39e9be), [`a124417f`](https://github.com/keystonejs/keystone/commit/a124417fddc75889db5e4e8e0d5625fb4af12590), [`54931d75`](https://github.com/keystonejs/keystone/commit/54931d75d3f26f4f300c2c4c3ee65ed3183b4a6a), [`f9604621`](https://github.com/keystonejs/keystone/commit/f9604621048afceb071a43c7b8d36d944555487f), [`3e5a8962`](https://github.com/keystonejs/keystone/commit/3e5a8962cc982765574464537904008be975b446), [`5a58bde6`](https://github.com/keystonejs/keystone/commit/5a58bde636f551f2d241086d47781d3c88852b99), [`e9a0de2c`](https://github.com/keystonejs/keystone/commit/e9a0de2cc03c211beca01ec206244105bdca6afc), [`3b0f4137`](https://github.com/keystonejs/keystone/commit/3b0f4137df4112c79e6db57ae68fe04ad338da4c), [`15c57317`](https://github.com/keystonejs/keystone/commit/15c573178fa056912503f3ed83efeccceabba3ec), [`d60e2ca9`](https://github.com/keystonejs/keystone/commit/d60e2ca91ab4a7dd815e030bcc92991c3380fa7e), [`94d55b8f`](https://github.com/keystonejs/keystone/commit/94d55b8fc3a334a556c19765063e9efb594b41a7), [`59ed6310`](https://github.com/keystonejs/keystone/commit/59ed6310bacc76f571639de048689becbedbeac5), [`2709a6b5`](https://github.com/keystonejs/keystone/commit/2709a6b512fe636d979837599b67bdb17b2517b1)]:
  - @keystonejs/app-admin-ui@6.0.1
  - @keystonejs/fields@11.0.0
  - @keystonejs/auth-password@5.1.8
  - @keystonejs/fields-wysiwyg-tinymce@5.2.8
  - @keystonejs/keystone@9.0.1

## 5.1.12

### Patch Changes

- Updated dependencies [[`4d3efe0f`](https://github.com/keystonejs/keystone/commit/4d3efe0fb65e0155c130cf3e0c378f024965f46d), [`c506dfa8`](https://github.com/keystonejs/keystone/commit/c506dfa81a5ef3640716f69412b1a37c947d4f95), [`72e0a4e1`](https://github.com/keystonejs/keystone/commit/72e0a4e19942df11c72d11c2cf6ee9bc94300d87), [`5e20df81`](https://github.com/keystonejs/keystone/commit/5e20df81aaa8b464071c1e0adc64635752163362), [`a1c9c372`](https://github.com/keystonejs/keystone/commit/a1c9c372c274de8cb0d0012c0d5c20c46f356b0a), [`04dffb3c`](https://github.com/keystonejs/keystone/commit/04dffb3c0abd03712df431ff57b3271b10f4f47b), [`bfa3a287`](https://github.com/keystonejs/keystone/commit/bfa3a287a40f625b74d1f430dff6826296bb7019), [`12126788`](https://github.com/keystonejs/keystone/commit/121267885eb3e279eb5b6d035568f547323dd245), [`d639624d`](https://github.com/keystonejs/keystone/commit/d639624db8615b52731af56fea0ae9c573ef38a1), [`e0e3e30a`](https://github.com/keystonejs/keystone/commit/e0e3e30a9051741de3f5a0c12ba00f2238d54800), [`3e9bfb85`](https://github.com/keystonejs/keystone/commit/3e9bfb854196dffcca98f60c5de9ad463d79f4f2), [`5ec4e5d5`](https://github.com/keystonejs/keystone/commit/5ec4e5d547503baeae2ac2f6317b66c2ebae93b7), [`6e507838`](https://github.com/keystonejs/keystone/commit/6e5078380e1d17eb2884554eef114fdd521a15f4), [`c8e52f3b`](https://github.com/keystonejs/keystone/commit/c8e52f3ba892269922c1ed3af0c2114f07387704), [`3cd5f205`](https://github.com/keystonejs/keystone/commit/3cd5f205348311a2ad00875782530b96c3c477af), [`08087998`](https://github.com/keystonejs/keystone/commit/08087998af0045aa45b26d721f75639cd279ae1b), [`6c19f04c`](https://github.com/keystonejs/keystone/commit/6c19f04c0e5ce972283562daebe60c9f4a29c55c), [`fcb9f2c1`](https://github.com/keystonejs/keystone/commit/fcb9f2c1751ec866adddeb6946e8ab60ffef06e6), [`547fd837`](https://github.com/keystonejs/keystone/commit/547fd8373797f0cb5d8dd0acd193750686053fac), [`2a1e4f49`](https://github.com/keystonejs/keystone/commit/2a1e4f49d7f234c49e5b04440ff786ddf3e9e7ed), [`9e2e0071`](https://github.com/keystonejs/keystone/commit/9e2e00715aff50f2ddfedf3dbc14f390275ff23b), [`b5c44934`](https://github.com/keystonejs/keystone/commit/b5c4493442c5e4cfeba23c058a9a6819c628aab9), [`0fbc5b98`](https://github.com/keystonejs/keystone/commit/0fbc5b989a9f96248d1bd7f2f589fe77cb1d8f7d), [`e3d46ce4`](https://github.com/keystonejs/keystone/commit/e3d46ce4bd9f9ec8808ab3194672c6849e624e27), [`d8584765`](https://github.com/keystonejs/keystone/commit/d85847652e224e5000e036be2df0b8a45ab96385), [`405d0ae1`](https://github.com/keystonejs/keystone/commit/405d0ae1d332e31423db43f58ac26c25abbe94a3), [`121cb02d`](https://github.com/keystonejs/keystone/commit/121cb02d1c9886a24bfa14c985ede48d6a56edca), [`da1359df`](https://github.com/keystonejs/keystone/commit/da1359dfc1bff7e27505eff876efe3a0865bae2d), [`285026a0`](https://github.com/keystonejs/keystone/commit/285026a04ffce23ab72d7defc18ced2e980b0de4), [`d4811b02`](https://github.com/keystonejs/keystone/commit/d4811b0231c5d64e95dbbce57531df0931d4defa), [`e2800875`](https://github.com/keystonejs/keystone/commit/e28008756cbcc1e07e012a9fdb0cfa0ad94f3673), [`60e2c7eb`](https://github.com/keystonejs/keystone/commit/60e2c7eb2298a016c68a19a056040a3b45beab2a), [`99da34a8`](https://github.com/keystonejs/keystone/commit/99da34a8db26b8861b08cee330407605e787a80c), [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533), [`9a94cee8`](https://github.com/keystonejs/keystone/commit/9a94cee8e59fdf7956d82887390dfb84bf6185fa), [`bcf03a7f`](https://github.com/keystonejs/keystone/commit/bcf03a7f8067a3f29f22dde397b957bf5cee1a07), [`e765ad20`](https://github.com/keystonejs/keystone/commit/e765ad20abae9838f64b72b7d43767ec87db336a), [`1ca8951c`](https://github.com/keystonejs/keystone/commit/1ca8951c71c5af3b0ff338a9a6a8733231fb90c4), [`d7eb2601`](https://github.com/keystonejs/keystone/commit/d7eb260144d2aa31e7ef4e636e7a23f91dc37285)]:
  - @keystonejs/app-admin-ui@6.0.0
  - @keystonejs/fields@10.0.0
  - @keystonejs/keystone@9.0.0
  - @keystonejs/auth-password@5.1.7
  - @keystonejs/email@5.1.5
  - @keystonejs/session@7.0.0
  - @keystonejs/adapter-mongoose@8.1.0
  - @keystonejs/fields-wysiwyg-tinymce@5.2.7
  - @keystonejs/app-graphql@5.1.7

## 5.1.11

### Patch Changes

- [`c68aed4a`](https://github.com/keystonejs/keystone/commit/c68aed4a414f5188f5dc9e99ac51d1afefc22e64) [#2846](https://github.com/keystonejs/keystone/pull/2846) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded `uuid` from `3.x` to `7.x`.

- Updated dependencies [[`ab484f19`](https://github.com/keystonejs/keystone/commit/ab484f195752bb3ec59f6beb7d8817dce610ad06), [`1b059e72`](https://github.com/keystonejs/keystone/commit/1b059e726d95bbc6ad09a76ed3b40dbc4cf11682), [`95babf5d`](https://github.com/keystonejs/keystone/commit/95babf5da8488f2d7f8ab9f91ff640576462af6d), [`4af9e407`](https://github.com/keystonejs/keystone/commit/4af9e4075c9329ab27e7aa18a664d2f2bcc1ac2d), [`04ec9981`](https://github.com/keystonejs/keystone/commit/04ec998166a8b3044570769a8c3f501d80527bf9), [`b897ba14`](https://github.com/keystonejs/keystone/commit/b897ba14e34aa441b2d658c30b3dda9d1ebd48e2), [`0aac3b41`](https://github.com/keystonejs/keystone/commit/0aac3b411a9e4f397645d9641c4675eab7a6e55b), [`b0bfcf79`](https://github.com/keystonejs/keystone/commit/b0bfcf79477249f3c0bb14db68588d84a68f0186), [`f266a692`](https://github.com/keystonejs/keystone/commit/f266a6923a24c84936d66e00ec7de0ea0956445b), [`4e56eed6`](https://github.com/keystonejs/keystone/commit/4e56eed68c643fd436c371e2635d3024c51968b0), [`8a135a88`](https://github.com/keystonejs/keystone/commit/8a135a88ae6f3a4434db0ba7033cad2e5f18651e), [`63a2f7c3`](https://github.com/keystonejs/keystone/commit/63a2f7c31777d968bad32d6e746e2f960c6ef0ad), [`96f0c6e9`](https://github.com/keystonejs/keystone/commit/96f0c6e917ecdd02af8da52829608b003219d3ca), [`81a9aa7c`](https://github.com/keystonejs/keystone/commit/81a9aa7c2349f9bb71d1a9686e4fa359a14b033f)]:
  - @keystonejs/app-admin-ui@5.12.0
  - @keystonejs/file-adapters@6.0.2
  - @keystonejs/fields@9.0.5
  - @keystonejs/app-graphql@5.1.6
  - @keystonejs/fields-wysiwyg-tinymce@5.2.6
  - @keystonejs/keystone@8.1.4

## 5.1.10

### Patch Changes

- [`577b5e69`](https://github.com/keystonejs/keystone/commit/577b5e69ac4f949d1be2a80d8f391cb0a4b1333a) [#2799](https://github.com/keystonejs/keystone/pull/2799) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Upgraded React and Emotion packages.

- Updated dependencies [[`577b5e69`](https://github.com/keystonejs/keystone/commit/577b5e69ac4f949d1be2a80d8f391cb0a4b1333a)]:
  - @keystonejs/app-admin-ui@5.11.1
  - @keystonejs/email@5.1.4
  - @keystonejs/fields-wysiwyg-tinymce@5.2.5
  - @keystonejs/fields@9.0.4

## 5.1.9

### Patch Changes

- [`2686c9f8`](https://github.com/keystonejs/keystone/commit/2686c9f8cd49a1ce6876787a0a634ddf4e19952c) [#2724](https://github.com/keystonejs/keystone/pull/2724) Thanks [@Vultraz](https://github.com/Vultraz)! - Used functional components for email templates.

- Updated dependencies [[`9d862edc`](https://github.com/keystonejs/keystone/commit/9d862edc506460d4a0456e48ec418b9042b582ad), [`344c45ef`](https://github.com/keystonejs/keystone/commit/344c45efbb96a90010f81e4c8447a9c5728ea87f), [`875c7df5`](https://github.com/keystonejs/keystone/commit/875c7df5873c3a5173fba1a7c3078fcd098f0a32), [`6a27fcf1`](https://github.com/keystonejs/keystone/commit/6a27fcf1896c5a745308346e5b0e66dd8bdd57a3), [`98e9f6d1`](https://github.com/keystonejs/keystone/commit/98e9f6d16e16ee13d2a8a22eb25be9cd2afc6fc0), [`57e6ce29`](https://github.com/keystonejs/keystone/commit/57e6ce293e5afd0add52728aa73c74e90fcbe0f7), [`2686c9f8`](https://github.com/keystonejs/keystone/commit/2686c9f8cd49a1ce6876787a0a634ddf4e19952c)]:
  - @keystonejs/app-admin-ui@5.10.0
  - @keystonejs/fields@9.0.2
  - @keystonejs/keystone@8.1.2
  - @keystonejs/email@5.1.3

## 5.1.8

### Patch Changes

- [`a5a6663c`](https://github.com/keystonejs/keystone/commit/a5a6663cd1139a404b03270966c0766dc5a42b50) [#2723](https://github.com/keystonejs/keystone/pull/2723) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed custom schema not getting registered in Meetup demo.

- Updated dependencies [[`c013d8bc`](https://github.com/keystonejs/keystone/commit/c013d8bc1113b2a31ededc3918ab98c2c99f25f4), [`3193f4a5`](https://github.com/keystonejs/keystone/commit/3193f4a56c6391d07e8c04913a667940ef7b8815), [`885bc678`](https://github.com/keystonejs/keystone/commit/885bc6786dd63cad86515b2fe6a39ea52b39d4c0), [`93ae77ef`](https://github.com/keystonejs/keystone/commit/93ae77efe71151279a15ddb7ddc3df60651022b4), [`eb90aea6`](https://github.com/keystonejs/keystone/commit/eb90aea6b33dda8d95baba818306328dd747247f)]:
  - @keystonejs/fields@9.0.1
  - @keystonejs/app-admin-ui@5.9.6
  - @keystonejs/auth-password@5.1.6

## 5.1.7

### Patch Changes

- Updated dependencies [[`fd685241`](https://github.com/keystonejs/keystone/commit/fd68524135025e4d800b4a98932916736dd50e9d)]:
  - @keystonejs/adapter-mongoose@8.0.0
  - @keystonejs/fields@9.0.0
  - @keystonejs/keystone@8.0.0
  - @keystonejs/app-admin-ui@5.9.5
  - @keystonejs/auth-password@5.1.5
  - @keystonejs/fields-wysiwyg-tinymce@5.2.3

## 5.1.6

### Patch Changes

- [`b4d16b89`](https://github.com/keystonejs/keystone/commit/b4d16b89aab643f34d70f42823817a246bf16373) [#2560](https://github.com/keystonejs/keystone/pull/2560) Thanks [@JedWatson](https://github.com/JedWatson)! - Updated links to Keystone github project.

* [`0339eaf1`](https://github.com/keystonejs/keystone/commit/0339eaf1bde1b5d814f8745812ab3a1bd72fc8aa) [#2607](https://github.com/keystonejs/keystone/pull/2607) Thanks [@Vultraz](https://github.com/Vultraz)! - Made the Meetup demo functional again, and refactored out last use of withApollo.

- [`63169b6a`](https://github.com/keystonejs/keystone/commit/63169b6a6b6a4dc286cd224b7f871960f2d4b0ad) [#2638](https://github.com/keystonejs/keystone/pull/2638) Thanks [@Vultraz](https://github.com/Vultraz)! - Removed uses of defaultProps for functional components.

* [`89bec596`](https://github.com/keystonejs/keystone/commit/89bec5966c07ea700a863d3a7a8d1ebb8fb5541a) [#2608](https://github.com/keystonejs/keystone/pull/2608) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated Next.js to 9.3.2. Includes an important security fix.

- [`cef28dfd`](https://github.com/keystonejs/keystone/commit/cef28dfdad332cf185a577b06600acc3d8ba4888) [#2645](https://github.com/keystonejs/keystone/pull/2645) Thanks [@Vultraz](https://github.com/Vultraz)! - Converted more class components to functional ones.

* [`c70c339a`](https://github.com/keystonejs/keystone/commit/c70c339a307d92427962f7332bc371f9226bb2d6) [#2603](https://github.com/keystonejs/keystone/pull/2603) Thanks [@Vultraz](https://github.com/Vultraz)! - Removed apollo-boost dependency and switched the meetup demo to using apollo-upload-client.

* Updated dependencies [[`e7e4bc1d`](https://github.com/keystonejs/keystone/commit/e7e4bc1d22149d4daceb31d303f6ad10c2b853ba), [`58c4ffc3`](https://github.com/keystonejs/keystone/commit/58c4ffc3d4b1edf8bdfbc4ea299133d303239fc6), [`b4d16b89`](https://github.com/keystonejs/keystone/commit/b4d16b89aab643f34d70f42823817a246bf16373), [`7fc00071`](https://github.com/keystonejs/keystone/commit/7fc00071cd22514103593f0da68b9efa3bf853e9), [`63169b6a`](https://github.com/keystonejs/keystone/commit/63169b6a6b6a4dc286cd224b7f871960f2d4b0ad), [`007063c4`](https://github.com/keystonejs/keystone/commit/007063c4f17e6e7038312ed9126eaf91757e7939), [`89bec596`](https://github.com/keystonejs/keystone/commit/89bec5966c07ea700a863d3a7a8d1ebb8fb5541a), [`4a7d1eab`](https://github.com/keystonejs/keystone/commit/4a7d1eabf9b44fac7e16dfe20afdce409986e8dc), [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063), [`d138736d`](https://github.com/keystonejs/keystone/commit/d138736db184c5884171c7a65e43377f248046b5), [`2ae2bd47`](https://github.com/keystonejs/keystone/commit/2ae2bd47eb54a816cfd4c8cd178c460729cbc258), [`2cbd38b0`](https://github.com/keystonejs/keystone/commit/2cbd38b05adc98cface11a8767f66b48a1cb0bbf), [`3407fa68`](https://github.com/keystonejs/keystone/commit/3407fa68b91d7ebb3e7288c7e95631013fe12535), [`c2b1b725`](https://github.com/keystonejs/keystone/commit/c2b1b725a9474348964a4ac2e0f5b4aaf1a7f486)]:
  - @keystonejs/fields@8.0.0
  - @keystonejs/app-admin-ui@5.9.4
  - @keystonejs/app-next@5.1.2
  - @keystonejs/keystone@7.1.0
  - @keystonejs/adapter-mongoose@7.0.0
  - @keystonejs/app-graphql@5.1.5
  - @keystonejs/auth-password@5.1.4
  - @keystonejs/email@5.1.2
  - @keystonejs/file-adapters@6.0.1
  - @keystonejs/session@6.0.1
  - @keystonejs/fields-wysiwyg-tinymce@5.2.2

## 5.1.5

### Patch Changes

- Updated dependencies [[`b6a555c2`](https://github.com/keystonejs/keystone/commit/b6a555c28296394908757f7404b72bc6b828b52a), [`b6a555c2`](https://github.com/keystonejs/keystone/commit/b6a555c28296394908757f7404b72bc6b828b52a), [`7c9d36a2`](https://github.com/keystonejs/keystone/commit/7c9d36a2d5002258964cbd9414766ee244945005), [`ca28681c`](https://github.com/keystonejs/keystone/commit/ca28681ca23c74bc57041fa36c20b93a4520e762), [`68be8f45`](https://github.com/keystonejs/keystone/commit/68be8f452909100fbddec431d6fe60c20a06a700), [`61a70503`](https://github.com/keystonejs/keystone/commit/61a70503f6c184a8f0f5440466399f12e6d7fa41), [`cec7ba5e`](https://github.com/keystonejs/keystone/commit/cec7ba5e2061280eff2a1d989054ecb02760e36d)]:
  - @keystonejs/app-admin-ui@5.9.3
  - @keystonejs/keystone@7.0.0
  - @keystonejs/session@6.0.0
  - @keystonejs/app-graphql@5.1.4
  - @keystonejs/adapter-mongoose@6.0.0
  - @keystonejs/fields@7.0.2
  - @keystonejs/auth-password@5.1.3

## 5.1.4

### Patch Changes

- [`29ad8a17`](https://github.com/keystonejs/keystone/commit/29ad8a175cc4324fe722eefd22c09f7fb6c5be5e) [#2531](https://github.com/keystonejs/keystone/pull/2531) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed a minor typo.

- Updated dependencies [[`51546e41`](https://github.com/keystonejs/keystone/commit/51546e4142fb8c66cfc413479c671a59618f885b), [`29ad8a17`](https://github.com/keystonejs/keystone/commit/29ad8a175cc4324fe722eefd22c09f7fb6c5be5e), [`83bdf743`](https://github.com/keystonejs/keystone/commit/83bdf743748e39d1ea73eff2c8e3576cc713c624), [`d748156b`](https://github.com/keystonejs/keystone/commit/d748156ba5ebe33f4271fae0df781e0c63f2b7e6), [`d30b7498`](https://github.com/keystonejs/keystone/commit/d30b74984b21ae9fc2a3b39850f674639fbac074), [`1d9c6762`](https://github.com/keystonejs/keystone/commit/1d9c6762d32409c71da6a68a083a81197c35aac3), [`8f22ab5e`](https://github.com/keystonejs/keystone/commit/8f22ab5eefc034f9fef4fd0f9ec2c2583fc5514f), [`599c0929`](https://github.com/keystonejs/keystone/commit/599c0929b213ebd4beb79e3ccaa685b92348ca81), [`fb510d67`](https://github.com/keystonejs/keystone/commit/fb510d67ab124d8c1bda1884fa2a0d48262b5e4d)]:
  - @keystonejs/keystone@6.0.2
  - @keystonejs/app-graphql@5.1.3
  - @keystonejs/adapter-mongoose@5.2.2
  - @keystonejs/fields@7.0.1

## 5.1.3

### Patch Changes

- [`916e862a`](https://github.com/keystonejs/keystone/commit/916e862a19a4f1c858abd0e76195103228d33678) [#2324](https://github.com/keystonejs/keystone/pull/2324) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated Meetup demo to use Apollo hooks.

- Updated dependencies [[`161bf3e5`](https://github.com/keystonejs/keystone/commit/161bf3e57acb1b3d88a0836507d4c8dd4935f260)]:
  - @keystonejs/fields@7.0.0
  - @keystonejs/app-admin-ui@5.9.2
  - @keystonejs/fields-wysiwyg-tinymce@5.2.1
  - @keystonejs/auth-password@5.1.2
  - @keystonejs/keystone@6.0.1

## 5.1.2

### Patch Changes

- [`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded React to 16.13.0.

* [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

* Updated dependencies [[`10e88dc3`](https://github.com/keystonejs/keystone/commit/10e88dc3d81f5e021db0bfb31f7547852c602c14), [`787eabb3`](https://github.com/keystonejs/keystone/commit/787eabb387cd28f1578a5dfb68db95203ab8c782), [`5dea5561`](https://github.com/keystonejs/keystone/commit/5dea5561527a4e991d017d087f512101d53256b9), [`e46f0adf`](https://github.com/keystonejs/keystone/commit/e46f0adf97141e1f1205787453173a0585df5bc3), [`d7c7d827`](https://github.com/keystonejs/keystone/commit/d7c7d8271c5da8fec01df123c954d6a03aa41146), [`6975f169`](https://github.com/keystonejs/keystone/commit/6975f16959bde3fe0e861977471c94a8c9f2c0b0), [`f0148ccb`](https://github.com/keystonejs/keystone/commit/f0148ccb03abb882195b9bd44c34b780170c89ef), [`aa6cd8f4`](https://github.com/keystonejs/keystone/commit/aa6cd8f4c5947fe9525350bb99253acc0716af0a), [`42497b8e`](https://github.com/keystonejs/keystone/commit/42497b8ebbaeaf0f4d7881dbb76c6abafde4cace), [`fe42a997`](https://github.com/keystonejs/keystone/commit/fe42a997c81825a819ac28f05e02d1ed61099542), [`6790d053`](https://github.com/keystonejs/keystone/commit/6790d053effba118d0b3a51806a5c066cf022d45), [`97fb01fe`](https://github.com/keystonejs/keystone/commit/97fb01fe5a32f5003a084c1fd357852fc28f74e4), [`6111e065`](https://github.com/keystonejs/keystone/commit/6111e06554a6aa6db0f7df1a6c16f9da8e81fce4), [`2d1069f1`](https://github.com/keystonejs/keystone/commit/2d1069f11f5f8941b0a18e482541043c853ebb4f), [`6de20ce6`](https://github.com/keystonejs/keystone/commit/6de20ce6b4aad46d2a8cc5ca8d1ada179aca7c9b), [`479fa2e9`](https://github.com/keystonejs/keystone/commit/479fa2e9bbee6e20ae3d541471af8bf4ecbac859), [`949f2f6a`](https://github.com/keystonejs/keystone/commit/949f2f6a3889492015281ffba45a8b3d37e6d888), [`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722), [`df422e70`](https://github.com/keystonejs/keystone/commit/df422e70291ebf8660428c9a4a378611623985ae), [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20)]:
  - @keystonejs/keystone@6.0.0
  - @keystonejs/app-graphql@5.1.2
  - @keystonejs/file-adapters@6.0.0
  - @keystonejs/app-admin-ui@5.9.1
  - @keystonejs/fields-wysiwyg-tinymce@5.2.0
  - @keystonejs/fields@6.3.2
  - @keystonejs/email@5.1.1
  - @keystonejs/adapter-mongoose@5.2.1
  - @keystonejs/app-next@5.1.1
  - @keystonejs/auth-password@5.1.1
  - @keystonejs/session@5.1.1

## 5.1.1

### Patch Changes

- [`d8a7b8a2`](https://github.com/keystonejs/keystone/commit/d8a7b8a23b4c3e1545d101a92323be165ad362e2) [#2395](https://github.com/keystonejs/keystone/pull/2395) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded all `@emotion.*` dependencies.

* [`535ea6a9`](https://github.com/keystonejs/keystone/commit/535ea6a93d74eced46a8e5711a2e6aafa0dca95b) [#2390](https://github.com/keystonejs/keystone/pull/2390) Thanks [@Vultraz](https://github.com/Vultraz)! - Update `cross-env` dependency to 7.0.0.

* Updated dependencies [[`0c9d3125`](https://github.com/keystonejs/keystone/commit/0c9d3125d9b4bb37047a6c6ed61796e52fba8b17), [`7ce804a8`](https://github.com/keystonejs/keystone/commit/7ce804a877300709375e5bc14206080ab15aec54), [`d8a7b8a2`](https://github.com/keystonejs/keystone/commit/d8a7b8a23b4c3e1545d101a92323be165ad362e2), [`5c6ee24c`](https://github.com/keystonejs/keystone/commit/5c6ee24ceea951d7add79af55ef5a408edd8b763), [`9a388f01`](https://github.com/keystonejs/keystone/commit/9a388f01e388272d56f81af2247d8030e0f2c972), [`6b1ea0ec`](https://github.com/keystonejs/keystone/commit/6b1ea0ec1b536b5c9098105f5e77c0cd5feaf6b0), [`7c552a14`](https://github.com/keystonejs/keystone/commit/7c552a14078843710b7f225a88d1cd2024514981), [`b30d1361`](https://github.com/keystonejs/keystone/commit/b30d13612c54c0a3f0ebc2fc9c777954d4c4727f), [`bd4096ee`](https://github.com/keystonejs/keystone/commit/bd4096ee86f7790c76db23090b38f880e5aa7ecc), [`fd94849b`](https://github.com/keystonejs/keystone/commit/fd94849bccaf13426d2f7bcc2cd82fe81da7be7e), [`b14a513e`](https://github.com/keystonejs/keystone/commit/b14a513e3c52e3f41bd4341b7b7faea2b9f8f2e9), [`5e8c6df3`](https://github.com/keystonejs/keystone/commit/5e8c6df3e7c8bee4c76ca4d5be38cd6aff198bd8), [`1b3ee45e`](https://github.com/keystonejs/keystone/commit/1b3ee45e9ec6e52329b208c73e5a3597aea69799), [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09), [`3abc5883`](https://github.com/keystonejs/keystone/commit/3abc58831e0f9b5871569a3fa6b21be7dc269cf3), [`8bdbb114`](https://github.com/keystonejs/keystone/commit/8bdbb114f6b2864693ae6e534df6fe8ee8345a60), [`4313b645`](https://github.com/keystonejs/keystone/commit/4313b64554b1cc64e64245706b00c0510a5dd0b4), [`362efbc2`](https://github.com/keystonejs/keystone/commit/362efbc2e054fa48aedb515c54b5a64757832be9), [`c059b63c`](https://github.com/keystonejs/keystone/commit/c059b63c6ebdbb60ac4095d1efd791d598b2756c)]:
  - @keystonejs/app-admin-ui@5.9.0
  - @keystonejs/keystone@5.6.0
  - @keystonejs/fields-wysiwyg-tinymce@5.1.1
  - @keystonejs/fields@6.3.1
  - @keystonejs/app-graphql@5.1.1

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/adapter-mongoose@5.2.0
  - @keystonejs/app-admin-ui@5.8.0
  - @keystonejs/app-graphql@5.1.0
  - @keystonejs/app-next@5.1.0
  - @keystonejs/auth-password@5.1.0
  - @keystonejs/email@5.1.0
  - @keystonejs/fields-wysiwyg-tinymce@5.1.0
  - @keystonejs/fields@6.3.0
  - @keystonejs/file-adapters@5.5.0
  - @keystonejs/keystone@5.5.0
  - @keystonejs/session@5.1.0

## 5.0.7

### Patch Changes

- [`36a3e6a0`](https://github.com/keystonejs/keystone/commit/36a3e6a089b81a37276bbbe87dea7cf24dd5db9e) [#2323](https://github.com/keystonejs/keystone/pull/2323) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated Apollo-related dependencies:

  apollo-boost: 0.4.4 -> 0.4.7
  apollo-cache-inmemory: 1.5.1 -> 1.6.5
  apollo-client: 2.6.4 -> 2.6.8
  apollo-server-express: 2.9.1 -> 2.9.16
  apollo-upload-client: 10.0.0 -> 12.1.0
  apollo-utilities: 1.3.2 -> 1.3.3

- Updated dependencies [[`b8631cf7`](https://github.com/keystonejs/keystone/commit/b8631cf770db14b90f83300358213b7572ca01f2), [`29845426`](https://github.com/keystonejs/keystone/commit/29845426cb699afcc003f6a0b9ef540a61f808b4), [`ae4cf2d1`](https://github.com/keystonejs/keystone/commit/ae4cf2d108768d7ccbd23a409e7170fc92c81316), [`36a3e6a0`](https://github.com/keystonejs/keystone/commit/36a3e6a089b81a37276bbbe87dea7cf24dd5db9e), [`6c25d331`](https://github.com/keystonejs/keystone/commit/6c25d3319f89351568ad9d007b985a230e54b5b3), [`92d77eac`](https://github.com/keystonejs/keystone/commit/92d77eac59649430c2db810d2c701e5eab8b6e24)]:
  - @keystonejs/app-admin-ui@5.7.3
  - @keystonejs/app-graphql@5.0.4
  - @keystonejs/fields@6.2.3
  - @keystonejs/keystone@5.4.4

## 5.0.6

### Patch Changes

- [`51500a82`](https://github.com/keystonejs/keystone/commit/51500a82644bf65e6a06bef0d2dd4aa1a2d5d135) [#2244](https://github.com/keystonejs/keystone/pull/2244) - Bump next.js dep to ^9.2.0
- Updated dependencies [[`a34f1f72`](https://github.com/keystonejs/keystone/commit/a34f1f72613d1b7c79309ffe04fae0a79baa7737), [`56bb67fd`](https://github.com/keystonejs/keystone/commit/56bb67fdf794af56cb4167705d5693e0e4903a49), [`9677dc17`](https://github.com/keystonejs/keystone/commit/9677dc177b7b747397732700cab42d98e89f03f5), [`51500a82`](https://github.com/keystonejs/keystone/commit/51500a82644bf65e6a06bef0d2dd4aa1a2d5d135), [`87a17087`](https://github.com/keystonejs/keystone/commit/87a170877d9f735d909ee91b7661fa4a10b56a59)]:
  - @keystonejs/adapter-mongoose@5.1.5
  - @keystonejs/app-admin-ui@5.6.0
  - @keystonejs/file-adapters@5.3.2
  - @keystonejs/app-next@5.0.2

## 5.0.5

### Patch Changes

- [`933b3111`](https://github.com/keystonejs/keystone/commit/933b3111af7d629183013e1b42c2026cfbaaa5f4) [#2193](https://github.com/keystonejs/keystone/pull/2193) - Fixed typo in filename
- Updated dependencies [[`220d3a4b`](https://github.com/keystonejs/keystone/commit/220d3a4bc4265dc56653bed4b292f3e4d708502b), [`709d44a3`](https://github.com/keystonejs/keystone/commit/709d44a352f4e63be911a699c73304e830e2ee23), [`cc58f0e0`](https://github.com/keystonejs/keystone/commit/cc58f0e05d1de06432e149f0767122ae51d1c31a), [`11586035`](https://github.com/keystonejs/keystone/commit/115860350aa901749d240cb275cada29b8d541f8), [`6371b021`](https://github.com/keystonejs/keystone/commit/6371b021ee0b2022a3724992a6319bd0d7dd3583)]:
  - @keystonejs/fields@6.1.0
  - @keystonejs/app-admin-ui@5.5.4
  - @keystonejs/keystone@5.4.2

## 5.0.4

### Patch Changes

- [`b265b435`](https://github.com/keystonejs/keystone/commit/b265b4358287d4b3543da676fd34c99dc0f3b8a8) [#2140](https://github.com/keystonejs/keystone/pull/2140) - Moved next.js `static` directory to `public/static`.

* [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29) [#2189](https://github.com/keystonejs/keystone/pull/2189) - Upgraded prettier to 1.19.1 and formatted code accordingly.

- [`83ef6bd3`](https://github.com/keystonejs/keystone/commit/83ef6bd3fe9aeab3f80536cd98c3e84a6046fe03) [#2141](https://github.com/keystonejs/keystone/pull/2141) - Fixed `next.js` warning for `<Container />` in \_app.js.

* [`f0235b7d`](https://github.com/keystonejs/keystone/commit/f0235b7df9d5ee3118c40a056a559d59f186a518) [#2149](https://github.com/keystonejs/keystone/pull/2149) - Updated `eslint` dependencies.
* Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a), [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29), [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104), [`05d07adf`](https://github.com/keystonejs/keystone/commit/05d07adf84059ff565cd2394f68d71d92e657485), [`78193f9c`](https://github.com/keystonejs/keystone/commit/78193f9c9d93655fb0d4b8dc494fbe4c622a4d64)]:
  - @keystonejs/app-admin-ui@5.5.3
  - @keystonejs/fields-wysiwyg-tinymce@5.0.4
  - @keystonejs/fields@6.0.5
  - @keystonejs/file-adapters@5.3.1
  - @keystonejs/keystone@5.4.1
  - @keystonejs/adapter-mongoose@5.1.4

## 5.0.3

### Patch Changes

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Fixed errors in Blog demo New Post page. Includes updating apollo-boost to 0.4.4.
- Updated dependencies [[`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62)]:
  - @keystonejs/fields@6.0.2
  - @keystonejs/fields-wysiwyg-tinymce@5.0.3
  - @keystonejs/app-admin-ui@5.4.1
  - @keystonejs/app-graphql@5.0.2
  - @keystonejs/file-adapters@5.3.0

## 5.0.2

### Patch Changes

- [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866) [#1995](https://github.com/keystonejs/keystone/pull/1995) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `react` and `react-dom` to 16.12.0.

* [`f3e99022`](https://github.com/keystonejs/keystone/commit/f3e990222f35889163b4976e4465729fd25d416f) [#1955](https://github.com/keystonejs/keystone/pull/1955) Thanks [@gautamsi](https://github.com/gautamsi)! - Upgraded NextJs to `^9.1.0` from `^9.0.0`.
* Updated dependencies [[`77056ebd`](https://github.com/keystonejs/keystone/commit/77056ebdb31e58d27372925e8e24311a8c7d9e33), [`267dab2f`](https://github.com/keystonejs/keystone/commit/267dab2fee5bbea711c417c13366862e8e0ab3be), [`8188d76c`](https://github.com/keystonejs/keystone/commit/8188d76cb3f5d3e112ef95fd4e1887db9a520d9d), [`5b81152d`](https://github.com/keystonejs/keystone/commit/5b81152d72b16bcfa2ef16620721b059cb225d05), [`af1e9e4d`](https://github.com/keystonejs/keystone/commit/af1e9e4d3b74753b903b20641b51df99184793df), [`733ac847`](https://github.com/keystonejs/keystone/commit/733ac847cab488dc92a30e7b458191d750fd5a3d), [`e68fc43b`](https://github.com/keystonejs/keystone/commit/e68fc43ba006f9c958f9c81ae20b230d05c2cab6), [`d4d89836`](https://github.com/keystonejs/keystone/commit/d4d89836700413c1da2b76e9b82b649c2cac859d), [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866), [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f), [`f3e99022`](https://github.com/keystonejs/keystone/commit/f3e990222f35889163b4976e4465729fd25d416f), [`3d2c2b2e`](https://github.com/keystonejs/keystone/commit/3d2c2b2e65943be0bd59e448d3237c3abe983b04), [`640cbd95`](https://github.com/keystonejs/keystone/commit/640cbd9556cb8848fdfbe9689ac4aadd1be29fba), [`1f4dc33d`](https://github.com/keystonejs/keystone/commit/1f4dc33d8a5ac4e38427eb215a7a8bc3504ae153), [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071), [`0145f7e2`](https://github.com/keystonejs/keystone/commit/0145f7e21d9297e3037c709587eb3b4220ba3f01), [`1ad222ed`](https://github.com/keystonejs/keystone/commit/1ad222ed27b2f261f8fda8eb819027553ecd0cd2), [`2cc83b12`](https://github.com/keystonejs/keystone/commit/2cc83b12be757019ba25658139478e8f5b2b19c6), [`fb0c8331`](https://github.com/keystonejs/keystone/commit/fb0c83316c1f3e6796a24480d3cfc8055355a7fc), [`945ff089`](https://github.com/keystonejs/keystone/commit/945ff089a60e5a1e1a8cdceb8df1b04f8d6263f4), [`a1dcbd7b`](https://github.com/keystonejs/keystone/commit/a1dcbd7bd7448fdcacbfe9fb0196bfee3c4a5326), [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64)]:
  - @keystonejs/keystone@5.3.0
  - @keystonejs/fields@6.0.0
  - @keystonejs/app-admin-ui@5.3.0
  - @keystonejs/email@5.0.2
  - @keystonejs/fields-wysiwyg-tinymce@5.0.2
  - @keystonejs/adapter-mongoose@5.1.3
  - @keystonejs/app-next@5.0.1
  - @keystonejs/file-adapters@5.2.0
  - @keystonejs/app-graphql@5.0.1
  - @keystonejs/auth-password@5.0.1

## 5.0.1

### Patch Changes

- [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad) [#1819](https://github.com/keystonejs/keystone/pull/1819) Thanks [@w01fgang](https://github.com/w01fgang)! - Upgraded `@emotion/core` and `@emotion/styled`.

* [`5595e4c4`](https://github.com/keystonejs/keystone/commit/5595e4c45c618fa7e13a3d91e3ea3892b4f10475) [#1808](https://github.com/keystonejs/keystone/pull/1808) Thanks [@gautamsi](https://github.com/gautamsi)! - Upgraded `react-apollo` and replaced use of `react-apollo-hooks` with `react-apollo`. `react-apollo` has a similar hooks API to `react-apollo-hooks`.
* Updated dependencies [[`45fd7ab8`](https://github.com/keystonejs/keystone/commit/45fd7ab899655364d0071c0d276d188378944ff5), [`8735393e`](https://github.com/keystonejs/keystone/commit/8735393ec7b01dd0491700244e915b4b47c1cc53), [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad), [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad), [`b0756c65`](https://github.com/keystonejs/keystone/commit/b0756c65525625919c72364d8cefc32d864c7c0e), [`20632bca`](https://github.com/keystonejs/keystone/commit/20632bca495058f2845d36fe95650eede0a9ebdc), [`3138013c`](https://github.com/keystonejs/keystone/commit/3138013c49205bd7f9b05833ae6158ebeb281dc0), [`d132a3c6`](https://github.com/keystonejs/keystone/commit/d132a3c64aec707b98ed9a9ceffee44a98749b0a), [`ba8aef71`](https://github.com/keystonejs/keystone/commit/ba8aef71d1a04f643fb7f7590d7d6d136b1d4eba), [`5595e4c4`](https://github.com/keystonejs/keystone/commit/5595e4c45c618fa7e13a3d91e3ea3892b4f10475), [`b17b50c0`](https://github.com/keystonejs/keystone/commit/b17b50c0783dd246786aad1de41136967ad73b5c), [`479597e0`](https://github.com/keystonejs/keystone/commit/479597e0920cbedf28f76c14a95b564282f2c1d9)]:
  - @keystonejs/keystone@5.1.1
  - @keystonejs/email@5.0.1
  - @keystonejs/app-admin-ui@5.0.2
  - @keystonejs/fields@5.1.0
  - @keystonejs/fields-wysiwyg-tinymce@5.0.1
  - @keystonejs/adapter-mongoose@5.1.1

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/adapter-mongoose@5.0.0
  - @keystonejs/app-admin-ui@5.0.0
  - @keystonejs/app-graphql@5.0.0
  - @keystonejs/app-next@5.0.0
  - @keystonejs/auth-password@5.0.0
  - @keystonejs/email@5.0.0
  - @keystonejs/fields-wysiwyg-tinymce@5.0.0
  - @keystonejs/fields@5.0.0
  - @keystonejs/file-adapters@5.0.0
  - @keystonejs/keystone@5.0.0
  - @keystonejs/session@5.0.0

# @keystone-alpha/demo-project-meetup

## 0.3.7

### Patch Changes

- Updated dependencies [[`0a36b0f4`](https://github.com/keystonejs/keystone/commit/0a36b0f403da73a76106b5e14940a789466b4f94), [`7129c887`](https://github.com/keystonejs/keystone/commit/7129c8878a825d961f2772be497dcd5bd6b2b697), [`3bc02545`](https://github.com/keystonejs/keystone/commit/3bc025452fb8e6e69790bdbee032ddfdeeb7dabb), [`768420f5`](https://github.com/keystonejs/keystone/commit/768420f567c244d57a4e2a3aaafe628ea9813d9d), [`a48281ba`](https://github.com/keystonejs/keystone/commit/a48281ba605bf5bebc89fcbb36d3e69c17182eec), [`a8ee0179`](https://github.com/keystonejs/keystone/commit/a8ee0179842f790dd3b5d4aae3524793e752ee26), [`effc1f63`](https://github.com/keystonejs/keystone/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/keystone@16.1.0
  - @keystone-alpha/app-graphql@8.2.1
  - @keystone-alpha/adapter-mongoose@6.0.1
  - @keystone-alpha/app-admin-ui@5.10.3
  - @keystone-alpha/fields@15.0.0
  - @keystone-alpha/auth-password@1.0.6
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.10

## 0.3.6

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/adapter-mongoose@6.0.0
  - @keystone-alpha/fields@14.0.0
  - @keystone-alpha/keystone@16.0.0
  - @keystone-alpha/app-admin-ui@5.10.2
  - @keystone-alpha/auth-password@1.0.5
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.9

## 0.3.5

- Updated dependencies [4e6a574d](https://github.com/keystonejs/keystone/commit/4e6a574d):
- Updated dependencies [b96a3a58](https://github.com/keystonejs/keystone/commit/b96a3a58):
  - @keystone-alpha/app-admin-ui@5.10.0
  - @keystone-alpha/auth-password@1.0.4
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.8
  - @keystone-alpha/keystone@15.3.1
  - @keystone-alpha/fields@13.0.0
  - @keystone-alpha/adapter-mongoose@5.0.0

## 0.3.4

- Updated dependencies [d316166e](https://github.com/keystonejs/keystone/commit/d316166e):
  - @keystone-alpha/file-adapters@2.0.0

## 0.3.3

- Updated dependencies [42a45bbd](https://github.com/keystonejs/keystone/commit/42a45bbd):
  - @keystone-alpha/adapter-mongoose@4.0.7
  - @keystone-alpha/keystone@15.1.0

## 0.3.2

- Updated dependencies [b61289b4](https://github.com/keystonejs/keystone/commit/b61289b4):
- Updated dependencies [0bba9f07](https://github.com/keystonejs/keystone/commit/0bba9f07):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone/commit/9ade2b2d):
  - @keystone-alpha/adapter-mongoose@4.0.6
  - @keystone-alpha/keystone@15.0.0
  - @keystone-alpha/app-admin-ui@5.8.1
  - @keystone-alpha/auth-password@1.0.2
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.7
  - @keystone-alpha/fields@12.0.0

## 0.3.1

- Updated dependencies [decf7319](https://github.com/keystonejs/keystone/commit/decf7319):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone/commit/89c0d7e9):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone/commit/89c0d7e9):
- Updated dependencies [f8ad0975](https://github.com/keystonejs/keystone/commit/f8ad0975):
- Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone/commit/a8e9378d):
  - @keystone-alpha/adapter-mongoose@4.0.5
  - @keystone-alpha/keystone@14.0.0
  - @keystone-alpha/app-admin-ui@5.8.0
  - @keystone-alpha/auth-password@1.0.1
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.6
  - @keystone-alpha/fields@11.0.0
  - @keystone-alpha/app-graphql@8.0.0

## 0.3.0

### Minor Changes

- [79e362c0](https://github.com/keystonejs/keystone/commit/79e362c0): update demos to use apollo hooks instead of Query and Mutations.

## 0.2.3

- Updated dependencies [8d0d98c7](https://github.com/keystonejs/keystone/commit/8d0d98c7):
  - @keystone-alpha/adapter-mongoose@4.0.4
  - @keystone-alpha/app-graphql@7.0.0
  - @keystone-alpha/keystone@13.0.0

## 0.2.2

### Patch Changes

- [30f6b7eb](https://github.com/keystonejs/keystone/commit/30f6b7eb): upgraded `react-toast-notifications` to `2.2.4`. use `useToasts` hook when possible.

## 0.2.1

- Updated dependencies [33001656](https://github.com/keystonejs/keystone/commit/33001656):
  - @keystone-alpha/adapter-mongoose@4.0.3
  - @keystone-alpha/keystone@12.0.0

## 0.2.0

### Minor Changes

- [e42fdb4a](https://github.com/keystonejs/keystone/commit/e42fdb4a): Makes the password auth strategy its own package.
  Previously: `const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');`
  After change: `const { PasswordAuthStrategy } = require('@keystone-alpha/auth-password');`

## 0.1.9

- Updated dependencies [b86f0e26](https://github.com/keystonejs/keystone/commit/b86f0e26):
  - @keystone-alpha/adapter-mongoose@4.0.1
  - @keystone-alpha/keystone@10.5.0

## 0.1.8

- Updated dependencies [144e6e86](https://github.com/keystonejs/keystone/commit/144e6e86):
  - @keystone-alpha/fields@10.2.0
  - @keystone-alpha/adapter-mongoose@4.0.0
  - @keystone-alpha/keystone@10.0.0

## 0.1.7

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade emotion to 10.0.14
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade eslint to 6.0.1
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade express to 4.17.1

- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9):
- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9):
  - @keystone-alpha/adapter-mongoose@3.0.0
  - @keystone-alpha/keystone@9.0.0
  - @keystone-alpha/fields@10.0.0
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.5
  - @keystone-alpha/app-admin-ui@5.1.0

## 0.1.6

- Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone/commit/4007f5dd):
  - @keystone-alpha/adapter-mongoose@2.2.1
  - @keystone-alpha/keystone@8.0.0
  - @keystone-alpha/fields@9.1.0

## 0.1.5

### Patch Changes

- [db212300](https://github.com/keystonejs/keystone/commit/db212300):

  Upgrade next to v9 and remove support for next-routes. You should switch to the native support for dynamic routes in next@9

* Updated dependencies [2b094b7f](https://github.com/keystonejs/keystone/commit/2b094b7f):
  - @keystone-alpha/app-admin-ui@5.0.4
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.4
  - @keystone-alpha/fields@9.0.0
  - @keystone-alpha/keystone@7.0.3

## 0.1.4

### Patch Changes

- [aa9d8920](https://github.com/keystonejs/keystone/commit/aa9d8920):

  Remove commercial font Nueu Haas Unica from Open Source library

## 0.1.3

- Updated dependencies [b6a9f6b9](https://github.com/keystonejs/keystone/commit/b6a9f6b9):
  - @keystone-alpha/app-admin-ui@5.0.3
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.3
  - @keystone-alpha/keystone@7.0.2
  - @keystone-alpha/fields@8.0.0

## 0.1.2

- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):
  - @keystone-alpha/adapter-mongoose@2.2.0
  - @keystone-alpha/keystone@7.0.0

## 0.1.1

### Patch Changes

- [7086b423](https://github.com/keystonejs/keystone/commit/7086b423):

  Use latest (un)authenticate mutations

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone/commit/30c1b1e1):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):
  - @keystone-alpha/app-admin-ui@5.0.0
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.1
  - @keystone-alpha/keystone@6.0.0
  - @keystone-alpha/fields@7.0.0
  - @keystone-alpha/adapter-mongoose@2.1.0
  - @keystone-alpha/app-graphql@6.1.0
  - @keystone-alpha/session@2.0.0

## 0.1.0

### Minor Changes

- [dfcabe6a](https://github.com/keystonejs/keystone/commit/dfcabe6a):

  Specify custom servers from within the index.js file

  - Major Changes:
    - The `index.js` export for `admin` must now be exported in the `servers`
      array:
      ```diff
       module.exports = {
         keystone,
      -  admin,
      +  apps: [admin],
       }
      ```
    - The `keystone.prepare()` method (often used within a _Custom Server_
      `server.js`) no longer returns a `server`, it now returns a `middlewares`
      array:
      ```diff
      +const express = require('express');
       const port = 3000;
       keystone.prepare({ port })
      -  .then(async ({ server, keystone: keystoneApp }) => {
      +  .then(async ({ middlewares, keystone: keystoneApp }) => {
           await keystoneApp.connect();
      -    await server.start();
      +    const app = express();
      +    app.use(middlewares);
      +    app.listen(port)
         });
      ```

### Patch Changes

- [92f69b5c](https://github.com/keystonejs/keystone/commit/92f69b5c):

  Use KS5 built-in login routes

- [a98bce08](https://github.com/keystonejs/keystone/commit/a98bce08):

  Add support for an `onConnect` function to be passed to the Keystone constructor, which is called when all adapters have connected.

- [8494e4cc](https://github.com/keystonejs/keystone/commit/8494e4cc):

  `@keystone-alpha/app-admin-ui` no longer accepts a `keystone` paramater in its constructor. It is now automatically passed during the `keystone.prepare()` call.

* Updated dependencies [666e15f5](https://github.com/keystonejs/keystone/commit/666e15f5):
* Updated dependencies [b2651279](https://github.com/keystonejs/keystone/commit/b2651279):
  - @keystone-alpha/keystone@5.0.0
  - @keystone-alpha/app-admin-ui@4.0.0
  - @keystone-alpha/app-graphql@6.0.0

## 0.0.2

### Patch Changes

- [9b6fec3e](https://github.com/keystonejs/keystone/commit/9b6fec3e):

  Remove unnecessary dependency from packages

* Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone/commit/9a0456ff):
  - @keystone-alpha/fields@6.1.1
  - @keystone-alpha/adapter-mongoose@2.0.0

## 0.0.1

### Patch Changes

- [0ea974f9](https://github.com/keystonejs/keystone/commit/0ea974f9):

  Add to changeset set, so we don't end up in an error state

- [b22d6c16](https://github.com/keystonejs/keystone/commit/b22d6c16):

  Remove custom server execution from the CLI.

  The Keystone CLI does not execute custom servers anymore, instead of running `keystone` to start a Keystone instance that has a custom server, run the server file directly with `node`.

  ```diff
  - "start": "keystone",
  + "start": "node server.js"
  ```

- [6f598e83](https://github.com/keystonejs/keystone/commit/6f598e83):

  - Add Admin UI static building

* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone/commit/9dbed649):
  - @keystone-alpha/admin-ui@3.2.0
  - @keystone-alpha/fields-wysiwyg-tinymce@2.0.0
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/fields@6.0.0
