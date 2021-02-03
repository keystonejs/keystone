# @keystonejs/fields-auto-increment

## 8.1.3

### Patch Changes

- Updated dependencies [[`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf), [`680169cad`](https://github.com/keystonejs/keystone/commit/680169cad62dd889ec95961cba9df3b4d012887f), [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d)]:
  - @keystonejs/adapter-prisma@3.0.0
  - @keystonejs/fields@21.1.0
  - @keystonejs/adapter-knex@13.0.0

## 8.1.2

### Patch Changes

- Updated dependencies [[`6b95cb6e4`](https://github.com/keystonejs/keystone/commit/6b95cb6e4d5bea3a87e22765d5fcf31db2fc31ae), [`fc2b7101f`](https://github.com/keystonejs/keystone/commit/fc2b7101f35f20e4d729269a005816546bb37464), [`e7d4d54e5`](https://github.com/keystonejs/keystone/commit/e7d4d54e5b94e6b376d6eab28a0f2b074f2c95ed), [`a62a2d996`](https://github.com/keystonejs/keystone/commit/a62a2d996f1080051f7962b7063ae37d7e8b7e63)]:
  - @keystonejs/adapter-prisma@2.0.0
  - @keystonejs/fields@21.0.2

## 8.1.1

### Patch Changes

- Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0), [`defd05365`](https://github.com/keystonejs/keystone/commit/defd05365f31d0d6d4b6fd9ffe0a0c3928f97e79)]:
  - @keystonejs/fields@21.0.0
  - @keystonejs/adapter-prisma@1.1.0

## 8.1.0

### Minor Changes

- [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c) [#4238](https://github.com/keystonejs/keystone/pull/4238) Thanks [@timleslie](https://github.com/timleslie)! - Added a `.getBackingTypes()` method to all `Field` implementations, which returns `{ path: { optional, type } }`. This method will be used to generate typescript types in our upcoming [new interfaces](https://www.keystonejs.com/blog/roadmap-update).

### Patch Changes

- Updated dependencies [[`7afde2fb5`](https://github.com/keystonejs/keystone/commit/7afde2fb516e1d3824d73a96308abb4a6b022400), [`5216e9dc6`](https://github.com/keystonejs/keystone/commit/5216e9dc6894c1a6e81765c0278dc6f7c4cc617b), [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c), [`325910f8d`](https://github.com/keystonejs/keystone/commit/325910f8ddaf2b620ce08d64dc97850d57840115), [`745270261`](https://github.com/keystonejs/keystone/commit/745270261f86337206802bd4e66541c98fd4407f)]:
  - @keystonejs/fields@20.1.0
  - @keystonejs/adapter-prisma@1.0.8

## 8.0.1

### Patch Changes

- Updated dependencies [[`a5e40e6c4`](https://github.com/keystonejs/keystone/commit/a5e40e6c4af1ab38cc2079a0f6e27d39d6b7d546), [`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da), [`f2b841b90`](https://github.com/keystonejs/keystone/commit/f2b841b90d5ac8adece645df45b8a17832391b50)]:
  - @keystonejs/fields@20.0.0
  - @keystonejs/adapter-prisma@1.0.7

## 8.0.0

### Major Changes

- [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74) [#3684](https://github.com/keystonejs/keystone/pull/3684) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Make GraphQL output type field non-nullable when it is the primary key on a list

### Patch Changes

- Updated dependencies [[`f30928db3`](https://github.com/keystonejs/keystone/commit/f30928db31b0c0a10a27b827b44afc1896dfbafe), [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74), [`bf06edbf4`](https://github.com/keystonejs/keystone/commit/bf06edbf47e69280c3a9e270daa578528d68c447), [`85fa68456`](https://github.com/keystonejs/keystone/commit/85fa684565d8c9c40036d4544b3c0235dbbd327b), [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74)]:
  - @keystonejs/adapter-prisma@1.0.3
  - @keystonejs/adapter-knex@12.0.0
  - @keystonejs/fields@19.0.0

## 7.0.0

### Major Changes

- [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4) [#3298](https://github.com/keystonejs/keystone/pull/3298) Thanks [@timleslie](https://github.com/timleslie)! - Added support for a Prisma adapter to Keystone.

### Patch Changes

- Updated dependencies [[`8c54a34be`](https://github.com/keystonejs/keystone/commit/8c54a34bec0f5f945447a2475f5500415eb154df), [`a02e69987`](https://github.com/keystonejs/keystone/commit/a02e69987902cfde38d820e68cb24b7a20ca1f6f), [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4), [`3e2ca3a2f`](https://github.com/keystonejs/keystone/commit/3e2ca3a2ffa00cb5aababee572902a78e657ec58), [`bf5801070`](https://github.com/keystonejs/keystone/commit/bf5801070568bbcc1ed4f3394a293bfa5bea8b98)]:
  - @keystonejs/adapter-knex@11.0.7
  - @keystonejs/fields@18.0.0
  - @keystonejs/adapter-prisma@1.0.0

## 6.0.3

### Patch Changes

- [`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a) [#3610](https://github.com/keystonejs/keystone/pull/3610) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `prettier` to `^2.1.1`.

- Updated dependencies [[`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a), [`dd49d2c04`](https://github.com/keystonejs/keystone/commit/dd49d2c040ea8fb8dfc36d2e556be88ca1b74b15), [`8bd44758a`](https://github.com/keystonejs/keystone/commit/8bd44758ac742c95f42151c9fbc16700b698e8e4), [`9dae7a5d0`](https://github.com/keystonejs/keystone/commit/9dae7a5d00a62cd0b7a4470695adc5e1678db3dc), [`fe054e53e`](https://github.com/keystonejs/keystone/commit/fe054e53e71f13a69af1d6dd2a1cd8c68bb31059)]:
  - @keystonejs/adapter-knex@11.0.5
  - @keystonejs/fields@17.1.2

## 6.0.2

### Patch Changes

- [`6c97a5534`](https://github.com/keystonejs/keystone/commit/6c97a5534e8a18d15aeac8b0471810fdd4d04f80) [#3577](https://github.com/keystonejs/keystone/pull/3577) Thanks [@timleslie](https://github.com/timleslie)! - Updated test framework to support more detailed field tests.

* [`2e6a06202`](https://github.com/keystonejs/keystone/commit/2e6a06202299b36c36fd3efd895f2280479eac31) [#3532](https://github.com/keystonejs/keystone/pull/3532) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated filter tests across all field types.
  Fixed errors with filtering by `null` in the `Decimal`, `MongoId` and `Uuid` field types.
* Updated dependencies [[`cd15192cd`](https://github.com/keystonejs/keystone/commit/cd15192cdae5e476f64a257c196ca569a9440d5a), [`e9bc4367a`](https://github.com/keystonejs/keystone/commit/e9bc4367ac31f3fe3a2898198c600c76c42165b2), [`d500613d8`](https://github.com/keystonejs/keystone/commit/d500613d8917e3cbcea2817501d607eddd3b1a8d), [`6c97a5534`](https://github.com/keystonejs/keystone/commit/6c97a5534e8a18d15aeac8b0471810fdd4d04f80), [`34fcc7052`](https://github.com/keystonejs/keystone/commit/34fcc7052a24db61f1f2f12c46110c060934f4ca), [`c3488c5e8`](https://github.com/keystonejs/keystone/commit/c3488c5e88628b15eb9fe804551c3c5c44c07e0f), [`e62b3308b`](https://github.com/keystonejs/keystone/commit/e62b3308bd841b5f58ac9fa1f84707f9187fda6b), [`7036585f2`](https://github.com/keystonejs/keystone/commit/7036585f25c3b690b7a6fd04c39b5b781ff5bcd9), [`2e6a06202`](https://github.com/keystonejs/keystone/commit/2e6a06202299b36c36fd3efd895f2280479eac31), [`003b856e6`](https://github.com/keystonejs/keystone/commit/003b856e686cc1ee0f984c1acf024c1fa0c27837), [`a42ee3a30`](https://github.com/keystonejs/keystone/commit/a42ee3a306c899a7ae46909fe132522cbeff7812), [`438051442`](https://github.com/keystonejs/keystone/commit/4380514421020f4418a9f966c9fec60e014478b9), [`b3aa85031`](https://github.com/keystonejs/keystone/commit/b3aa850311cbc1622568f69f9cb4b9f46ab9db22), [`518718e19`](https://github.com/keystonejs/keystone/commit/518718e197d0a2d723c8e184552ddd5d8e165f12), [`16fba3b98`](https://github.com/keystonejs/keystone/commit/16fba3b98271410e570a370f610da7cd0686f294), [`28b88abd3`](https://github.com/keystonejs/keystone/commit/28b88abd369f0df12eae72107db7c24323eda4b5)]:
  - @keystonejs/fields@17.1.1
  - @keystonejs/adapter-knex@11.0.4

## 6.0.1

### Patch Changes

- [`bbeb0f7d3`](https://github.com/keystonejs/keystone/commit/bbeb0f7d3511a8d8defe9bc2d86ea4a0ae0131fe) [#3415](https://github.com/keystonejs/keystone/pull/3415) Thanks [@singhArmani](https://github.com/singhArmani)! - Added filter and CRUD tests for `AutoIncrement` field type.

- Updated dependencies [[`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6), [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e), [`ac44568f9`](https://github.com/keystonejs/keystone/commit/ac44568f91fd54ccbc39accf83bcfb3276ce1a72), [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc), [`483b20ec5`](https://github.com/keystonejs/keystone/commit/483b20ec53ff89f1d026c0495fdae5df60a7cf59), [`0fc878fa9`](https://github.com/keystonejs/keystone/commit/0fc878fa918c3196196f943f195ffaa62fce504b), [`ea367f759`](https://github.com/keystonejs/keystone/commit/ea367f7594f47efc3528d9917cce010b3a16bf4d), [`69d627813`](https://github.com/keystonejs/keystone/commit/69d627813adfc10d29707f5c882ca15621de12a5), [`096d13fc2`](https://github.com/keystonejs/keystone/commit/096d13fc25696ed1769cf817b705dfd80da601b2), [`0153168d7`](https://github.com/keystonejs/keystone/commit/0153168d73ce8cd7ede4eb9c8518e5e2bf859709)]:
  - @keystonejs/adapter-knex@11.0.3
  - @keystonejs/fields@17.1.0

## 6.0.0

### Major Changes

- [`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593) [#3394](https://github.com/keystonejs/keystone/pull/3394) Thanks [@timleslie](https://github.com/timleslie)! - Converted `Field` getters `.gqlUpdateInputFields` and `.gqlCreateInputFields` into methods, `.gqlUpdateInputFields({ schemaName })` and `...gqlCreateInputFields({ schemaName })`.

### Patch Changes

- Updated dependencies [[`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593), [`e8b2e4772`](https://github.com/keystonejs/keystone/commit/e8b2e477206acffb143f19fb14be1e3b4cd0eb91)]:
  - @keystonejs/fields@17.0.0
  - @keystonejs/adapter-knex@11.0.2

## 5.1.13

### Patch Changes

- [`356dd27da`](https://github.com/keystonejs/keystone/commit/356dd27dab4ee6c89a9381dc92eef9534db52fc0) [#3342](https://github.com/keystonejs/keystone/pull/3342) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Change build system from @keystonejs/build-field-types to Preconstruct

- Updated dependencies [[`d38a41f25`](https://github.com/keystonejs/keystone/commit/d38a41f25a1b4c90c05d2fb85116dc385d4ee77a), [`5ede731fc`](https://github.com/keystonejs/keystone/commit/5ede731fc58a79e7322b852bdd2d971ece45281e), [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25), [`694f3acfb`](https://github.com/keystonejs/keystone/commit/694f3acfb9faa78aebfcf48cf711165560f16ff7), [`149d6fd6f`](https://github.com/keystonejs/keystone/commit/149d6fd6ff057c17570346063c173376769dcc79), [`e44102e9f`](https://github.com/keystonejs/keystone/commit/e44102e9f7f770b1528d642d763ccf9f88f3cbb1)]:
  - @keystonejs/fields@16.0.0

## 5.1.12

### Patch Changes

- [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2) [#3299](https://github.com/keystonejs/keystone/pull/3299) Thanks [@timleslie](https://github.com/timleslie)! - Added more robust checks for support of the `isUnique` flag config. Added tests for this flag.

- Updated dependencies [[`af5171563`](https://github.com/keystonejs/keystone/commit/af51715637433bcdd2538835c98ac71a8eb86122), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2), [`7da9d67d7`](https://github.com/keystonejs/keystone/commit/7da9d67d7d481c44a81406c6b34540a3f0a8340d), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2), [`c3883e01c`](https://github.com/keystonejs/keystone/commit/c3883e01c01b83cf5938de9bebf2dd68f4861364), [`fd2b8d1cf`](https://github.com/keystonejs/keystone/commit/fd2b8d1cf0b23b177951d65006a0d0faf666a5d6)]:
  - @keystonejs/fields@15.0.0
  - @keystonejs/adapter-knex@11.0.1

## 5.1.11

### Patch Changes

- Updated dependencies [[`51c898537`](https://github.com/keystonejs/keystone/commit/51c898537c7fdc8578fa47eade6a499594b0d154), [`4b95d8a46`](https://github.com/keystonejs/keystone/commit/4b95d8a46d53d32b2873e350716311441cd37262), [`5fc97cbf4`](https://github.com/keystonejs/keystone/commit/5fc97cbf4489587a3a8cb38c04ba81fc2cb1fc5a), [`0cbb7e7b0`](https://github.com/keystonejs/keystone/commit/0cbb7e7b096c2a99685631a601fce7273d03cc70), [`c9ca62876`](https://github.com/keystonejs/keystone/commit/c9ca628765f1ecb599c8556de2d31567ddf12504), [`7bdec6446`](https://github.com/keystonejs/keystone/commit/7bdec6446ed97fa962bb96abe07975bb23c6ec7a), [`51aef1ef0`](https://github.com/keystonejs/keystone/commit/51aef1ef06a89422e89a6118b7820848d5970669)]:
  - @keystonejs/adapter-knex@11.0.0
  - @keystonejs/fields@14.0.0

## 5.1.10

### Patch Changes

- Updated dependencies [[`c235e34c7`](https://github.com/keystonejs/keystone/commit/c235e34c7a72cd05b05b3d1af08c93c1e98a8e91), [`b693b2fa8`](https://github.com/keystonejs/keystone/commit/b693b2fa8a391d7f5bcfbea11061679bd4b559d8)]:
  - @keystonejs/fields@13.0.0

## 5.1.9

### Patch Changes

- Updated dependencies [[`c2ebb51c7`](https://github.com/keystonejs/keystone/commit/c2ebb51c786297879fe9fac2007804055631e9e2), [`c3faeeff4`](https://github.com/keystonejs/keystone/commit/c3faeeff41f9b29a9fc31ca4e7778b596fcb20b9), [`397982096`](https://github.com/keystonejs/keystone/commit/39798209642571d3ba698e11410f5161cd1943bb), [`538378e4e`](https://github.com/keystonejs/keystone/commit/538378e4eb143dbe6e7a943408e0af302eb86b85), [`9f67e0e91`](https://github.com/keystonejs/keystone/commit/9f67e0e912b4f7dcb90fcb07c4b30bd6c45de464), [`ea9608342`](https://github.com/keystonejs/keystone/commit/ea960834262cec66f52fa39c1b3b07b702b3cd4d), [`8fddd97b2`](https://github.com/keystonejs/keystone/commit/8fddd97b20f1928ff7306d5d0dcc96e58ffe55fb), [`fdfb01417`](https://github.com/keystonejs/keystone/commit/fdfb01417b6d330342f4b6c326767c9567e35ca5), [`83548d43d`](https://github.com/keystonejs/keystone/commit/83548d43d661959a34a6de475994430ee1de3a1d), [`5ea313461`](https://github.com/keystonejs/keystone/commit/5ea313461aa2cba310b2634cc87780092c84b5be), [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb), [`04c57fa78`](https://github.com/keystonejs/keystone/commit/04c57fa7840714d3413e093d468b78d740c95c9a), [`f33388b50`](https://github.com/keystonejs/keystone/commit/f33388b5061d59747ab46e238f43e9b08f52bd1e), [`4b06157be`](https://github.com/keystonejs/keystone/commit/4b06157be6cffde2d88969823f7c410fefd82317), [`649017fbd`](https://github.com/keystonejs/keystone/commit/649017fbd5ea17c36e8c49d44836e1f2bcae2692), [`170faf568`](https://github.com/keystonejs/keystone/commit/170faf568fef5b74147791476b466dc7a25c7d6f), [`de27d2c16`](https://github.com/keystonejs/keystone/commit/de27d2c16b520ae5126a74efb85c70ae88ae6b60)]:
  - @keystonejs/fields@12.0.0
  - @keystonejs/adapter-knex@10.0.2

## 5.1.8

### Patch Changes

- Updated dependencies [[`a124417f`](https://github.com/keystonejs/keystone/commit/a124417fddc75889db5e4e8e0d5625fb4af12590), [`54931d75`](https://github.com/keystonejs/keystone/commit/54931d75d3f26f4f300c2c4c3ee65ed3183b4a6a), [`e9a0de2c`](https://github.com/keystonejs/keystone/commit/e9a0de2cc03c211beca01ec206244105bdca6afc), [`59ed6310`](https://github.com/keystonejs/keystone/commit/59ed6310bacc76f571639de048689becbedbeac5)]:
  - @keystonejs/fields@11.0.0

## 5.1.7

### Patch Changes

- [`e3d46ce4`](https://github.com/keystonejs/keystone/commit/e3d46ce4bd9f9ec8808ab3194672c6849e624e27) [#2919](https://github.com/keystonejs/keystone/pull/2919) Thanks [@Vultraz](https://github.com/Vultraz)! - Made handling of field-specific config options more consistent.

- Updated dependencies [[`72e0a4e1`](https://github.com/keystonejs/keystone/commit/72e0a4e19942df11c72d11c2cf6ee9bc94300d87), [`5ec4e5d5`](https://github.com/keystonejs/keystone/commit/5ec4e5d547503baeae2ac2f6317b66c2ebae93b7), [`6e507838`](https://github.com/keystonejs/keystone/commit/6e5078380e1d17eb2884554eef114fdd521a15f4), [`e3d46ce4`](https://github.com/keystonejs/keystone/commit/e3d46ce4bd9f9ec8808ab3194672c6849e624e27), [`d8584765`](https://github.com/keystonejs/keystone/commit/d85847652e224e5000e036be2df0b8a45ab96385), [`285026a0`](https://github.com/keystonejs/keystone/commit/285026a04ffce23ab72d7defc18ced2e980b0de4), [`babed628`](https://github.com/keystonejs/keystone/commit/babed628a408d7da39990a4c89a19828468555a8), [`d4811b02`](https://github.com/keystonejs/keystone/commit/d4811b0231c5d64e95dbbce57531df0931d4defa), [`e2800875`](https://github.com/keystonejs/keystone/commit/e28008756cbcc1e07e012a9fdb0cfa0ad94f3673), [`60e2c7eb`](https://github.com/keystonejs/keystone/commit/60e2c7eb2298a016c68a19a056040a3b45beab2a), [`99da34a8`](https://github.com/keystonejs/keystone/commit/99da34a8db26b8861b08cee330407605e787a80c), [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533), [`bcf03a7f`](https://github.com/keystonejs/keystone/commit/bcf03a7f8067a3f29f22dde397b957bf5cee1a07), [`e765ad20`](https://github.com/keystonejs/keystone/commit/e765ad20abae9838f64b72b7d43767ec87db336a), [`d7eb2601`](https://github.com/keystonejs/keystone/commit/d7eb260144d2aa31e7ef4e636e7a23f91dc37285)]:
  - @keystonejs/fields@10.0.0
  - @keystonejs/adapter-knex@10.0.0

## 5.1.6

### Patch Changes

- Updated dependencies [[`fd685241`](https://github.com/keystonejs/keystone/commit/fd68524135025e4d800b4a98932916736dd50e9d)]:
  - @keystonejs/adapter-knex@9.0.0
  - @keystonejs/fields@9.0.0

## 5.1.5

### Patch Changes

- [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063) [#2593](https://github.com/keystonejs/keystone/pull/2593) Thanks [@jossmac](https://github.com/jossmac)! - Applied a more consistent voice throughout documentation.

- Updated dependencies [[`e7e4bc1d`](https://github.com/keystonejs/keystone/commit/e7e4bc1d22149d4daceb31d303f6ad10c2b853ba), [`58c4ffc3`](https://github.com/keystonejs/keystone/commit/58c4ffc3d4b1edf8bdfbc4ea299133d303239fc6), [`007063c4`](https://github.com/keystonejs/keystone/commit/007063c4f17e6e7038312ed9126eaf91757e7939), [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063), [`d138736d`](https://github.com/keystonejs/keystone/commit/d138736db184c5884171c7a65e43377f248046b5), [`2ae2bd47`](https://github.com/keystonejs/keystone/commit/2ae2bd47eb54a816cfd4c8cd178c460729cbc258), [`2cbd38b0`](https://github.com/keystonejs/keystone/commit/2cbd38b05adc98cface11a8767f66b48a1cb0bbf)]:
  - @keystonejs/fields@8.0.0
  - @keystonejs/adapter-knex@8.0.0

## 5.1.4

### Patch Changes

- Updated dependencies [[`abac6ad8`](https://github.com/keystonejs/keystone/commit/abac6ad83ad71f40047473c81d50b6af80ad41b2), [`ca28681c`](https://github.com/keystonejs/keystone/commit/ca28681ca23c74bc57041fa36c20b93a4520e762), [`68be8f45`](https://github.com/keystonejs/keystone/commit/68be8f452909100fbddec431d6fe60c20a06a700), [`cec7ba5e`](https://github.com/keystonejs/keystone/commit/cec7ba5e2061280eff2a1d989054ecb02760e36d), [`663ae7b4`](https://github.com/keystonejs/keystone/commit/663ae7b453f450f077795fbbc6c9f138e6b27f52)]:
  - @keystonejs/adapter-knex@7.0.0
  - @keystonejs/fields@7.0.2

## 5.1.3

### Patch Changes

- Updated dependencies [[`161bf3e5`](https://github.com/keystonejs/keystone/commit/161bf3e57acb1b3d88a0836507d4c8dd4935f260)]:
  - @keystonejs/fields@7.0.0

## 5.1.2

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

- Updated dependencies [[`fe42a997`](https://github.com/keystonejs/keystone/commit/fe42a997c81825a819ac28f05e02d1ed61099542), [`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722), [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20)]:
  - @keystonejs/fields@6.3.2
  - @keystonejs/adapter-knex@6.3.2

## 5.1.1

### Patch Changes

- [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09) [#2381](https://github.com/keystonejs/keystone/pull/2381) Thanks [@timleslie](https://github.com/timleslie)! - Updated `@babel/*` dependency packages to latest versions.

- Updated dependencies [[`635529c9`](https://github.com/keystonejs/keystone/commit/635529c9f227ae968332cd32e63875c4561af926), [`d8a7b8a2`](https://github.com/keystonejs/keystone/commit/d8a7b8a23b4c3e1545d101a92323be165ad362e2), [`9a388f01`](https://github.com/keystonejs/keystone/commit/9a388f01e388272d56f81af2247d8030e0f2c972), [`bd4096ee`](https://github.com/keystonejs/keystone/commit/bd4096ee86f7790c76db23090b38f880e5aa7ecc), [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09), [`c059b63c`](https://github.com/keystonejs/keystone/commit/c059b63c6ebdbb60ac4095d1efd791d598b2756c)]:
  - @keystonejs/adapter-knex@6.3.1
  - @keystonejs/fields@6.3.1

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/adapter-knex@6.3.0
  - @keystonejs/fields@6.3.0

## 5.0.3

### Patch Changes

- [`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a) [#2144](https://github.com/keystonejs/keystone/pull/2144) - Upgraded all @babel/\* dependencies.
- Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a), [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29), [`4cd4499d`](https://github.com/keystonejs/keystone/commit/4cd4499d9d19a5b379b2ae6ab1028c008248629a), [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104)]:
  - @keystonejs/fields@6.0.5
  - @keystonejs/adapter-knex@6.1.3

## 5.0.2

### Patch Changes

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Upgrade all Babel deps to the same version (7.7.4)
- Updated dependencies [[`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62)]:
  - @keystonejs/fields@6.0.2

## 5.0.1

### Patch Changes

- Updated dependencies [[`267dab2f`](https://github.com/keystonejs/keystone/commit/267dab2fee5bbea711c417c13366862e8e0ab3be), [`8188d76c`](https://github.com/keystonejs/keystone/commit/8188d76cb3f5d3e112ef95fd4e1887db9a520d9d), [`af1e9e4d`](https://github.com/keystonejs/keystone/commit/af1e9e4d3b74753b903b20641b51df99184793df), [`0acdae17`](https://github.com/keystonejs/keystone/commit/0acdae17c4b2bcb234a314ad1aba311981affc8f), [`44b2bc93`](https://github.com/keystonejs/keystone/commit/44b2bc938fd508ac75f6a9cbb364006b9f122711), [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866), [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f), [`860dabec`](https://github.com/keystonejs/keystone/commit/860dabecacdf81aa1563cea9a5d50add8623dac1), [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071), [`0145f7e2`](https://github.com/keystonejs/keystone/commit/0145f7e21d9297e3037c709587eb3b4220ba3f01), [`a3fdc50e`](https://github.com/keystonejs/keystone/commit/a3fdc50ebb61b38814816804b04d7cb4bc0fc70a), [`2cc83b12`](https://github.com/keystonejs/keystone/commit/2cc83b12be757019ba25658139478e8f5b2b19c6), [`721472e1`](https://github.com/keystonejs/keystone/commit/721472e1801584be5807d6637c646b1755366d3e), [`a1dcbd7b`](https://github.com/keystonejs/keystone/commit/a1dcbd7bd7448fdcacbfe9fb0196bfee3c4a5326), [`da62aa4a`](https://github.com/keystonejs/keystone/commit/da62aa4a0af9cf27fd59fdcfb6b960e24999254d), [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64)]:
  - @keystonejs/fields@6.0.0
  - @keystonejs/adapter-knex@6.0.0

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/adapter-knex@5.0.0
  - @keystonejs/fields@5.0.0

# @keystone-alpha/fields-auto-increment

## 2.0.5

### Patch Changes

- Updated dependencies [[`768420f5`](https://github.com/keystonejs/keystone/commit/768420f567c244d57a4e2a3aaafe628ea9813d9d), [`effc1f63`](https://github.com/keystonejs/keystone/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/adapter-knex@6.0.2
  - @keystone-alpha/fields@15.0.0

## 2.0.4

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/adapter-knex@6.0.0
  - @keystone-alpha/fields@14.0.0

## 2.0.3

- Updated dependencies [6c4df466](https://github.com/keystonejs/keystone/commit/6c4df466):
  - @keystone-alpha/fields@13.1.0
  - @keystone-alpha/adapter-knex@5.0.0

## 2.0.2

- Updated dependencies [4e6a574d](https://github.com/keystonejs/keystone/commit/4e6a574d):
  - @keystone-alpha/fields@13.0.0

## 2.0.1

- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone/commit/9ade2b2d):
  - @keystone-alpha/adapter-knex@4.0.9
  - @keystone-alpha/fields@12.0.0

## 2.0.0

### Major Changes

- [89c0d7e9](https://github.com/keystonejs/keystone/commit/89c0d7e9): The `.access` property of Fields is now keyed by `schemaName`. As such, a number of getters have been replaced with methods which take `{ schemaName }`.

  - `get gqlOutputFields()` -> `gqlOutputFields({ schemaName })`
  - `get gqlOutputFieldResolvers()` -> `gqlOutputFieldResolvers({ schemaName })`
  - `get gqlAuxFieldResolvers() -> gqlAuxFieldResolvers({ schemaName })`
  - `get gqlAuxQueryResolvers()` -> `gqlAuxQueryResolvers({ schemaName })`
  - `get gqlAuxMutationResolvers()` -> `gqlAuxMutationResolvers({ schemaName })`
  - `get gqlQueryInputFields()` -> `gqlQueryInputFields({ schemaName })`

* Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone/commit/a8e9378d):
  - @keystone-alpha/adapter-knex@4.0.8
  - @keystone-alpha/fields@11.0.0

## 1.0.1

- Updated dependencies [144e6e86](https://github.com/keystonejs/keystone/commit/144e6e86):
  - @keystone-alpha/fields@10.2.0
  - @keystone-alpha/adapter-knex@4.0.0

## 1.0.0

### Major Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Adding `AutoIncrement` field type
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Adding isIndexed field config and support for in most field types
