# @keystonejs/adapter-knex

## 13.0.0

### Major Changes

- [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d) [#4709](https://github.com/keystonejs/keystone/pull/4709) Thanks [@timleslie](https://github.com/timleslie)! - Database adapters no longer support custom `ListAdapter` classes via the `listAdapterClass` option of `adapterConfig` in `createList()`.

### Patch Changes

- Updated dependencies [[`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d), [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9), [`94c8d349d`](https://github.com/keystonejs/keystone/commit/94c8d349d3795cd9abec407f78752417623ee56f)]:
  - @keystonejs/keystone@19.0.0
  - @keystonejs/utils@6.0.1
  - @keystonejs/fields-auto-increment@8.1.3

## 12.0.4

### Patch Changes

- Updated dependencies [[`3b7a056bb`](https://github.com/keystonejs/keystone/commit/3b7a056bb835482ceb408a70bf97300741552d19), [`b76241695`](https://github.com/keystonejs/keystone/commit/b7624169554b01dba2185ef43856a223d32f12be), [`4768fbf83`](https://github.com/keystonejs/keystone/commit/4768fbf831ffff648e540c479a1954ae40e05aaa), [`74a8528ea`](https://github.com/keystonejs/keystone/commit/74a8528ea0dad739f4f16af32fe4f8926a188b61)]:
  - @keystonejs/keystone@18.1.0
  - @keystonejs/utils@6.0.0

## 12.0.3

### Patch Changes

- Updated dependencies [[`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95), [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95)]:
  - @keystonejs/keystone@18.0.0

## 12.0.2

### Patch Changes

- [`c4478b1c7`](https://github.com/keystonejs/keystone/commit/c4478b1c74e205232ecb321de91f0eda0e78b819) [#4008](https://github.com/keystonejs/keystone/pull/4008) Thanks [@Neonox31](https://github.com/Neonox31)! - Fixed bug in `.dropDatabase()`, relationship join tables are now correctly dropped when using a non-default `schemaName`.

## 12.0.1

### Patch Changes

- [`767a02a76`](https://github.com/keystonejs/keystone/commit/767a02a76d787a871832075402722c0df5213549) [#3868](https://github.com/keystonejs/keystone/pull/3868) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `pg` to `^8.4.0`.

- Updated dependencies [[`20c921c80`](https://github.com/keystonejs/keystone/commit/20c921c805f9ba8e779d0af584e6ff036c264bd4)]:
  - @keystonejs/keystone@17.1.0

## 12.0.0

### Major Changes

- [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74) [#3684](https://github.com/keystonejs/keystone/pull/3684) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Make `id` field on GraphQL output type non-nullable when using the default id field type

### Patch Changes

- [`85fa68456`](https://github.com/keystonejs/keystone/commit/85fa684565d8c9c40036d4544b3c0235dbbd327b) [#3802](https://github.com/keystonejs/keystone/pull/3802) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `knex` to `^0.21.6`.

- Updated dependencies [[`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74)]:
  - @keystonejs/fields-auto-increment@8.0.0

## 11.0.7

### Patch Changes

- [`8c54a34be`](https://github.com/keystonejs/keystone/commit/8c54a34bec0f5f945447a2475f5500415eb154df) [#3740](https://github.com/keystonejs/keystone/pull/3740) Thanks [@timleslie](https://github.com/timleslie)! - Cleaned up internal logic, no functional changes.

* [`3e2ca3a2f`](https://github.com/keystonejs/keystone/commit/3e2ca3a2ffa00cb5aababee572902a78e657ec58) [#3652](https://github.com/keystonejs/keystone/pull/3652) Thanks [@Noviny](https://github.com/Noviny)! - Fixed issue #3341, allowing fieldnames to include `_`, so that field names with an underscore in them can be filtered on.

- [`bf5801070`](https://github.com/keystonejs/keystone/commit/bf5801070568bbcc1ed4f3394a293bfa5bea8b98) [#3768](https://github.com/keystonejs/keystone/pull/3768) Thanks [@tjbp](https://github.com/tjbp)! - Fixed regression in #3616 that caused a failure to fetch the result from a meta count in MariaDB/MySQL.

- Updated dependencies [[`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4), [`df0687184`](https://github.com/keystonejs/keystone/commit/df068718456d23819a7cae491870be4560b2010d), [`cc56990f2`](https://github.com/keystonejs/keystone/commit/cc56990f2e9a4ecf0c112362e8d472b9286f76bc)]:
  - @keystonejs/fields-auto-increment@7.0.0
  - @keystonejs/keystone@17.0.0

## 11.0.6

### Patch Changes

- Updated dependencies [[`83007be79`](https://github.com/keystonejs/keystone/commit/83007be798ebd751d7eb708cde366dc35999af72), [`38e3ad9c3`](https://github.com/keystonejs/keystone/commit/38e3ad9c3e7124d06f11c7046821c857cf7f9ad2), [`304701d7c`](https://github.com/keystonejs/keystone/commit/304701d7c23e98c8dc40c0f3f5512a0370107c06), [`7a1f8bbdc`](https://github.com/keystonejs/keystone/commit/7a1f8bbdcdf68c9579e17db77fa826e811abcab4), [`d95010eea`](https://github.com/keystonejs/keystone/commit/d95010eea35f40274f412dad5c2fed6b16ae6c60), [`104232785`](https://github.com/keystonejs/keystone/commit/104232785aac856be6a3ba55f8fa0fd8357237ed)]:
  - @keystonejs/keystone@16.0.0

## 11.0.5

### Patch Changes

- [`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a) [#3610](https://github.com/keystonejs/keystone/pull/3610) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `prettier` to `^2.1.1`.

* [`9dae7a5d0`](https://github.com/keystonejs/keystone/commit/9dae7a5d00a62cd0b7a4470695adc5e1678db3dc) [#3616](https://github.com/keystonejs/keystone/pull/3616) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a query generation bug when performing `count` operations on `1:1` relationships with a filter.

* Updated dependencies [[`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a), [`d7eac6629`](https://github.com/keystonejs/keystone/commit/d7eac662956fc2dffd9ea5cfedf60e51ecc1b80d), [`77aa2d7d1`](https://github.com/keystonejs/keystone/commit/77aa2d7d156a83759a7f3c26e8c5bd019966b054), [`d07f6bfb6`](https://github.com/keystonejs/keystone/commit/d07f6bfb6b3bd65036c2030d2758abdf4eca1a9e)]:
  - @keystonejs/fields-auto-increment@6.0.3
  - @keystonejs/keystone@15.0.0

## 11.0.4

### Patch Changes

- [`e9bc4367a`](https://github.com/keystonejs/keystone/commit/e9bc4367ac31f3fe3a2898198c600c76c42165b2) [#3513](https://github.com/keystonejs/keystone/pull/3513) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `knex` to `^0.21.5`.

* [`003b856e6`](https://github.com/keystonejs/keystone/commit/003b856e686cc1ee0f984c1acf024c1fa0c27837) [#3526](https://github.com/keystonejs/keystone/pull/3526) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `pg` to `^8.3.3`.

- [`16fba3b98`](https://github.com/keystonejs/keystone/commit/16fba3b98271410e570a370f610da7cd0686f294) [#3550](https://github.com/keystonejs/keystone/pull/3550) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused dependencies.

- Updated dependencies [[`cd15192cd`](https://github.com/keystonejs/keystone/commit/cd15192cdae5e476f64a257c196ca569a9440d5a), [`7bfdb79ee`](https://github.com/keystonejs/keystone/commit/7bfdb79ee43235418f098e5fe7412968dcf6c397), [`6c97a5534`](https://github.com/keystonejs/keystone/commit/6c97a5534e8a18d15aeac8b0471810fdd4d04f80), [`2e6a06202`](https://github.com/keystonejs/keystone/commit/2e6a06202299b36c36fd3efd895f2280479eac31), [`d71f98791`](https://github.com/keystonejs/keystone/commit/d71f987917509a206b1e0a994dbc6641a7cf4e06), [`28b88abd3`](https://github.com/keystonejs/keystone/commit/28b88abd369f0df12eae72107db7c24323eda4b5)]:
  - @keystonejs/keystone@14.0.2
  - @keystonejs/fields-auto-increment@6.0.2

## 11.0.3

### Patch Changes

- [`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6) [#3481](https://github.com/keystonejs/keystone/pull/3481) Thanks [@Noviny](https://github.com/Noviny)! - Updated dependencies through a major version - this shouldn't require change by consumers.

* [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e) [#3477](https://github.com/keystonejs/keystone/pull/3477) Thanks [@Noviny](https://github.com/Noviny)! - Updating dependencies:

  These changes bring the keystone dev experience inline with installing keystone from npm :D

- [`096d13fc2`](https://github.com/keystonejs/keystone/commit/096d13fc25696ed1769cf817b705dfd80da601b2) [#3463](https://github.com/keystonejs/keystone/pull/3463) Thanks [@timleslie](https://github.com/timleslie)! - Fixed bug when querying through a many-to-one-to-one relationship chain.

- Updated dependencies [[`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6), [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e), [`bbeb0f7d3`](https://github.com/keystonejs/keystone/commit/bbeb0f7d3511a8d8defe9bc2d86ea4a0ae0131fe), [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc), [`7f04d9dd2`](https://github.com/keystonejs/keystone/commit/7f04d9dd21ad792b540d9e0a5d83356c091597ad)]:
  - @keystonejs/keystone@14.0.1
  - @keystonejs/utils@5.4.3
  - @keystonejs/fields-auto-increment@6.0.1

## 11.0.2

### Patch Changes

- Updated dependencies [[`25f50dadc`](https://github.com/keystonejs/keystone/commit/25f50dadc07d888de18d485244c84d17462dce2e), [`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593), [`f714ac1e2`](https://github.com/keystonejs/keystone/commit/f714ac1e2c49ef44d756e35042bdb7da6db589a7), [`c243839c1`](https://github.com/keystonejs/keystone/commit/c243839c12abc8cffe8ff788fe57dcb880dc3a41)]:
  - @keystonejs/keystone@14.0.0
  - @keystonejs/fields-auto-increment@6.0.0

## 11.0.1

### Patch Changes

- Updated dependencies [[`af5171563`](https://github.com/keystonejs/keystone/commit/af51715637433bcdd2538835c98ac71a8eb86122), [`271f1a40b`](https://github.com/keystonejs/keystone/commit/271f1a40b97e03aaa00ce920a6515b8f18669428), [`22b4a5c1a`](https://github.com/keystonejs/keystone/commit/22b4a5c1a13c3cca47190467be9d56e836f180f1), [`afe661e60`](https://github.com/keystonejs/keystone/commit/afe661e607539df13584d460e1016ba0fa883cb8), [`04f9be03d`](https://github.com/keystonejs/keystone/commit/04f9be03de7fe82035205379208511c6e49890b3), [`ef7074977`](https://github.com/keystonejs/keystone/commit/ef70749775ce1565eafd7f94c3d7438c8ebd474e), [`e07c42d4e`](https://github.com/keystonejs/keystone/commit/e07c42d4ec75d5703bec4a2e419a42d18bed90ca), [`5a3849806`](https://github.com/keystonejs/keystone/commit/5a3849806d00e62b722461d02f6e4639bc45c1eb), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2)]:
  - @keystonejs/keystone@13.0.0
  - @keystonejs/fields-auto-increment@5.1.12

## 11.0.0

### Major Changes

- [`c9ca62876`](https://github.com/keystonejs/keystone/commit/c9ca628765f1ecb599c8556de2d31567ddf12504) [#3223](https://github.com/keystonejs/keystone/pull/3223) Thanks [@timleslie](https://github.com/timleslie)! - Adapters must now be explicitly configured with a connection string. A default based on the project name is no longer used. See the docs for [`adapter-knex`](/packages/adapter-knex/README.md) and [`adapter-mongoose`](/packages/adapter-mongoose/README.md).

### Patch Changes

- [`51c898537`](https://github.com/keystonejs/keystone/commit/51c898537c7fdc8578fa47eade6a499594b0d154) [#3225](https://github.com/keystonejs/keystone/pull/3225) Thanks [@BikramjeetSingh](https://github.com/BikramjeetSingh)! - Fix bug where fields that contain underscores cause runtime error in Knex Adapter

* [`7bdec6446`](https://github.com/keystonejs/keystone/commit/7bdec6446ed97fa962bb96abe07975bb23c6ec7a) [#3264](https://github.com/keystonejs/keystone/pull/3264) Thanks [@timleslie](https://github.com/timleslie)! - Fixed bug where `_is_null` queries on relationship fields could generate invalid SQL in `one-to-one` relationships.

* Updated dependencies [[`5ad84ccd8`](https://github.com/keystonejs/keystone/commit/5ad84ccd8d008188e293629e90a4d7e7fde55333), [`61cdafe20`](https://github.com/keystonejs/keystone/commit/61cdafe20e0a22b5a1f9b6a2dcc4aefa45a26902), [`8480f889a`](https://github.com/keystonejs/keystone/commit/8480f889a492d83ee805f19877d49fd112117939), [`49984caae`](https://github.com/keystonejs/keystone/commit/49984caaec803ed86b027c9634ac6b3f671e9ba7), [`02f069f0b`](https://github.com/keystonejs/keystone/commit/02f069f0b6e28ccfe6d5cdeb59ab01bde27a655e), [`e114894d1`](https://github.com/keystonejs/keystone/commit/e114894d1bbcea8940cf14486fc336aa8d112da7), [`5fc97cbf4`](https://github.com/keystonejs/keystone/commit/5fc97cbf4489587a3a8cb38c04ba81fc2cb1fc5a), [`56e1798d6`](https://github.com/keystonejs/keystone/commit/56e1798d6815723cfba01e6d7dc6b4fe73d4447b), [`06f86c6f5`](https://github.com/keystonejs/keystone/commit/06f86c6f5c573411f0efda565a269d1d7ccb3c66), [`81b4df318`](https://github.com/keystonejs/keystone/commit/81b4df3182fc63c583e3fae5c05c528b678cab95), [`e6909b003`](https://github.com/keystonejs/keystone/commit/e6909b0037c9d3dc4fc6131da7968a424ce02be9), [`3ce644d5f`](https://github.com/keystonejs/keystone/commit/3ce644d5f2b6e674adb2f155c0e729536079347a), [`622cc7d69`](https://github.com/keystonejs/keystone/commit/622cc7d6976ecb71f5b135c931ac0fcb4afdb1c7)]:
  - @keystonejs/keystone@12.0.0
  - @keystonejs/fields-auto-increment@5.1.11

## 10.1.0

### Minor Changes

- [`7c38e2671`](https://github.com/keystonejs/keystone/commit/7c38e267143491f38699326f02764f40f337d416) [#3085](https://github.com/keystonejs/keystone/pull/3085) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added a new \_verifyTables method to the knex adapter. This is then used by the Keystone CLI to warn when tables have not been initialised or the database might need a migration.

### Patch Changes

- [`835866e1a`](https://github.com/keystonejs/keystone/commit/835866e1a2954113d809c9f0bac186485ac6212b) [#3133](https://github.com/keystonejs/keystone/pull/3133) Thanks [@timleslie](https://github.com/timleslie)! - Fixed bug with deleting items in lists with a one-to-many one-sided relationship.

- Updated dependencies [[`8df24d2ab`](https://github.com/keystonejs/keystone/commit/8df24d2ab4bed8a7fc1a856c20a571781dd7c04e), [`33046a66f`](https://github.com/keystonejs/keystone/commit/33046a66f33a82cf099880303b44d9736344667d), [`7c38e2671`](https://github.com/keystonejs/keystone/commit/7c38e267143491f38699326f02764f40f337d416)]:
  - @keystonejs/keystone@11.0.0

## 10.0.2

### Patch Changes

- Updated dependencies [[`4104e1f15`](https://github.com/keystonejs/keystone/commit/4104e1f15c545c05f680e8d16413862e875ca57a), [`cbfc67470`](https://github.com/keystonejs/keystone/commit/cbfc6747011329f7210e79ebe228f44ed8607321), [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb), [`3204ae785`](https://github.com/keystonejs/keystone/commit/3204ae78576b0ab5649d5f5ae9cfbb1def347af1), [`4b06157be`](https://github.com/keystonejs/keystone/commit/4b06157be6cffde2d88969823f7c410fefd82317), [`839666e25`](https://github.com/keystonejs/keystone/commit/839666e25d8bffefd034e6344e11d72dd43b925b), [`64c0d68ac`](https://github.com/keystonejs/keystone/commit/64c0d68acb1ee969097a8fe59b5c296473790c5c), [`b696b2acb`](https://github.com/keystonejs/keystone/commit/b696b2acbf7def8dba41f46ccef5ff852703b95a), [`d970580e1`](https://github.com/keystonejs/keystone/commit/d970580e14904ba2f2ac5e969257e71f77ab67d7)]:
  - @keystonejs/keystone@10.0.0
  - @keystonejs/logger@5.1.2
  - @keystonejs/fields-auto-increment@5.1.9

## 10.0.1

### Patch Changes

- [`63e00d80`](https://github.com/keystonejs/keystone/commit/63e00d805f3653863002befdaeda74c711f36f6b) [#2973](https://github.com/keystonejs/keystone/pull/2973) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug which could lead to data loss (knex adapter only) when deleting items from a list which was the `1` side of a `1:N` relationship.

## 10.0.0

### Major Changes

- [`babed628`](https://github.com/keystonejs/keystone/commit/babed628a408d7da39990a4c89a19828468555a8) [#2862](https://github.com/keystonejs/keystone/pull/2862) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated dependencies `knex` from `.0.20.6` to `0.21.1` and`pg` from `7.17.0` to `8.0.3`.

### Minor Changes

- [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533) [#2660](https://github.com/keystonejs/keystone/pull/2660) Thanks [@Vultraz](https://github.com/Vultraz)! - Added new `sortBy` query argument.

  Each list now has an additional `Sort<List>By` enum type that represents the valid sorting options for all orderable fields in the list. `sortBy` takes one or more of these enum types, allowing for multi-field/column sorting.

### Patch Changes

- Updated dependencies [[`12126788`](https://github.com/keystonejs/keystone/commit/121267885eb3e279eb5b6d035568f547323dd245), [`e0e3e30a`](https://github.com/keystonejs/keystone/commit/e0e3e30a9051741de3f5a0c12ba00f2238d54800), [`c8e52f3b`](https://github.com/keystonejs/keystone/commit/c8e52f3ba892269922c1ed3af0c2114f07387704), [`2a1e4f49`](https://github.com/keystonejs/keystone/commit/2a1e4f49d7f234c49e5b04440ff786ddf3e9e7ed), [`9e2e0071`](https://github.com/keystonejs/keystone/commit/9e2e00715aff50f2ddfedf3dbc14f390275ff23b), [`b5c44934`](https://github.com/keystonejs/keystone/commit/b5c4493442c5e4cfeba23c058a9a6819c628aab9), [`0fbc5b98`](https://github.com/keystonejs/keystone/commit/0fbc5b989a9f96248d1bd7f2f589fe77cb1d8f7d), [`e3d46ce4`](https://github.com/keystonejs/keystone/commit/e3d46ce4bd9f9ec8808ab3194672c6849e624e27), [`da1359df`](https://github.com/keystonejs/keystone/commit/da1359dfc1bff7e27505eff876efe3a0865bae2d), [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533)]:
  - @keystonejs/keystone@9.0.0
  - @keystonejs/utils@5.4.1
  - @keystonejs/fields-auto-increment@5.1.7

## 9.0.3

### Patch Changes

- [`875aa0ed`](https://github.com/keystonejs/keystone/commit/875aa0ed787d901061aa0409160a360546014df3) [#2796](https://github.com/keystonejs/keystone/pull/2796) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug with updating one-to-one relationship values.

## 9.0.2

### Patch Changes

- [`98be4b48`](https://github.com/keystonejs/keystone/commit/98be4b4858f0f2cd672910acc5e6cc0c079ce21f) [#2785](https://github.com/keystonejs/keystone/pull/2785) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug with `where` queries again one-to-one relationships.

- Updated dependencies [[`6a27fcf1`](https://github.com/keystonejs/keystone/commit/6a27fcf1896c5a745308346e5b0e66dd8bdd57a3), [`98e9f6d1`](https://github.com/keystonejs/keystone/commit/98e9f6d16e16ee13d2a8a22eb25be9cd2afc6fc0)]:
  - @keystonejs/keystone@8.1.2

## 9.0.1

### Patch Changes

- [`c1345884`](https://github.com/keystonejs/keystone/commit/c134588491c73fabbd5186df1787bce5aec5c7c7) [#2666](https://github.com/keystonejs/keystone/pull/2666) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug with `_allItemsMeta { count }` queries on one-to-one relationships.

## 9.0.0

### Major Changes

- [`fd685241`](https://github.com/keystonejs/keystone/commit/fd68524135025e4d800b4a98932916736dd50e9d) [#2000](https://github.com/keystonejs/keystone/pull/2000) Thanks [@timleslie](https://github.com/timleslie)! - ## Release - Arcade

  This release introduces a **new and improved data schema** for Keystone.
  The new data schema simplifies the way your data is stored and will unlock the development of new functionality within Keystone.

  > **Important:** You will need to make changes to your database to take advantage of the new data schema. Please read the full [release notes](https://www.keystonejs.com/discussions/new-data-schema) for instructions on updating your database.

### Patch Changes

- Updated dependencies [[`fd685241`](https://github.com/keystonejs/keystone/commit/fd68524135025e4d800b4a98932916736dd50e9d)]:
  - @keystonejs/keystone@8.0.0
  - @keystonejs/fields-auto-increment@5.1.6

## 8.0.0

### Major Changes

- [`2ae2bd47`](https://github.com/keystonejs/keystone/commit/2ae2bd47eb54a816cfd4c8cd178c460729cbc258) [#2623](https://github.com/keystonejs/keystone/pull/2623) Thanks [@maryam-mv](https://github.com/maryam-mv)! - Updated @sindresorhus/slugify to fix a problem where it was producing unexpected output, eg. adding unexpected underscores: 'NAME1 Website' => 'nam_e1_website'. The slugify output for db name may be different with this change. For the above example, the output will now be 'name_1_website' for the same string.

  If your database name changes unexpectedly, you can add an environment variable called `DATABASE_URL` with a full path to the database. For more information on configuring database connections read the documentation for the [Knex adapter](https://v5.keystonejs.com/keystonejs/adapter-knex/#knexoptions) or [Mongoose adapter](https://v5.keystonejs.com/keystonejs/adapter-mongoose/#mongoose-database-adapter).

  If you are using the `Slug` field type, in some edge-cases, slugs may change when saved after this update. You can use the `generate` option on the slug field for [custom slug generation](https://v5.keystonejs.com/keystonejs/fields/src/types/slug/#custom-generate-method) if required.

### Patch Changes

- [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063) [#2593](https://github.com/keystonejs/keystone/pull/2593) Thanks [@jossmac](https://github.com/jossmac)! - Applied a more consistent voice throughout documentation.

- Updated dependencies [[`4a7d1eab`](https://github.com/keystonejs/keystone/commit/4a7d1eabf9b44fac7e16dfe20afdce409986e8dc), [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063), [`3407fa68`](https://github.com/keystonejs/keystone/commit/3407fa68b91d7ebb3e7288c7e95631013fe12535), [`c2b1b725`](https://github.com/keystonejs/keystone/commit/c2b1b725a9474348964a4ac2e0f5b4aaf1a7f486)]:
  - @keystonejs/keystone@7.1.0
  - @keystonejs/fields-auto-increment@5.1.5

## 7.0.0

### Major Changes

- [`cec7ba5e`](https://github.com/keystonejs/keystone/commit/cec7ba5e2061280eff2a1d989054ecb02760e36d) [#2544](https://github.com/keystonejs/keystone/pull/2544) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `prepareFieldAdapter()` method of `BaseListAdapter`, `MongooseAdapter` and `KnexListAdapter`. No action is required unless you were explicitly using this method in your code.

### Minor Changes

- [`ca28681c`](https://github.com/keystonejs/keystone/commit/ca28681ca23c74bc57041fa36c20b93a4520e762) [#2543](https://github.com/keystonejs/keystone/pull/2543) Thanks [@timleslie](https://github.com/timleslie)! - `BaseKeystoneAdapter.connect` and `BaseKeystoneAdapter.postConnect` both now accept a `rels` argument, which provides information about the relationships in the system.

### Patch Changes

- [`abac6ad8`](https://github.com/keystonejs/keystone/commit/abac6ad83ad71f40047473c81d50b6af80ad41b2) [#2492](https://github.com/keystonejs/keystone/pull/2492) Thanks [@timleslie](https://github.com/timleslie)! - Refactored internals to prepare for future changes.

* [`663ae7b4`](https://github.com/keystonejs/keystone/commit/663ae7b453f450f077795fbbc6c9f138e6b27f52) [#2552](https://github.com/keystonejs/keystone/pull/2552) Thanks [@timleslie](https://github.com/timleslie)! - Added `asyncForEach` to `utils` package for iteratively executing an async function over an array.

* Updated dependencies [[`b6a555c2`](https://github.com/keystonejs/keystone/commit/b6a555c28296394908757f7404b72bc6b828b52a), [`ca28681c`](https://github.com/keystonejs/keystone/commit/ca28681ca23c74bc57041fa36c20b93a4520e762), [`68be8f45`](https://github.com/keystonejs/keystone/commit/68be8f452909100fbddec431d6fe60c20a06a700), [`61a70503`](https://github.com/keystonejs/keystone/commit/61a70503f6c184a8f0f5440466399f12e6d7fa41), [`cec7ba5e`](https://github.com/keystonejs/keystone/commit/cec7ba5e2061280eff2a1d989054ecb02760e36d), [`663ae7b4`](https://github.com/keystonejs/keystone/commit/663ae7b453f450f077795fbbc6c9f138e6b27f52)]:
  - @keystonejs/keystone@7.0.0
  - @keystonejs/utils@5.4.0
  - @keystonejs/fields-auto-increment@5.1.4

## 6.3.2

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

- Updated dependencies [[`10e88dc3`](https://github.com/keystonejs/keystone/commit/10e88dc3d81f5e021db0bfb31f7547852c602c14), [`e46f0adf`](https://github.com/keystonejs/keystone/commit/e46f0adf97141e1f1205787453173a0585df5bc3), [`6975f169`](https://github.com/keystonejs/keystone/commit/6975f16959bde3fe0e861977471c94a8c9f2c0b0), [`42497b8e`](https://github.com/keystonejs/keystone/commit/42497b8ebbaeaf0f4d7881dbb76c6abafde4cace), [`97fb01fe`](https://github.com/keystonejs/keystone/commit/97fb01fe5a32f5003a084c1fd357852fc28f74e4), [`6111e065`](https://github.com/keystonejs/keystone/commit/6111e06554a6aa6db0f7df1a6c16f9da8e81fce4), [`2d1069f1`](https://github.com/keystonejs/keystone/commit/2d1069f11f5f8941b0a18e482541043c853ebb4f), [`949f2f6a`](https://github.com/keystonejs/keystone/commit/949f2f6a3889492015281ffba45a8b3d37e6d888), [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20)]:
  - @keystonejs/keystone@6.0.0
  - @keystonejs/fields-auto-increment@5.1.2
  - @keystonejs/logger@5.1.1
  - @keystonejs/utils@5.2.2

## 6.3.1

### Patch Changes

- [`635529c9`](https://github.com/keystonejs/keystone/commit/635529c9f227ae968332cd32e63875c4561af926) [#2431](https://github.com/keystonejs/keystone/pull/2431) Thanks [@Vultraz](https://github.com/Vultraz)! - Skip database version validation when not using a PostgreSQL client.

- Updated dependencies [[`7ce804a8`](https://github.com/keystonejs/keystone/commit/7ce804a877300709375e5bc14206080ab15aec54), [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09), [`3abc5883`](https://github.com/keystonejs/keystone/commit/3abc58831e0f9b5871569a3fa6b21be7dc269cf3), [`8bdbb114`](https://github.com/keystonejs/keystone/commit/8bdbb114f6b2864693ae6e534df6fe8ee8345a60)]:
  - @keystonejs/keystone@5.6.0
  - @keystonejs/fields-auto-increment@5.1.1
  - @keystonejs/utils@5.2.1

## 6.3.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/fields-auto-increment@5.1.0
  - @keystonejs/keystone@5.5.0
  - @keystonejs/logger@5.1.0
  - @keystonejs/utils@5.2.0

## 6.2.0

### Minor Changes

- [`5b058a63`](https://github.com/keystonejs/keystone/commit/5b058a633c84465c9dff7cf940c8cb12bddcf215) [#2292](https://github.com/keystonejs/keystone/pull/2292) - Implemented a basic search on name field. This makes the Relationship and list search work the same as the mongoose adapter.

### Patch Changes

- Updated dependencies [[`eb36cf37`](https://github.com/keystonejs/keystone/commit/eb36cf3731984cc7cf60b60cb1c043962252610f), [`8f54a4eb`](https://github.com/keystonejs/keystone/commit/8f54a4eb2d63ed042d736fd20ab622f326e111b8)]:
  - @keystonejs/keystone@5.4.3

## 6.1.4

### Patch Changes

- [`c335a196`](https://github.com/keystonejs/keystone/commit/c335a19693a804d9ff4af9eb2825c666f851a597) [#2270](https://github.com/keystonejs/keystone/pull/2270) - Added an internal method `_createTables()` to factor out table creation.

* [`5a99cc7a`](https://github.com/keystonejs/keystone/commit/5a99cc7a8523ad5ca83d3e369b604247196fb8f2) [#2262](https://github.com/keystonejs/keystone/pull/2262) - Internal code modifications, no functional changes.

## 6.1.3

### Patch Changes

- [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29) [#2189](https://github.com/keystonejs/keystone/pull/2189) - Upgraded prettier to 1.19.1 and formatted code accordingly.

* [`4cd4499d`](https://github.com/keystonejs/keystone/commit/4cd4499d9d19a5b379b2ae6ab1028c008248629a) [#2190](https://github.com/keystonejs/keystone/pull/2190) - Upgraded `knex` to `^0.20.6` and `pg` to `^7.17.0`.
* Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a), [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29), [`05d07adf`](https://github.com/keystonejs/keystone/commit/05d07adf84059ff565cd2394f68d71d92e657485), [`78193f9c`](https://github.com/keystonejs/keystone/commit/78193f9c9d93655fb0d4b8dc494fbe4c622a4d64)]:
  - @keystonejs/fields-auto-increment@5.0.3
  - @keystonejs/utils@5.1.3
  - @keystonejs/keystone@5.4.1

## 6.1.2

### Patch Changes

- [`a9a00f98`](https://github.com/keystonejs/keystone/commit/a9a00f9815b872ca378a0c32295ad4fc17ded067) [#2125](https://github.com/keystonejs/keystone/pull/2125) - Fix syntax error causing hard crash on boot in Node

## 6.1.1

### Patch Changes

- [`3d2c4b3f`](https://github.com/keystonejs/keystone/commit/3d2c4b3fb8f05e79fc1a4a8e39077058466795a2) [#2112](https://github.com/keystonejs/keystone/pull/2112) - Added knex adaptar database version validiation
- Updated dependencies [[`ae078619`](https://github.com/keystonejs/keystone/commit/ae0786197713db779791bf4da5d92a144d46fe6f), [`3d2c4b3f`](https://github.com/keystonejs/keystone/commit/3d2c4b3fb8f05e79fc1a4a8e39077058466795a2), [`ae078619`](https://github.com/keystonejs/keystone/commit/ae0786197713db779791bf4da5d92a144d46fe6f)]:
  - @keystonejs/keystone@5.4.0
  - @keystonejs/utils@5.1.2

## 6.1.0

### Minor Changes

- [`045af44`](https://github.com/keystonejs/keystone/commit/045af44b1a9fa186dbc04c1d05b07a13ba58e3b0) [#2106](https://github.com/keystonejs/keystone/pull/2106) - Removed logic that (incorrectly) auto-detects when the DB needs to be setup (and nukes existing data).

## 6.0.0

### Major Changes

- [`44b2bc93`](https://github.com/keystonejs/keystone/commit/44b2bc938fd508ac75f6a9cbb364006b9f122711) [#1975](https://github.com/keystonejs/keystone/pull/1975) Thanks [@timleslie](https://github.com/timleslie)! - Removed `KnexListAdapter.createForeignKeys()` method.

* [`a3fdc50e`](https://github.com/keystonejs/keystone/commit/a3fdc50ebb61b38814816804b04d7cb4bc0fc70a) [#1972](https://github.com/keystonejs/keystone/pull/1972) Thanks [@timleslie](https://github.com/timleslie)! - `KnexListAdapter.realKeys` are now computed in the `postConnect()` phase, rather than at object instantiation.

- [`da62aa4a`](https://github.com/keystonejs/keystone/commit/da62aa4a0af9cf27fd59fdcfb6b960e24999254d) [#1971](https://github.com/keystonejs/keystone/pull/1971) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `KnexListAdapter.createAdjacencyTable()` method.

### Patch Changes

- [`8188d76c`](https://github.com/keystonejs/keystone/commit/8188d76cb3f5d3e112ef95fd4e1887db9a520d9d) [#1980](https://github.com/keystonejs/keystone/pull/1980) Thanks [@timleslie](https://github.com/timleslie)! - Removed `KnexRelationshipInterface.createForeignKey()`.

* [`0acdae17`](https://github.com/keystonejs/keystone/commit/0acdae17c4b2bcb234a314ad1aba311981affc8f) [#1999](https://github.com/keystonejs/keystone/pull/1999) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated the code paths for `create` and `update` operations for better internal consistency.

- [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f) [#2006](https://github.com/keystonejs/keystone/pull/2006) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated implementation of all `listAdapter.find\*()` methods to use the `itemsQuery()` API for internal consistency.

* [`860dabec`](https://github.com/keystonejs/keystone/commit/860dabecacdf81aa1563cea9a5d50add8623dac1) [#1973](https://github.com/keystonejs/keystone/pull/1973) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug which generated bad queries for deeply nested queries.

- [`721472e1`](https://github.com/keystonejs/keystone/commit/721472e1801584be5807d6637c646b1755366d3e) [#1976](https://github.com/keystonejs/keystone/pull/1976) Thanks [@timleslie](https://github.com/timleslie)! - Simplified code which performs update operations.
- Updated dependencies [[`77056ebd`](https://github.com/keystonejs/keystone/commit/77056ebdb31e58d27372925e8e24311a8c7d9e33), [`733ac847`](https://github.com/keystonejs/keystone/commit/733ac847cab488dc92a30e7b458191d750fd5a3d), [`e68fc43b`](https://github.com/keystonejs/keystone/commit/e68fc43ba006f9c958f9c81ae20b230d05c2cab6), [`d4d89836`](https://github.com/keystonejs/keystone/commit/d4d89836700413c1da2b76e9b82b649c2cac859d), [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f), [`1f4dc33d`](https://github.com/keystonejs/keystone/commit/1f4dc33d8a5ac4e38427eb215a7a8bc3504ae153), [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071), [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64)]:
  - @keystonejs/keystone@5.3.0
  - @keystonejs/fields-auto-increment@5.0.1

## 5.1.0

### Minor Changes

- [`b68b74f3`](https://github.com/keystonejs/keystone/commit/b68b74f3e77ebd91711c72aac369ab2d5905cb36) [#1903](https://github.com/keystonejs/keystone/pull/1903) Thanks [@timleslie](https://github.com/timleslie)! - Added `.tableName` property to `KnexListAdapter`.

### Patch Changes

- [`0154f892`](https://github.com/keystonejs/keystone/commit/0154f892a1771b4f88b35f34a1ba47eaf1721dfe) [#1914](https://github.com/keystonejs/keystone/pull/1914) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded `pg` and `knex` dependencies.
- Updated dependencies [[`45fd7ab8`](https://github.com/keystonejs/keystone/commit/45fd7ab899655364d0071c0d276d188378944ff5), [`b0756c65`](https://github.com/keystonejs/keystone/commit/b0756c65525625919c72364d8cefc32d864c7c0e), [`d132a3c6`](https://github.com/keystonejs/keystone/commit/d132a3c64aec707b98ed9a9ceffee44a98749b0a)]:
  - @keystonejs/keystone@5.1.1

## 5.0.1

### Patch Changes

- [`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469) [#1851](https://github.com/keystonejs/keystone/pull/1851) Thanks [@jesstelford](https://github.com/jesstelford)! - Added runtime database version validation

- Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469)]:
  - @keystonejs/keystone@5.1.0
  - @keystonejs/utils@5.1.0

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/fields-auto-increment@5.0.0
  - @keystonejs/keystone@5.0.0
  - @keystonejs/logger@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/adapter-knex

## 6.0.2

### Patch Changes

- [`768420f5`](https://github.com/keystonejs/keystone/commit/768420f567c244d57a4e2a3aaafe628ea9813d9d) [#1781](https://github.com/keystonejs/keystone/pull/1781) Thanks [@simonswiss](https://github.com/simonswiss)! - changing require path to "@keystone-alpha" instead of "@keystonejs"

- Updated dependencies [[`0a36b0f4`](https://github.com/keystonejs/keystone/commit/0a36b0f403da73a76106b5e14940a789466b4f94), [`3bc02545`](https://github.com/keystonejs/keystone/commit/3bc025452fb8e6e69790bdbee032ddfdeeb7dabb), [`a48281ba`](https://github.com/keystonejs/keystone/commit/a48281ba605bf5bebc89fcbb36d3e69c17182eec), [`effc1f63`](https://github.com/keystonejs/keystone/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/keystone@16.1.0
  - @keystone-alpha/fields-auto-increment@2.0.5

## 6.0.1

### Patch Changes

- [`64ac0665`](https://github.com/keystonejs/keystone/commit/64ac0665a0b8b52a7c68678f6d478c8206d82e95) [#1770](https://github.com/keystonejs/keystone/pull/1770) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Fixes the help text shown when no db is initialised

## 6.0.0

### Major Changes

- [`6d7d0df0`](https://github.com/keystonejs/keystone/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9) [#1729](https://github.com/keystonejs/keystone/pull/1729) Thanks [@timleslie](https://github.com/timleslie)! - This change significantly changes how and when we populate `many`-relationships during queries and mutations.
  The behaviour of the GraphQL API has not changed, but queries should be more performant, particularly for items with many related items.
  The `existingItem` parameter in hooks will no longer have the `many`-relationship fields populated.
  `List.listQuery()` no longer populates `many` relationship fields.
  For most users there should not need to be any changes to code unless they are explicitly relying on a `many`-relationship field in a hook, in which case they will need to execute an explicit query to obtain the desired values.

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/keystone@16.0.0
  - @keystone-alpha/fields-auto-increment@2.0.4

## 5.0.0

### Major Changes

- [6c4df466](https://github.com/keystonejs/keystone/commit/6c4df466): `KnexListAdapter.findById()` will no longer populate `many` relationship fields.

### Patch Changes

- [84f4dbad](https://github.com/keystonejs/keystone/commit/84f4dbad): handle errors better when knex connection is an object

## 4.0.11

### Patch Changes

- [629e1ea9](https://github.com/keystonejs/keystone/commit/629e1ea9): Fix a bug which limited the number of items in a many-relatinoship to 65K
- [9b532072](https://github.com/keystonejs/keystone/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 4.0.10

- Updated dependencies [42a45bbd](https://github.com/keystonejs/keystone/commit/42a45bbd):
  - @keystone-alpha/keystone@15.1.0

## 4.0.9

- Updated dependencies [b61289b4](https://github.com/keystonejs/keystone/commit/b61289b4):
- Updated dependencies [0bba9f07](https://github.com/keystonejs/keystone/commit/0bba9f07):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone/commit/9ade2b2d):
  - @keystone-alpha/keystone@15.0.0
  - @keystone-alpha/fields-auto-increment@2.0.1

## 4.0.8

- Updated dependencies [decf7319](https://github.com/keystonejs/keystone/commit/decf7319):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone/commit/89c0d7e9):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone/commit/89c0d7e9):
- Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone/commit/a8e9378d):
  - @keystone-alpha/keystone@14.0.0
  - @keystone-alpha/fields-auto-increment@2.0.0

## 4.0.7

- Updated dependencies [8d0d98c7](https://github.com/keystonejs/keystone/commit/8d0d98c7):
  - @keystone-alpha/keystone@13.0.0

## 4.0.6

### Patch Changes

- [7e280f57](https://github.com/keystonejs/keystone/commit/7e280f57): Updates warning message when knex cannot find a database

## 4.0.5

- Updated dependencies [33001656](https://github.com/keystonejs/keystone/commit/33001656):
  - @keystone-alpha/keystone@12.0.0

## 4.0.4

- Updated dependencies [e42fdb4a](https://github.com/keystonejs/keystone/commit/e42fdb4a):
  - @keystone-alpha/keystone@11.0.0

## 4.0.3

- Updated dependencies [b86f0e26](https://github.com/keystonejs/keystone/commit/b86f0e26):
  - @keystone-alpha/keystone@10.5.0

## 4.0.2

### Patch Changes

- [5631ce3c](https://github.com/keystonejs/keystone/commit/5631ce3c): Faster Knex query generation
- [b8d30f57](https://github.com/keystonejs/keystone/commit/b8d30f57): Minor performance improvements to Knex adapter

## 4.0.1

### Patch Changes

- [3eeb07c7](https://github.com/keystonejs/keystone/commit/3eeb07c7): - Re-instate default config for Knex adapter
  - Throw the correct error object when a connection error occurs in the Knex
    Database

## 4.0.0

### Major Changes

- [144e6e86](https://github.com/keystonejs/keystone/commit/144e6e86): - API Changes to Adapters: - Configs are now passed directly to the adapters rather than via `adapterConnectOptions`. - Default connections strings changed for both Knex and Mongoose adapters to be more inline with system defaults. - `keystone.connect()` no longer accepts a `to` paramter - the connection options must be passed to the adapter constructor (as above).

### Patch Changes

- [87155453](https://github.com/keystonejs/keystone/commit/87155453): Refactor Knex query builder to fix many-to-many filtering in complex queries, and reduce the number of database calls
- [e049cfcb](https://github.com/keystonejs/keystone/commit/e049cfcb): Knex adapter is smarter about default values

## 3.0.0

### Major Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Adding isIndexed field config and support for in most field types
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade knex to 0.19.0
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Fixing application of some field config on knex
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Adding `AutoIncrement` field type
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Reload all columns after insert (knex); fixes #1399

## 2.1.0

### Minor Changes

- [18064167](https://github.com/keystonejs/keystone/commit/18064167):

  Adding `knexOptions` to the KnexFieldAdapter to support DB-level config for nullability (`isNotNullable`) and defaults (`defaultTo`)

* Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone/commit/4007f5dd):
  - @keystone-alpha/keystone@8.0.0

## 2.0.0

### Major Changes

- [2b094b7f](https://github.com/keystonejs/keystone/commit/2b094b7f):

  Refactoring the knex adapter (and field adapters) to give the field type more control of the table schema (add 0 or multiple columns, etc)

## 1.1.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):

  Move Knex Database Dropping from _always_ to _with config `dropDatabase: true`_.

* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):
  - @keystone-alpha/keystone@7.0.0

## 1.0.9

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):
  - @keystone-alpha/keystone@6.0.0

## 1.0.8

- Updated dependencies [dfcabe6a](https://github.com/keystonejs/keystone/commit/dfcabe6a):
  - @keystone-alpha/keystone@5.0.0

## 1.0.7

### Patch Changes

- [bd0ea21f](https://github.com/keystonejs/keystone/commit/bd0ea21f):

  - Add .isRequired and .isUnique properties to field adapters

- [81dc0be5](https://github.com/keystonejs/keystone/commit/81dc0be5):

  - Update dependencies

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone/commit/24cd26ee):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone/commit/2ef2658f):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone/commit/ae5cf6cc):
* Updated dependencies [b22d6c16](https://github.com/keystonejs/keystone/commit/b22d6c16):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone/commit/b7a2ea9c):
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/utils@3.0.0

## 1.0.6

- [patch][4eb2dcd0](https://github.com/keystonejs/keystone/commit/4eb2dcd0):

  - Fix bug in \_some, \_none, \_every queries

## 1.0.5

- [patch][b4dcf44b](https://github.com/keystonejs/keystone/commit/b4dcf44b):

  - Use named exports from @keystone-alpha/keystone package.

- [patch][3e3738dd](https://github.com/keystonejs/keystone/commit/3e3738dd):

  - Restructure internal code

- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone/commit/b4dcf44b):
  - @keystone-alpha/keystone@3.0.0

## 1.0.4

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone/commit/8d385ede):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone/commit/52f1c47b):
  - @keystone-alpha/keystone@2.0.0

## 1.0.3

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone/commit/98c02a46):
  - @keystone-alpha/keystone@1.0.4
  - @keystone-alpha/utils@2.0.0

## 1.0.2

- [patch][3a775092](https://github.com/keystonejs/keystone/commit/3a775092):

  - Update dependencies

- [patch][7417ea3a](https://github.com/keystonejs/keystone/commit/7417ea3a):

  - Update patch-level dependencies

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/adapter-knex

## 0.0.3

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

## 0.0.2

- [patch] 6471fc4a:

  - Add fieldAdaptersByPath object to field adapters
