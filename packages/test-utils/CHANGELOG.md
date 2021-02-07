# @keystonejs/test-utils

## 11.1.3

### Patch Changes

- Updated dependencies [[`75d3c521e`](https://github.com/keystonejs/keystone/commit/75d3c521e4f1f0a1eec9bc91319839a2afc000e0)]:
  - @keystone-next/keystone@9.3.1

## 11.1.2

### Patch Changes

- Updated dependencies [[`26543bd07`](https://github.com/keystonejs/keystone/commit/26543bd0752c470e336d61644c14e6a5333f65c0), [`3c1fa3203`](https://github.com/keystonejs/keystone/commit/3c1fa3203a6a9eeb2525c256f858f2e6cebea804), [`fd0dff3fd`](https://github.com/keystonejs/keystone/commit/fd0dff3fdfcbe20b2884357a6e1b20f1b7307652), [`096927a68`](https://github.com/keystonejs/keystone/commit/096927a6813a23030988ba8b64b2e8452f571a33)]:
  - @keystone-next/keystone@9.3.0
  - @keystonejs/keystone@19.1.0

## 11.1.1

### Patch Changes

- [`94fbb45f1`](https://github.com/keystonejs/keystone/commit/94fbb45f1920781423f6a8e489e812b74a260099) [#4728](https://github.com/keystonejs/keystone/pull/4728) Thanks [@timleslie](https://github.com/timleslie)! - Added new CLI options to support migrations in the Prisma adapter: `prototype`, `reset`, `generate`, and `deploy`.

- Updated dependencies [[`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf), [`94fbb45f1`](https://github.com/keystonejs/keystone/commit/94fbb45f1920781423f6a8e489e812b74a260099), [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d), [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9)]:
  - @keystonejs/adapter-prisma@3.0.0
  - @keystone-next/keystone@9.2.0
  - @keystonejs/adapter-knex@13.0.0
  - @keystonejs/adapter-mongoose@11.0.0
  - @keystonejs/keystone@19.0.0

## 11.1.0

### Minor Changes

- [`fe0c228b1`](https://github.com/keystonejs/keystone/commit/fe0c228b12530f6d384fa5eed9d5086768a24782) [#4676](https://github.com/keystonejs/keystone/pull/4676) Thanks [@timleslie](https://github.com/timleslie)! - Prisma artefacts are now generated in the `.keystone/prisma` directory.

### Patch Changes

- [`fc2b7101f`](https://github.com/keystonejs/keystone/commit/fc2b7101f35f20e4d729269a005816546bb37464) [#4691](https://github.com/keystonejs/keystone/pull/4691) Thanks [@timleslie](https://github.com/timleslie)! - Use the PrismaAdapter `prototype` migration mode.

- Updated dependencies [[`fe0c228b1`](https://github.com/keystonejs/keystone/commit/fe0c228b12530f6d384fa5eed9d5086768a24782), [`6b95cb6e4`](https://github.com/keystonejs/keystone/commit/6b95cb6e4d5bea3a87e22765d5fcf31db2fc31ae), [`fc2b7101f`](https://github.com/keystonejs/keystone/commit/fc2b7101f35f20e4d729269a005816546bb37464), [`e7d4d54e5`](https://github.com/keystonejs/keystone/commit/e7d4d54e5b94e6b376d6eab28a0f2b074f2c95ed), [`ac3db9561`](https://github.com/keystonejs/keystone/commit/ac3db95613093de83e2369f624ce9b6c77bb8eda), [`f162a9d72`](https://github.com/keystonejs/keystone/commit/f162a9d72859ae7f2932bf0859c712861918b9e6), [`a62a2d996`](https://github.com/keystonejs/keystone/commit/a62a2d996f1080051f7962b7063ae37d7e8b7e63)]:
  - @keystone-next/keystone@9.1.0
  - @keystonejs/adapter-prisma@2.0.0

## 11.0.0

### Major Changes

- [`6ea4ff3cf`](https://github.com/keystonejs/keystone/commit/6ea4ff3cf77d5d2278bf4f0415d11aa7399a0490) [#4660](https://github.com/keystonejs/keystone/pull/4660) Thanks [@timleslie](https://github.com/timleslie)! - Converted `@keystonejs/test-utils` to TypeScript.

### Patch Changes

- Updated dependencies [[`49eec4dea`](https://github.com/keystonejs/keystone/commit/49eec4dea522c6a043b3eaf93fc8be8256b00aa6), [`3b7a056bb`](https://github.com/keystonejs/keystone/commit/3b7a056bb835482ceb408a70bf97300741552d19), [`4768fbf83`](https://github.com/keystonejs/keystone/commit/4768fbf831ffff648e540c479a1954ae40e05aaa), [`59027f8a4`](https://github.com/keystonejs/keystone/commit/59027f8a41cb11632f7c1eb5b3a8092193ecc87e), [`e11b111c7`](https://github.com/keystonejs/keystone/commit/e11b111c7e4a87c7a31108b9f5adbc546caaac35), [`283a6694a`](https://github.com/keystonejs/keystone/commit/283a6694ac461d0be980d7796f88efadd4fe108e), [`7ffd2ebb4`](https://github.com/keystonejs/keystone/commit/7ffd2ebb42dfaf12e23ba166b44ec4db60d9824b), [`0df2fb79c`](https://github.com/keystonejs/keystone/commit/0df2fb79c56094b5cdc0be6a0d6c2812ff0ec7f9), [`d090053df`](https://github.com/keystonejs/keystone/commit/d090053df9545380c42ddd18fae6782f3c3e2719), [`74a8528ea`](https://github.com/keystonejs/keystone/commit/74a8528ea0dad739f4f16af32fe4f8926a188b61)]:
  - @keystonejs/adapter-prisma@1.1.2
  - @keystonejs/keystone@18.1.0
  - @keystone-next/keystone@9.0.2
  - @keystonejs/adapter-knex@12.0.4
  - @keystonejs/adapter-mongoose@10.1.2
  - @keystonejs/app-graphql@6.2.1

## 10.1.3

### Patch Changes

- Updated dependencies []:
  - @keystone-next/keystone@9.0.1

## 10.1.2

### Patch Changes

- Updated dependencies [[`933c78a1e`](https://github.com/keystonejs/keystone/commit/933c78a1edc070b63f7720f64c15421ba28bdde5), [`89f7d4599`](https://github.com/keystonejs/keystone/commit/89f7d459906072940da1355c38815d1b3ef49368), [`abc5440dc`](https://github.com/keystonejs/keystone/commit/abc5440dc5ee8d8cdd6ddddb32cf21bd2c3fc324), [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95), [`cf2819544`](https://github.com/keystonejs/keystone/commit/cf2819544426def260ada5eb18fdc9b8a01e9438), [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95)]:
  - @keystone-next/keystone@9.0.0
  - @keystonejs/keystone@18.0.0
  - @keystonejs/app-graphql@6.2.0
  - @keystonejs/adapter-mongoose@10.1.1
  - @keystonejs/adapter-knex@12.0.3
  - @keystonejs/adapter-prisma@1.1.1

## 10.1.1

### Patch Changes

- Updated dependencies [[`075ef1628`](https://github.com/keystonejs/keystone/commit/075ef16281a89c8291f90275adca98f042cc54da)]:
  - @keystone-next/keystone@8.0.0

## 10.1.0

### Minor Changes

- [`32aee8503`](https://github.com/keystonejs/keystone/commit/32aee85035b4ff123b0270d142ee0f3cf27a6ac8) [#4510](https://github.com/keystonejs/keystone/pull/4510) Thanks [@timleslie](https://github.com/timleslie)! - Added a function `setupFromConfig` to support running tests against systems defined with the new config API.

### Patch Changes

- [`efe97de24`](https://github.com/keystonejs/keystone/commit/efe97de24bd1de7a0f50bcbee6b445f4eef7311b) [#4522](https://github.com/keystonejs/keystone/pull/4522) Thanks [@timleslie](https://github.com/timleslie)! - Internally factored out `argGenerator` to support different system setup functions.

- Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`2d3668c49`](https://github.com/keystonejs/keystone/commit/2d3668c49d1913afecbacf2b5ef164e553210956), [`e33cf0c1e`](https://github.com/keystonejs/keystone/commit/e33cf0c1e78ae69cffaf45009e47ca1198464cf2), [`fd5daefb4`](https://github.com/keystonejs/keystone/commit/fd5daefb4966b10cf8047386d19db14d325ef8c5), [`44c78319e`](https://github.com/keystonejs/keystone/commit/44c78319ed8cfb1000eb4b1aca5eb361376584b4), [`defd05365`](https://github.com/keystonejs/keystone/commit/defd05365f31d0d6d4b6fd9ffe0a0c3928f97e79), [`6d09df338`](https://github.com/keystonejs/keystone/commit/6d09df3381d1682b8002d52ed1696b661fdff035), [`4d3cb8e32`](https://github.com/keystonejs/keystone/commit/4d3cb8e32b22250fdbe04af758b0aad727ba63e4), [`a3908a675`](https://github.com/keystonejs/keystone/commit/a3908a675614fa8690ea641a124cc57c9f963618), [`d329f07a5`](https://github.com/keystonejs/keystone/commit/d329f07a5ce7ebf5d658a7f90334ba4372a2a72d), [`c1e8def9a`](https://github.com/keystonejs/keystone/commit/c1e8def9a4204d685a796e267edc50f6ef2e8c51), [`481e456ac`](https://github.com/keystonejs/keystone/commit/481e456ac4158207436ddd9be18fdca0f27b6409), [`08398473b`](https://github.com/keystonejs/keystone/commit/08398473bb81dfd43a3c134ed8de61e45aa770f0), [`2308e5efc`](https://github.com/keystonejs/keystone/commit/2308e5efc7c6893c87652411496b15a8124f6e05)]:
  - @keystonejs/adapter-mongoose@10.1.0
  - @keystone-next/keystone@7.0.0
  - @keystonejs/adapter-prisma@1.1.0

## 10.0.0

### Major Changes

- [`31ad142ea`](https://github.com/keystonejs/keystone/commit/31ad142ea058b178e2eda34e7ca4a29d1e99299c) [#4014](https://github.com/keystonejs/keystone/pull/4014) Thanks [@timleslie](https://github.com/timleslie)! - Renamed the `multiAdapterRunners` option `prisma` to `prisma_postgresql` to allow room for other Prisma variants in the future.

### Patch Changes

- Updated dependencies [[`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da), [`3dd5c570a`](https://github.com/keystonejs/keystone/commit/3dd5c570a27d0795a689407d96fc9623c90a66df), [`f2b841b90`](https://github.com/keystonejs/keystone/commit/f2b841b90d5ac8adece645df45b8a17832391b50)]:
  - @keystonejs/adapter-mongoose@10.0.1
  - @keystonejs/keystone@17.1.1
  - @keystonejs/adapter-prisma@1.0.7

## 9.1.0

### Minor Changes

- [`e3455bd20`](https://github.com/keystonejs/keystone/commit/e3455bd2027534db29d1f9a8bca905f8eb33679e) [#3979](https://github.com/keystonejs/keystone/pull/3979) Thanks [@timleslie](https://github.com/timleslie)! - Added support for the `TEST_ADAPTER` environment variable to select a single adapter when running tests.

### Patch Changes

- [`874fb3377`](https://github.com/keystonejs/keystone/commit/874fb337786dba2a2513f754bdfb2ab93ac81598) [#4009](https://github.com/keystonejs/keystone/pull/4009) Thanks [@timleslie](https://github.com/timleslie)! - Added a `provider` config option to `PrismaAdapter`. Only `postgresql` is currently supported, and this is the default value.

- Updated dependencies [[`c4478b1c7`](https://github.com/keystonejs/keystone/commit/c4478b1c74e205232ecb321de91f0eda0e78b819), [`874fb3377`](https://github.com/keystonejs/keystone/commit/874fb337786dba2a2513f754bdfb2ab93ac81598)]:
  - @keystonejs/adapter-knex@12.0.2
  - @keystonejs/adapter-prisma@1.0.6

## 9.0.1

### Patch Changes

- [`28354a02f`](https://github.com/keystonejs/keystone/commit/28354a02f7bc3ee79e2cb4c299ece6126433c909) [#3846](https://github.com/keystonejs/keystone/pull/3846) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `mongodb-memory-server-core` to `^6.9.0`.

- Updated dependencies [[`f30928db3`](https://github.com/keystonejs/keystone/commit/f30928db31b0c0a10a27b827b44afc1896dfbafe), [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74), [`bf06edbf4`](https://github.com/keystonejs/keystone/commit/bf06edbf47e69280c3a9e270daa578528d68c447), [`85fa68456`](https://github.com/keystonejs/keystone/commit/85fa684565d8c9c40036d4544b3c0235dbbd327b)]:
  - @keystonejs/adapter-prisma@1.0.3
  - @keystonejs/adapter-knex@12.0.0
  - @keystonejs/adapter-mongoose@10.0.0

## 9.0.0

### Major Changes

- [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4) [#3298](https://github.com/keystonejs/keystone/pull/3298) Thanks [@timleslie](https://github.com/timleslie)! - Added support for a Prisma adapter to Keystone.

### Patch Changes

- [`966b5bc70`](https://github.com/keystonejs/keystone/commit/966b5bc7003e0f580528c4dcd46647cc4124b592) [#3737](https://github.com/keystonejs/keystone/pull/3737) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `mongodb-memory-server-core` to `^6.8.0`.

- Updated dependencies [[`8c54a34be`](https://github.com/keystonejs/keystone/commit/8c54a34bec0f5f945447a2475f5500415eb154df), [`966b5bc70`](https://github.com/keystonejs/keystone/commit/966b5bc7003e0f580528c4dcd46647cc4124b592), [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4), [`3e2ca3a2f`](https://github.com/keystonejs/keystone/commit/3e2ca3a2ffa00cb5aababee572902a78e657ec58), [`bf5801070`](https://github.com/keystonejs/keystone/commit/bf5801070568bbcc1ed4f3394a293bfa5bea8b98), [`cc56990f2`](https://github.com/keystonejs/keystone/commit/cc56990f2e9a4ecf0c112362e8d472b9286f76bc), [`df0687184`](https://github.com/keystonejs/keystone/commit/df068718456d23819a7cae491870be4560b2010d), [`cc56990f2`](https://github.com/keystonejs/keystone/commit/cc56990f2e9a4ecf0c112362e8d472b9286f76bc)]:
  - @keystonejs/adapter-knex@11.0.7
  - @keystonejs/adapter-mongoose@9.0.8
  - @keystonejs/adapter-prisma@1.0.0
  - @keystonejs/keystone@17.0.0

## 8.0.4

### Patch Changes

- [`06dffc42b`](https://github.com/keystonejs/keystone/commit/06dffc42b08062e3166880146c8fb606493ead12) [#3682](https://github.com/keystonejs/keystone/pull/3682) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `mongodb-memory-server-core` to `^6.7.6`.

* [`7956d5da0`](https://github.com/keystonejs/keystone/commit/7956d5da00197dc11f5d54f7870b8fa72c05a3c0) [#3653](https://github.com/keystonejs/keystone/pull/3653) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `mongodb-memory-server-core` to `^6.7.5`.

* Updated dependencies [[`06dffc42b`](https://github.com/keystonejs/keystone/commit/06dffc42b08062e3166880146c8fb606493ead12), [`7a1f8bbdc`](https://github.com/keystonejs/keystone/commit/7a1f8bbdcdf68c9579e17db77fa826e811abcab4), [`83007be79`](https://github.com/keystonejs/keystone/commit/83007be798ebd751d7eb708cde366dc35999af72), [`38e3ad9c3`](https://github.com/keystonejs/keystone/commit/38e3ad9c3e7124d06f11c7046821c857cf7f9ad2), [`6f42b0a9d`](https://github.com/keystonejs/keystone/commit/6f42b0a9d231049f9e7523eb78ec621d9c9d6df9), [`5c1e55721`](https://github.com/keystonejs/keystone/commit/5c1e5572134fa93c9aefbb537676e30cafd0e7d9), [`304701d7c`](https://github.com/keystonejs/keystone/commit/304701d7c23e98c8dc40c0f3f5512a0370107c06), [`7a1f8bbdc`](https://github.com/keystonejs/keystone/commit/7a1f8bbdcdf68c9579e17db77fa826e811abcab4), [`d95010eea`](https://github.com/keystonejs/keystone/commit/d95010eea35f40274f412dad5c2fed6b16ae6c60), [`104232785`](https://github.com/keystonejs/keystone/commit/104232785aac856be6a3ba55f8fa0fd8357237ed), [`7956d5da0`](https://github.com/keystonejs/keystone/commit/7956d5da00197dc11f5d54f7870b8fa72c05a3c0)]:
  - @keystonejs/adapter-mongoose@9.0.7
  - @keystonejs/keystone@16.0.0
  - @keystonejs/app-graphql@6.1.3
  - @keystonejs/adapter-knex@11.0.6

## 8.0.3

### Patch Changes

- [`74ad0cf7a`](https://github.com/keystonejs/keystone/commit/74ad0cf7a1a08d7665575c13da9cfb0e5a692f22) [#3617](https://github.com/keystonejs/keystone/pull/3617) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `mongodb-memory-server-core` to `^6.7.0`.

- Updated dependencies [[`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a), [`d7eac6629`](https://github.com/keystonejs/keystone/commit/d7eac662956fc2dffd9ea5cfedf60e51ecc1b80d), [`77aa2d7d1`](https://github.com/keystonejs/keystone/commit/77aa2d7d156a83759a7f3c26e8c5bd019966b054), [`9dae7a5d0`](https://github.com/keystonejs/keystone/commit/9dae7a5d00a62cd0b7a4470695adc5e1678db3dc), [`d07f6bfb6`](https://github.com/keystonejs/keystone/commit/d07f6bfb6b3bd65036c2030d2758abdf4eca1a9e)]:
  - @keystonejs/adapter-knex@11.0.5
  - @keystonejs/keystone@15.0.0
  - @keystonejs/adapter-mongoose@9.0.6

## 8.0.2

### Patch Changes

- [`3b619327b`](https://github.com/keystonejs/keystone/commit/3b619327b3801501b96b9af04ec6ca90e9ad9469) [#3517](https://github.com/keystonejs/keystone/pull/3517) Thanks [@renovate](https://github.com/apps/renovate)! - Update dependency `mongodb-memory-server-core` to `^6.6.7`.

- Updated dependencies [[`cd15192cd`](https://github.com/keystonejs/keystone/commit/cd15192cdae5e476f64a257c196ca569a9440d5a), [`e9bc4367a`](https://github.com/keystonejs/keystone/commit/e9bc4367ac31f3fe3a2898198c600c76c42165b2), [`7bfdb79ee`](https://github.com/keystonejs/keystone/commit/7bfdb79ee43235418f098e5fe7412968dcf6c397), [`003b856e6`](https://github.com/keystonejs/keystone/commit/003b856e686cc1ee0f984c1acf024c1fa0c27837), [`d71f98791`](https://github.com/keystonejs/keystone/commit/d71f987917509a206b1e0a994dbc6641a7cf4e06), [`b3aa85031`](https://github.com/keystonejs/keystone/commit/b3aa850311cbc1622568f69f9cb4b9f46ab9db22), [`16fba3b98`](https://github.com/keystonejs/keystone/commit/16fba3b98271410e570a370f610da7cd0686f294), [`28b88abd3`](https://github.com/keystonejs/keystone/commit/28b88abd369f0df12eae72107db7c24323eda4b5)]:
  - @keystonejs/app-graphql@6.1.2
  - @keystonejs/keystone@14.0.2
  - @keystonejs/adapter-knex@11.0.4
  - @keystonejs/adapter-mongoose@9.0.5

## 8.0.1

### Patch Changes

- Updated dependencies [[`25f50dadc`](https://github.com/keystonejs/keystone/commit/25f50dadc07d888de18d485244c84d17462dce2e), [`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593), [`f714ac1e2`](https://github.com/keystonejs/keystone/commit/f714ac1e2c49ef44d756e35042bdb7da6db589a7), [`c243839c1`](https://github.com/keystonejs/keystone/commit/c243839c12abc8cffe8ff788fe57dcb880dc3a41)]:
  - @keystonejs/keystone@14.0.0
  - @keystonejs/adapter-knex@11.0.2
  - @keystonejs/adapter-mongoose@9.0.3

## 8.0.0

### Major Changes

- [`0369985e3`](https://github.com/keystonejs/keystone/commit/0369985e320afd6112f2664f8a8edc1ed7167130) [#3391](https://github.com/keystonejs/keystone/pull/3391) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `MockAdapter`, `MockListAdapter` and `MockIdType` classes from `@keystonejs/test-utils`.

* [`714316718`](https://github.com/keystonejs/keystone/commit/7143167187e3e3519b0b58e2b04ff0fee8fc75dc) [#3388](https://github.com/keystonejs/keystone/pull/3388) Thanks [@singhArmani](https://github.com/singhArmani)! - Removed the following redundant functions in tests, and used the equivalent `server-side-graphql-client` functions:

  - `graphqlRequest`:
    As all the access control checks are disabled by default, you can now use utility functions from `[server-side-graphql-client](https://github.com/keystonejs/keystone/blob/master/packages/server-side-graphql-client/lib/server-side-graphql-client.js)` to perform desired CRUD operations.
    Additionally, you can use `runCustomQuery` function to suit your requirements.

  `authedGraphqlRequest`

  - Similar to above, but you can also supply a custom `context` object if you don't want to override the access control checks.

  `matchFilter`

  - It has been removed in favour of the `[getItems](https://github.com/keystonejs/keystone/blob/cc5bb891579281338ad7fad0873531be81d877d4/packages/server-side-graphql-client/lib/server-side-graphql-client.js#L99)`.

  If you are using `multiAdapterRunners`, then the `testFn` function you write for your test will no longer be supplied with the following functions:

  - `create`
  - `findById`,
  - `findOne`,
  - `update`
  - `delete`

  Instead you can use the equivalent functions from `server-side-graphql-client` to achieve your desired results.

### Patch Changes

- [`cc5bb8915`](https://github.com/keystonejs/keystone/commit/cc5bb891579281338ad7fad0873531be81d877d4) [#3387](https://github.com/keystonejs/keystone/pull/3387) Thanks [@singhArmani](https://github.com/singhArmani)! - Refactored internals to use `server-side-graphql-client`.

- Updated dependencies [[`7e78ffdaa`](https://github.com/keystonejs/keystone/commit/7e78ffdaa96050e49e8e2678a3c4f1897fedae4f), [`0369985e3`](https://github.com/keystonejs/keystone/commit/0369985e320afd6112f2664f8a8edc1ed7167130)]:
  - @keystonejs/adapter-mongoose@9.0.2
  - @keystonejs/keystone@13.1.1

## 7.1.1

### Patch Changes

- [`5332988e3`](https://github.com/keystonejs/keystone/commit/5332988e3fafe6a3594f7dcecd79a9402df28015) [#3278](https://github.com/keystonejs/keystone/pull/3278) Thanks [@timleslie](https://github.com/timleslie)! - Replaced use of "p-finally" library with native Node code.

* [`2e10b1083`](https://github.com/keystonejs/keystone/commit/2e10b1083c0ab3925b877f16543c3d302f618313) [#3309](https://github.com/keystonejs/keystone/pull/3309) Thanks [@timleslie](https://github.com/timleslie)! - Simplified tests using the updated `test-utils` API.

* Updated dependencies [[`af5171563`](https://github.com/keystonejs/keystone/commit/af51715637433bcdd2538835c98ac71a8eb86122), [`271f1a40b`](https://github.com/keystonejs/keystone/commit/271f1a40b97e03aaa00ce920a6515b8f18669428), [`22b4a5c1a`](https://github.com/keystonejs/keystone/commit/22b4a5c1a13c3cca47190467be9d56e836f180f1), [`afe661e60`](https://github.com/keystonejs/keystone/commit/afe661e607539df13584d460e1016ba0fa883cb8), [`04f9be03d`](https://github.com/keystonejs/keystone/commit/04f9be03de7fe82035205379208511c6e49890b3), [`ef7074977`](https://github.com/keystonejs/keystone/commit/ef70749775ce1565eafd7f94c3d7438c8ebd474e), [`e07c42d4e`](https://github.com/keystonejs/keystone/commit/e07c42d4ec75d5703bec4a2e419a42d18bed90ca), [`5a3849806`](https://github.com/keystonejs/keystone/commit/5a3849806d00e62b722461d02f6e4639bc45c1eb)]:
  - @keystonejs/keystone@13.0.0
  - @keystonejs/app-graphql@6.1.0
  - @keystonejs/adapter-knex@11.0.1
  - @keystonejs/adapter-mongoose@9.0.1

## 7.1.0

### Minor Changes

- [`753fa13ab`](https://github.com/keystonejs/keystone/commit/753fa13ab976cebdd145f4da948e13244612eedb) [#3252](https://github.com/keystonejs/keystone/pull/3252) Thanks [@timleslie](https://github.com/timleslie)! - The `knex` adapter now accepts `DATABASE_URL` as an environment variable for the database location.

### Patch Changes

- [`49984caae`](https://github.com/keystonejs/keystone/commit/49984caaec803ed86b027c9634ac6b3f671e9ba7) [#3227](https://github.com/keystonejs/keystone/pull/3227) Thanks [@Vultraz](https://github.com/Vultraz)! - Moved `name` config option from Keystone constructor to Admin UI constructor.

* [`79d4c0d92`](https://github.com/keystonejs/keystone/commit/79d4c0d9250c1d1c1c46bcb2eaddae313eb7ac5f) [#3251](https://github.com/keystonejs/keystone/pull/3251) Thanks [@timleslie](https://github.com/timleslie)! - Improved error reporting in `matchFilter`.

* Updated dependencies [[`5ad84ccd8`](https://github.com/keystonejs/keystone/commit/5ad84ccd8d008188e293629e90a4d7e7fde55333), [`51c898537`](https://github.com/keystonejs/keystone/commit/51c898537c7fdc8578fa47eade6a499594b0d154), [`61cdafe20`](https://github.com/keystonejs/keystone/commit/61cdafe20e0a22b5a1f9b6a2dcc4aefa45a26902), [`8480f889a`](https://github.com/keystonejs/keystone/commit/8480f889a492d83ee805f19877d49fd112117939), [`49984caae`](https://github.com/keystonejs/keystone/commit/49984caaec803ed86b027c9634ac6b3f671e9ba7), [`02f069f0b`](https://github.com/keystonejs/keystone/commit/02f069f0b6e28ccfe6d5cdeb59ab01bde27a655e), [`e114894d1`](https://github.com/keystonejs/keystone/commit/e114894d1bbcea8940cf14486fc336aa8d112da7), [`5fc97cbf4`](https://github.com/keystonejs/keystone/commit/5fc97cbf4489587a3a8cb38c04ba81fc2cb1fc5a), [`56e1798d6`](https://github.com/keystonejs/keystone/commit/56e1798d6815723cfba01e6d7dc6b4fe73d4447b), [`06f86c6f5`](https://github.com/keystonejs/keystone/commit/06f86c6f5c573411f0efda565a269d1d7ccb3c66), [`81b4df318`](https://github.com/keystonejs/keystone/commit/81b4df3182fc63c583e3fae5c05c528b678cab95), [`e6909b003`](https://github.com/keystonejs/keystone/commit/e6909b0037c9d3dc4fc6131da7968a424ce02be9), [`c9ca62876`](https://github.com/keystonejs/keystone/commit/c9ca628765f1ecb599c8556de2d31567ddf12504), [`3ce644d5f`](https://github.com/keystonejs/keystone/commit/3ce644d5f2b6e674adb2f155c0e729536079347a), [`622cc7d69`](https://github.com/keystonejs/keystone/commit/622cc7d6976ecb71f5b135c931ac0fcb4afdb1c7), [`7bdec6446`](https://github.com/keystonejs/keystone/commit/7bdec6446ed97fa962bb96abe07975bb23c6ec7a)]:
  - @keystonejs/keystone@12.0.0
  - @keystonejs/adapter-knex@11.0.0
  - @keystonejs/adapter-mongoose@9.0.0
  - @keystonejs/app-graphql@6.0.0

## 7.0.1

### Patch Changes

- [`4ddc3dc6f`](https://github.com/keystonejs/keystone/commit/4ddc3dc6f87c192627d00db85a1080411400eeb5) [#3212](https://github.com/keystonejs/keystone/pull/3212) Thanks [@timleslie](https://github.com/timleslie)! - Removed `name` argument from calls to `setupServer` in tests.

- Updated dependencies [[`f296866df`](https://github.com/keystonejs/keystone/commit/f296866dfab3af54381fd527473e3dc98425b3b9), [`9ab6961e0`](https://github.com/keystonejs/keystone/commit/9ab6961e0202277a980bd60a323a1c599f1dd085)]:
  - @keystonejs/keystone@11.2.0
  - @keystonejs/app-graphql@5.1.9

## 7.0.0

### Major Changes

- [`c6eac2dc2`](https://github.com/keystonejs/keystone/commit/c6eac2dc2dec857c668a5794fd84829d164563f3) [#3159](https://github.com/keystonejs/keystone/pull/3159) Thanks [@timleslie](https://github.com/timleslie)! - Updated to use `keystone.executeGraphQL` for all server-side GraphQL operations.
  Removed the `operationName` argument from `graphqlRequest` and `authedGraphqlRequest`.

### Patch Changes

- Updated dependencies [[`3ecf74462`](https://github.com/keystonejs/keystone/commit/3ecf74462524f4940474eaf75eea958acbda9ee4)]:
  - @keystonejs/keystone@11.1.1

## 6.2.0

### Minor Changes

- [`950f23443`](https://github.com/keystonejs/keystone/commit/950f23443ef8f1a176a3cf6b039f93a29d954f5e) [#3138](https://github.com/keystonejs/keystone/pull/3138) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Moved adapter mocks into test utils package.

### Patch Changes

- Updated dependencies [[`dec3d336a`](https://github.com/keystonejs/keystone/commit/dec3d336adbe8156722fbe65f315a57b2f5c08e7), [`78a5d5a45`](https://github.com/keystonejs/keystone/commit/78a5d5a457f80bba592e5a81056125b11469a5a8), [`1c69f4dc8`](https://github.com/keystonejs/keystone/commit/1c69f4dc8ab1eb23bc0a34850f48a51f2e9f1dce), [`950f23443`](https://github.com/keystonejs/keystone/commit/950f23443ef8f1a176a3cf6b039f93a29d954f5e), [`3c3c67abb`](https://github.com/keystonejs/keystone/commit/3c3c67abb5ec82155fec893d389eac3bbeb12bbd)]:
  - @keystonejs/keystone@11.1.0

## 6.1.4

### Patch Changes

- Updated dependencies [[`8df24d2ab`](https://github.com/keystonejs/keystone/commit/8df24d2ab4bed8a7fc1a856c20a571781dd7c04e), [`33046a66f`](https://github.com/keystonejs/keystone/commit/33046a66f33a82cf099880303b44d9736344667d), [`7c38e2671`](https://github.com/keystonejs/keystone/commit/7c38e267143491f38699326f02764f40f337d416), [`835866e1a`](https://github.com/keystonejs/keystone/commit/835866e1a2954113d809c9f0bac186485ac6212b)]:
  - @keystonejs/keystone@11.0.0
  - @keystonejs/adapter-knex@10.1.0
  - @keystonejs/adapter-mongoose@8.1.3

## 6.1.3

### Patch Changes

- Updated dependencies [[`4104e1f15`](https://github.com/keystonejs/keystone/commit/4104e1f15c545c05f680e8d16413862e875ca57a), [`cbfc67470`](https://github.com/keystonejs/keystone/commit/cbfc6747011329f7210e79ebe228f44ed8607321), [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb), [`3204ae785`](https://github.com/keystonejs/keystone/commit/3204ae78576b0ab5649d5f5ae9cfbb1def347af1), [`4b06157be`](https://github.com/keystonejs/keystone/commit/4b06157be6cffde2d88969823f7c410fefd82317), [`839666e25`](https://github.com/keystonejs/keystone/commit/839666e25d8bffefd034e6344e11d72dd43b925b), [`64c0d68ac`](https://github.com/keystonejs/keystone/commit/64c0d68acb1ee969097a8fe59b5c296473790c5c), [`b696b2acb`](https://github.com/keystonejs/keystone/commit/b696b2acbf7def8dba41f46ccef5ff852703b95a), [`d970580e1`](https://github.com/keystonejs/keystone/commit/d970580e14904ba2f2ac5e969257e71f77ab67d7)]:
  - @keystonejs/keystone@10.0.0
  - @keystonejs/app-graphql@5.1.8
  - @keystonejs/adapter-knex@10.0.2
  - @keystonejs/adapter-mongoose@8.1.2

## 6.1.2

### Patch Changes

- [`ddd6b435`](https://github.com/keystonejs/keystone/commit/ddd6b435cc1301cd5ea1ff2e24fa827d9b46aea3) [#2889](https://github.com/keystonejs/keystone/pull/2889) Thanks [@timleslie](https://github.com/timleslie)! - Explicitly set `cookieSecret` in `Keystone` objects to prevent warnings.

- Updated dependencies [[`12126788`](https://github.com/keystonejs/keystone/commit/121267885eb3e279eb5b6d035568f547323dd245), [`e0e3e30a`](https://github.com/keystonejs/keystone/commit/e0e3e30a9051741de3f5a0c12ba00f2238d54800), [`c8e52f3b`](https://github.com/keystonejs/keystone/commit/c8e52f3ba892269922c1ed3af0c2114f07387704), [`2a1e4f49`](https://github.com/keystonejs/keystone/commit/2a1e4f49d7f234c49e5b04440ff786ddf3e9e7ed), [`9e2e0071`](https://github.com/keystonejs/keystone/commit/9e2e00715aff50f2ddfedf3dbc14f390275ff23b), [`b5c44934`](https://github.com/keystonejs/keystone/commit/b5c4493442c5e4cfeba23c058a9a6819c628aab9), [`0fbc5b98`](https://github.com/keystonejs/keystone/commit/0fbc5b989a9f96248d1bd7f2f589fe77cb1d8f7d), [`da1359df`](https://github.com/keystonejs/keystone/commit/da1359dfc1bff7e27505eff876efe3a0865bae2d), [`babed628`](https://github.com/keystonejs/keystone/commit/babed628a408d7da39990a4c89a19828468555a8), [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533), [`e765ad20`](https://github.com/keystonejs/keystone/commit/e765ad20abae9838f64b72b7d43767ec87db336a)]:
  - @keystonejs/keystone@9.0.0
  - @keystonejs/adapter-knex@10.0.0
  - @keystonejs/adapter-mongoose@8.1.0
  - @keystonejs/app-graphql@5.1.7

## 6.1.1

### Patch Changes

- [`3d40bd7d`](https://github.com/keystonejs/keystone/commit/3d40bd7dd39f2b5589012356dd2b1698eda4f0b2) [#2850](https://github.com/keystonejs/keystone/pull/2850) Thanks [@Vultraz](https://github.com/Vultraz)! - Switched to mongodb-memory-server-core.

* [`96f0c6e9`](https://github.com/keystonejs/keystone/commit/96f0c6e917ecdd02af8da52829608b003219d3ca) [#2845](https://github.com/keystonejs/keystone/pull/2845) Thanks [@timleslie](https://github.com/timleslie)! - Updated patch versions of dependencies.

* Updated dependencies [[`f266a692`](https://github.com/keystonejs/keystone/commit/f266a6923a24c84936d66e00ec7de0ea0956445b), [`8a135a88`](https://github.com/keystonejs/keystone/commit/8a135a88ae6f3a4434db0ba7033cad2e5f18651e)]:
  - @keystonejs/app-graphql@5.1.6
  - @keystonejs/keystone@8.1.4

## 6.1.0

### Minor Changes

- [`62f09391`](https://github.com/keystonejs/keystone/commit/62f093911879ca6b57ec0a06ce646e2296593c9a) [#2781](https://github.com/keystonejs/keystone/pull/2781) Thanks [@timleslie](https://github.com/timleslie)! - Added `authedGraphqlRequest` to support running queries with access control. Added `before` and `after` to the output of `multiAdapterRunners` to allow setting up a system to be shared across tests.

### Patch Changes

- Updated dependencies [[`98be4b48`](https://github.com/keystonejs/keystone/commit/98be4b4858f0f2cd672910acc5e6cc0c079ce21f), [`6a27fcf1`](https://github.com/keystonejs/keystone/commit/6a27fcf1896c5a745308346e5b0e66dd8bdd57a3), [`98e9f6d1`](https://github.com/keystonejs/keystone/commit/98e9f6d16e16ee13d2a8a22eb25be9cd2afc6fc0)]:
  - @keystonejs/adapter-knex@9.0.2
  - @keystonejs/keystone@8.1.2

## 6.0.3

### Patch Changes

- Updated dependencies [[`fd685241`](https://github.com/keystonejs/keystone/commit/fd68524135025e4d800b4a98932916736dd50e9d)]:
  - @keystonejs/adapter-knex@9.0.0
  - @keystonejs/adapter-mongoose@8.0.0
  - @keystonejs/keystone@8.0.0

## 6.0.2

### Patch Changes

- [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063) [#2593](https://github.com/keystonejs/keystone/pull/2593) Thanks [@jossmac](https://github.com/jossmac)! - Applied a more consistent voice throughout documentation.

- Updated dependencies [[`4a7d1eab`](https://github.com/keystonejs/keystone/commit/4a7d1eabf9b44fac7e16dfe20afdce409986e8dc), [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063), [`2ae2bd47`](https://github.com/keystonejs/keystone/commit/2ae2bd47eb54a816cfd4c8cd178c460729cbc258), [`3407fa68`](https://github.com/keystonejs/keystone/commit/3407fa68b91d7ebb3e7288c7e95631013fe12535), [`c2b1b725`](https://github.com/keystonejs/keystone/commit/c2b1b725a9474348964a4ac2e0f5b4aaf1a7f486)]:
  - @keystonejs/keystone@7.1.0
  - @keystonejs/adapter-knex@8.0.0
  - @keystonejs/adapter-mongoose@7.0.0
  - @keystonejs/app-graphql@5.1.5

## 6.0.1

### Patch Changes

- Updated dependencies [[`b6a555c2`](https://github.com/keystonejs/keystone/commit/b6a555c28296394908757f7404b72bc6b828b52a), [`abac6ad8`](https://github.com/keystonejs/keystone/commit/abac6ad83ad71f40047473c81d50b6af80ad41b2), [`b6a555c2`](https://github.com/keystonejs/keystone/commit/b6a555c28296394908757f7404b72bc6b828b52a), [`ca28681c`](https://github.com/keystonejs/keystone/commit/ca28681ca23c74bc57041fa36c20b93a4520e762), [`68be8f45`](https://github.com/keystonejs/keystone/commit/68be8f452909100fbddec431d6fe60c20a06a700), [`61a70503`](https://github.com/keystonejs/keystone/commit/61a70503f6c184a8f0f5440466399f12e6d7fa41), [`cec7ba5e`](https://github.com/keystonejs/keystone/commit/cec7ba5e2061280eff2a1d989054ecb02760e36d), [`663ae7b4`](https://github.com/keystonejs/keystone/commit/663ae7b453f450f077795fbbc6c9f138e6b27f52)]:
  - @keystonejs/keystone@7.0.0
  - @keystonejs/adapter-knex@7.0.0
  - @keystonejs/app-graphql@5.1.4
  - @keystonejs/adapter-mongoose@6.0.0

## 6.0.0

### Major Changes

- [`1d9c6762`](https://github.com/keystonejs/keystone/commit/1d9c6762d32409c71da6a68a083a81197c35aac3) [#2525](https://github.com/keystonejs/keystone/pull/2525) Thanks [@jesstelford](https://github.com/jesstelford)! - Refactored `matchFilter` to use named args (via an object) which makes understanding test code easier.

### Patch Changes

- [`83bdf743`](https://github.com/keystonejs/keystone/commit/83bdf743748e39d1ea73eff2c8e3576cc713c624) [#2538](https://github.com/keystonejs/keystone/pull/2538) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated mongo dependencies to latest version.

- Updated dependencies [[`51546e41`](https://github.com/keystonejs/keystone/commit/51546e4142fb8c66cfc413479c671a59618f885b), [`29ad8a17`](https://github.com/keystonejs/keystone/commit/29ad8a175cc4324fe722eefd22c09f7fb6c5be5e), [`83bdf743`](https://github.com/keystonejs/keystone/commit/83bdf743748e39d1ea73eff2c8e3576cc713c624), [`d30b7498`](https://github.com/keystonejs/keystone/commit/d30b74984b21ae9fc2a3b39850f674639fbac074), [`8f22ab5e`](https://github.com/keystonejs/keystone/commit/8f22ab5eefc034f9fef4fd0f9ec2c2583fc5514f), [`599c0929`](https://github.com/keystonejs/keystone/commit/599c0929b213ebd4beb79e3ccaa685b92348ca81), [`fb510d67`](https://github.com/keystonejs/keystone/commit/fb510d67ab124d8c1bda1884fa2a0d48262b5e4d)]:
  - @keystonejs/keystone@6.0.2
  - @keystonejs/app-graphql@5.1.3
  - @keystonejs/adapter-mongoose@5.2.2

## 5.1.2

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

- Updated dependencies [[`10e88dc3`](https://github.com/keystonejs/keystone/commit/10e88dc3d81f5e021db0bfb31f7547852c602c14), [`e46f0adf`](https://github.com/keystonejs/keystone/commit/e46f0adf97141e1f1205787453173a0585df5bc3), [`6975f169`](https://github.com/keystonejs/keystone/commit/6975f16959bde3fe0e861977471c94a8c9f2c0b0), [`42497b8e`](https://github.com/keystonejs/keystone/commit/42497b8ebbaeaf0f4d7881dbb76c6abafde4cace), [`97fb01fe`](https://github.com/keystonejs/keystone/commit/97fb01fe5a32f5003a084c1fd357852fc28f74e4), [`6111e065`](https://github.com/keystonejs/keystone/commit/6111e06554a6aa6db0f7df1a6c16f9da8e81fce4), [`2d1069f1`](https://github.com/keystonejs/keystone/commit/2d1069f11f5f8941b0a18e482541043c853ebb4f), [`949f2f6a`](https://github.com/keystonejs/keystone/commit/949f2f6a3889492015281ffba45a8b3d37e6d888), [`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722), [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20)]:
  - @keystonejs/keystone@6.0.0
  - @keystonejs/app-graphql@5.1.2
  - @keystonejs/adapter-knex@6.3.2
  - @keystonejs/adapter-mongoose@5.2.1

## 5.1.1

### Patch Changes

- [`1d98dae8`](https://github.com/keystonejs/keystone/commit/1d98dae898a5e7c5b580bfcc1745eec5dd323adb) [#2392](https://github.com/keystonejs/keystone/pull/2392) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `mongodb` dependency to 3.5.3 and `mongodb-memory-server` dependency to 6.2.4.

- Updated dependencies [[`635529c9`](https://github.com/keystonejs/keystone/commit/635529c9f227ae968332cd32e63875c4561af926), [`7ce804a8`](https://github.com/keystonejs/keystone/commit/7ce804a877300709375e5bc14206080ab15aec54), [`3abc5883`](https://github.com/keystonejs/keystone/commit/3abc58831e0f9b5871569a3fa6b21be7dc269cf3), [`8bdbb114`](https://github.com/keystonejs/keystone/commit/8bdbb114f6b2864693ae6e534df6fe8ee8345a60), [`362efbc2`](https://github.com/keystonejs/keystone/commit/362efbc2e054fa48aedb515c54b5a64757832be9)]:
  - @keystonejs/adapter-knex@6.3.1
  - @keystonejs/keystone@5.6.0
  - @keystonejs/app-graphql@5.1.1

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/adapter-knex@6.3.0
  - @keystonejs/adapter-mongoose@5.2.0
  - @keystonejs/app-graphql@5.1.0
  - @keystonejs/keystone@5.5.0

## 5.0.3

### Patch Changes

- [`3d7222cd`](https://github.com/keystonejs/keystone/commit/3d7222cd589ce8accbf3a9de141976c38e2c7e23) [#2167](https://github.com/keystonejs/keystone/pull/2167) - Fixed the unit tests on linux mint machines.
- Updated dependencies [[`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29), [`4cd4499d`](https://github.com/keystonejs/keystone/commit/4cd4499d9d19a5b379b2ae6ab1028c008248629a), [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104), [`05d07adf`](https://github.com/keystonejs/keystone/commit/05d07adf84059ff565cd2394f68d71d92e657485), [`78193f9c`](https://github.com/keystonejs/keystone/commit/78193f9c9d93655fb0d4b8dc494fbe4c622a4d64)]:
  - @keystonejs/adapter-knex@6.1.3
  - @keystonejs/keystone@5.4.1
  - @keystonejs/adapter-mongoose@5.1.4

## 5.0.2

### Patch Changes

- Updated dependencies [[`77056ebd`](https://github.com/keystonejs/keystone/commit/77056ebdb31e58d27372925e8e24311a8c7d9e33), [`8188d76c`](https://github.com/keystonejs/keystone/commit/8188d76cb3f5d3e112ef95fd4e1887db9a520d9d), [`0acdae17`](https://github.com/keystonejs/keystone/commit/0acdae17c4b2bcb234a314ad1aba311981affc8f), [`733ac847`](https://github.com/keystonejs/keystone/commit/733ac847cab488dc92a30e7b458191d750fd5a3d), [`44b2bc93`](https://github.com/keystonejs/keystone/commit/44b2bc938fd508ac75f6a9cbb364006b9f122711), [`e68fc43b`](https://github.com/keystonejs/keystone/commit/e68fc43ba006f9c958f9c81ae20b230d05c2cab6), [`d4d89836`](https://github.com/keystonejs/keystone/commit/d4d89836700413c1da2b76e9b82b649c2cac859d), [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f), [`860dabec`](https://github.com/keystonejs/keystone/commit/860dabecacdf81aa1563cea9a5d50add8623dac1), [`1f4dc33d`](https://github.com/keystonejs/keystone/commit/1f4dc33d8a5ac4e38427eb215a7a8bc3504ae153), [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071), [`a3fdc50e`](https://github.com/keystonejs/keystone/commit/a3fdc50ebb61b38814816804b04d7cb4bc0fc70a), [`721472e1`](https://github.com/keystonejs/keystone/commit/721472e1801584be5807d6637c646b1755366d3e), [`da62aa4a`](https://github.com/keystonejs/keystone/commit/da62aa4a0af9cf27fd59fdcfb6b960e24999254d), [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64)]:
  - @keystonejs/keystone@5.3.0
  - @keystonejs/adapter-knex@6.0.0
  - @keystonejs/adapter-mongoose@5.1.3
  - @keystonejs/app-graphql@5.0.1

## 5.0.1

### Patch Changes

- [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f) [#1837](https://github.com/keystonejs/keystone/pull/1837) Thanks [@timleslie](https://github.com/timleslie)! - Updated mongo-related dependencies

- Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469), [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f)]:
  - @keystonejs/adapter-mongoose@5.1.0
  - @keystonejs/keystone@5.1.0
  - @keystonejs/adapter-knex@5.0.1

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/adapter-knex@5.0.0
  - @keystonejs/adapter-mongoose@5.0.0
  - @keystonejs/app-graphql@5.0.0
  - @keystonejs/keystone@5.0.0

# @keystone-alpha/test-utils

## 2.6.3

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/adapter-knex@6.0.0
  - @keystone-alpha/adapter-mongoose@6.0.0
  - @keystone-alpha/keystone@16.0.0

## 2.6.2

- Updated dependencies [6c4df466](https://github.com/keystonejs/keystone/commit/6c4df466):
  - @keystone-alpha/adapter-knex@5.0.0

## 2.6.1

- Updated dependencies [b96a3a58](https://github.com/keystonejs/keystone/commit/b96a3a58):
  - @keystone-alpha/adapter-mongoose@5.0.0

## 2.6.0

### Minor Changes

- [552e6fb6](https://github.com/keystonejs/keystone/commit/552e6fb6): Add support for schema cache hints

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 2.5.0

### Minor Changes

- [66e1c33e](https://github.com/keystonejs/keystone/commit/66e1c33e): Add `schemaName` and `schemaNames` parameters to `setupServer()`.

## 2.4.1

### Patch Changes

- [d218cd55](https://github.com/keystonejs/keystone/commit/d218cd55): Make executeQuery() backwards compatible with old, single-schema KS

## 2.4.0

### Minor Changes

- [b9e2c45b](https://github.com/keystonejs/keystone/commit/b9e2c45b): Add support for query validation

## 2.3.4

- Updated dependencies [42a45bbd](https://github.com/keystonejs/keystone/commit/42a45bbd):
  - @keystone-alpha/adapter-knex@4.0.10
  - @keystone-alpha/adapter-mongoose@4.0.7
  - @keystone-alpha/keystone@15.1.0

## 2.3.3

- Updated dependencies [b61289b4](https://github.com/keystonejs/keystone/commit/b61289b4):
- Updated dependencies [0bba9f07](https://github.com/keystonejs/keystone/commit/0bba9f07):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone/commit/9ade2b2d):
  - @keystone-alpha/adapter-knex@4.0.9
  - @keystone-alpha/adapter-mongoose@4.0.6
  - @keystone-alpha/keystone@15.0.0

## 2.3.2

### Patch Changes

- [a8e9378d](https://github.com/keystonejs/keystone/commit/a8e9378d): `Keystone`, `List` and `Field` constructors now take `schemaNames` as config options. A number of methods also now take `schemaName` parameters.
  - `keystone.getTypeDefs()` -> `keystone.getTypeDefs({ schemaName })`
  - `keystone.getAdminSchema()` -> `keystone.getAdminSchema({ schemaName })`
  - `keystone.dumpSchema(file)` -> `keystone.dumpSchema(file, schemaName)`
  - `keystone.getAdminMeta()` -> `keystone.getAdminMeta({ schemaName })`
  - `list.getAdminMeta()` -> `list.getAdminMeta({ schemaName })`
  - `field.getAdminMeta()` -> `field.getAdminMeta({ schemaName })`

* Updated dependencies [decf7319](https://github.com/keystonejs/keystone/commit/decf7319):
* Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone/commit/89c0d7e9):
* Updated dependencies [f8ad0975](https://github.com/keystonejs/keystone/commit/f8ad0975):
  - @keystone-alpha/adapter-knex@4.0.8
  - @keystone-alpha/adapter-mongoose@4.0.5
  - @keystone-alpha/keystone@14.0.0
  - @keystone-alpha/app-graphql@8.0.0

## 2.3.1

### Patch Changes

- [d80de82b](https://github.com/keystonejs/keystone/commit/d80de82b): Clean up error messages when using the mongo test runner

## 2.3.0

### Minor Changes

- [8bb1bb0e](https://github.com/keystonejs/keystone/commit/8bb1bb0e): Add a `keystone.executeQuery()` method to run GraphQL queries and mutations directly against a Keystone instance. NOTE: These queries are executed without any Access Control checks by default.

- Updated dependencies [8d0d98c7](https://github.com/keystonejs/keystone/commit/8d0d98c7):
  - @keystone-alpha/adapter-knex@4.0.7
  - @keystone-alpha/adapter-mongoose@4.0.4
  - @keystone-alpha/app-graphql@7.0.0
  - @keystone-alpha/keystone@13.0.0

## 2.2.4

- Updated dependencies [33001656](https://github.com/keystonejs/keystone/commit/33001656):
  - @keystone-alpha/adapter-knex@4.0.5
  - @keystone-alpha/adapter-mongoose@4.0.3
  - @keystone-alpha/keystone@12.0.0

## 2.2.3

- Updated dependencies [e42fdb4a](https://github.com/keystonejs/keystone/commit/e42fdb4a):
  - @keystone-alpha/adapter-knex@4.0.4
  - @keystone-alpha/adapter-mongoose@4.0.2
  - @keystone-alpha/keystone@11.0.0

## 2.2.2

- Updated dependencies [b86f0e26](https://github.com/keystonejs/keystone/commit/b86f0e26):
  - @keystone-alpha/adapter-knex@4.0.3
  - @keystone-alpha/adapter-mongoose@4.0.1
  - @keystone-alpha/keystone@10.5.0

## 2.2.1

- Updated dependencies [144e6e86](https://github.com/keystonejs/keystone/commit/144e6e86):
  - @keystone-alpha/adapter-knex@4.0.0
  - @keystone-alpha/adapter-mongoose@4.0.0
  - @keystone-alpha/keystone@10.0.0

## 2.2.0

### Minor Changes

- [d7819a55](https://github.com/keystonejs/keystone/commit/d7819a55): Add a `delete` method to test runners so they can remove items as part of a unit test.

## 2.1.0

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade to mongoose 5.6.5
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade promise utility dependencies

- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9):
  - @keystone-alpha/adapter-knex@3.0.0
  - @keystone-alpha/adapter-mongoose@3.0.0
  - @keystone-alpha/keystone@9.0.0

## 2.0.7

- Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone/commit/4007f5dd):
  - @keystone-alpha/adapter-knex@2.1.0
  - @keystone-alpha/adapter-mongoose@2.2.1
  - @keystone-alpha/keystone@8.0.0

## 2.0.6

- Updated dependencies [2b094b7f](https://github.com/keystonejs/keystone/commit/2b094b7f):
  - @keystone-alpha/adapter-knex@2.0.0
  - @keystone-alpha/keystone@7.0.3

## 2.0.5

### Patch Changes

- [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):

  Ensure knex database is correctly dropped for each test run.

* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):
  - @keystone-alpha/adapter-knex@1.1.0
  - @keystone-alpha/adapter-mongoose@2.2.0
  - @keystone-alpha/keystone@7.0.0

## 2.0.4

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):
  - @keystone-alpha/adapter-mongoose@2.1.0
  - @keystone-alpha/adapter-knex@1.0.9
  - @keystone-alpha/keystone@6.0.0

## 2.0.3

### Patch Changes

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

* Updated dependencies [b2651279](https://github.com/keystonejs/keystone/commit/b2651279):
  - @keystone-alpha/keystone@5.0.0
  - @keystone-alpha/app-graphql@6.0.0

## 2.0.2

- Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone/commit/9a0456ff):
  - @keystone-alpha/adapter-mongoose@2.0.0

## 2.0.1

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone/commit/81dc0be5):

  - Update dependencies

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone/commit/24cd26ee):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone/commit/2ef2658f):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone/commit/ae5cf6cc):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone/commit/b7a2ea9c):
* Updated dependencies [b22d6c16](https://github.com/keystonejs/keystone/commit/b22d6c16):
  - @keystone-alpha/adapter-knex@1.0.7
  - @keystone-alpha/adapter-mongoose@1.0.7
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/server@5.0.0

## 2.0.0

- [patch][7b8d254d](https://github.com/keystonejs/keystone/commit/7b8d254d):

  - Update external dependencies

- [patch][88e6224f](https://github.com/keystonejs/keystone/commit/88e6224f):

  - Restructure internal code

- [major][21be780b](https://github.com/keystonejs/keystone/commit/21be780b):

  - Remove `runQuery` from API.
  - `matchFilter` takes `keystone` as the first parameter, rather than `server`.
  - `graphqlRequest` takes a `keystone` parameter, and no longer takes `server`.

- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone/commit/b4dcf44b):
  - @keystone-alpha/adapter-knex@1.0.5
  - @keystone-alpha/adapter-mongoose@1.0.5
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/server@4.0.0

## 1.1.3

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone/commit/8d385ede):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone/commit/5ebf4c3a):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone/commit/52f1c47b):
  - @keystone-alpha/adapter-knex@1.0.4
  - @keystone-alpha/adapter-mongoose@1.0.4
  - @keystone-alpha/keystone@2.0.0
  - @keystone-alpha/server@3.0.0

## 1.1.2

- Updated dependencies [de616f7e](https://github.com/keystonejs/keystone/commit/de616f7e):
  - @keystone-alpha/keystone@1.0.3
  - @keystone-alpha/server@2.0.0

## 1.1.1

- [patch][11c372fa](https://github.com/keystonejs/keystone/commit/11c372fa):

  - Update minor-level dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

## 1.1.0

- [minor][c0e64c01](https://github.com/keystonejs/keystone/commit/c0e64c01):

  - Add `matchFilter` and `runQuery` functions.

- [patch][1f0bc236](https://github.com/keystonejs/keystone/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/test-utils

## 1.0.1

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] b155d942:

  - Update mongo/mongoose dependencies

## 1.0.0

- [minor] dc53492c:

  - Add support for the Knex adapter

- [major] 9f2ee393:

  - Add adapter parameter to setupServer() and add multiAdapterRunners()

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [53e27d75]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [48773907]:
- Updated dependencies [a3d5454d]:
- Updated dependencies [ced0edb3]:
- Updated dependencies [860c3b80]:
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/core@2.0.0
  - @voussoir/server@1.0.0
  - @voussoir/utils@1.0.0
  - @voussoir/adapter-knex@0.0.2

## 0.1.3

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [c83c9ed5]:
- Updated dependencies [c3ebd9e6]:
- Updated dependencies [ebae2d6f]:
- Updated dependencies [78fd9555]:
- Updated dependencies [01718870]:
- Updated dependencies [d22820b1]:
  - @voussoir/adapter-mongoose@1.0.0
  - @voussoir/core@1.0.0
  - @voussoir/server@0.5.0

## 0.1.2

- [patch] 9c383fe8:

  - Always use \$set and { new: true } in the mongoose adapter update() method

- Updated dependencies [45d4c379]:
- Updated dependencies [ae3b8fda]:
- Updated dependencies [b0d19c24]:
  - @voussoir/adapter-mongoose@0.5.0
  - @voussoir/core@0.7.0
  - @voussoir/server@0.4.0

## 0.1.1

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.4.1
  - @voussoir/core@0.6.0

## 0.1.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.4.0
  - @voussoir/core@0.5.0

## 0.0.2

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.3.2
  - @voussoir/core@0.4.0

## 0.0.1

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
