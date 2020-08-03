# @keystonejs/adapter-mongoose

## 9.0.1

### Patch Changes

- Updated dependencies [[`af5171563`](https://github.com/keystonejs/keystone/commit/af51715637433bcdd2538835c98ac71a8eb86122), [`271f1a40b`](https://github.com/keystonejs/keystone/commit/271f1a40b97e03aaa00ce920a6515b8f18669428), [`22b4a5c1a`](https://github.com/keystonejs/keystone/commit/22b4a5c1a13c3cca47190467be9d56e836f180f1), [`7da9d67d7`](https://github.com/keystonejs/keystone/commit/7da9d67d7d481c44a81406c6b34540a3f0a8340d), [`afe661e60`](https://github.com/keystonejs/keystone/commit/afe661e607539df13584d460e1016ba0fa883cb8), [`04f9be03d`](https://github.com/keystonejs/keystone/commit/04f9be03de7fe82035205379208511c6e49890b3), [`ef7074977`](https://github.com/keystonejs/keystone/commit/ef70749775ce1565eafd7f94c3d7438c8ebd474e), [`e07c42d4e`](https://github.com/keystonejs/keystone/commit/e07c42d4ec75d5703bec4a2e419a42d18bed90ca), [`5a3849806`](https://github.com/keystonejs/keystone/commit/5a3849806d00e62b722461d02f6e4639bc45c1eb), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2)]:
  - @keystonejs/keystone@13.0.0
  - @keystonejs/mongo-join-builder@7.1.2
  - @keystonejs/fields-mongoid@6.0.3

## 9.0.0

### Major Changes

- [`c9ca62876`](https://github.com/keystonejs/keystone/commit/c9ca628765f1ecb599c8556de2d31567ddf12504) [#3223](https://github.com/keystonejs/keystone/pull/3223) Thanks [@timleslie](https://github.com/timleslie)! - Adapters must now be explicitly configured with a connection string. A default based on the project name is no longer used. See the docs for [`adapter-knex`](/packages/adapter-knex/README.md) and [`adapter-mongoose`](/packages/adapter-mongoose/README.md).

### Patch Changes

- Updated dependencies [[`5ad84ccd8`](https://github.com/keystonejs/keystone/commit/5ad84ccd8d008188e293629e90a4d7e7fde55333), [`61cdafe20`](https://github.com/keystonejs/keystone/commit/61cdafe20e0a22b5a1f9b6a2dcc4aefa45a26902), [`8480f889a`](https://github.com/keystonejs/keystone/commit/8480f889a492d83ee805f19877d49fd112117939), [`49984caae`](https://github.com/keystonejs/keystone/commit/49984caaec803ed86b027c9634ac6b3f671e9ba7), [`02f069f0b`](https://github.com/keystonejs/keystone/commit/02f069f0b6e28ccfe6d5cdeb59ab01bde27a655e), [`e114894d1`](https://github.com/keystonejs/keystone/commit/e114894d1bbcea8940cf14486fc336aa8d112da7), [`5fc97cbf4`](https://github.com/keystonejs/keystone/commit/5fc97cbf4489587a3a8cb38c04ba81fc2cb1fc5a), [`56e1798d6`](https://github.com/keystonejs/keystone/commit/56e1798d6815723cfba01e6d7dc6b4fe73d4447b), [`06f86c6f5`](https://github.com/keystonejs/keystone/commit/06f86c6f5c573411f0efda565a269d1d7ccb3c66), [`283839cfb`](https://github.com/keystonejs/keystone/commit/283839cfb84f80818dd85699e011eee4775e550d), [`81b4df318`](https://github.com/keystonejs/keystone/commit/81b4df3182fc63c583e3fae5c05c528b678cab95), [`e6909b003`](https://github.com/keystonejs/keystone/commit/e6909b0037c9d3dc4fc6131da7968a424ce02be9), [`3ce644d5f`](https://github.com/keystonejs/keystone/commit/3ce644d5f2b6e674adb2f155c0e729536079347a), [`622cc7d69`](https://github.com/keystonejs/keystone/commit/622cc7d6976ecb71f5b135c931ac0fcb4afdb1c7)]:
  - @keystonejs/keystone@12.0.0
  - @keystonejs/mongo-join-builder@7.1.1
  - @keystonejs/fields-mongoid@6.0.2

## 8.1.3

### Patch Changes

- [`835866e1a`](https://github.com/keystonejs/keystone/commit/835866e1a2954113d809c9f0bac186485ac6212b) [#3133](https://github.com/keystonejs/keystone/pull/3133) Thanks [@timleslie](https://github.com/timleslie)! - Fixed bug with deleting items in lists with a one-to-many one-sided relationship.

- Updated dependencies [[`8df24d2ab`](https://github.com/keystonejs/keystone/commit/8df24d2ab4bed8a7fc1a856c20a571781dd7c04e), [`33046a66f`](https://github.com/keystonejs/keystone/commit/33046a66f33a82cf099880303b44d9736344667d), [`7c38e2671`](https://github.com/keystonejs/keystone/commit/7c38e267143491f38699326f02764f40f337d416)]:
  - @keystonejs/keystone@11.0.0

## 8.1.2

### Patch Changes

- Updated dependencies [[`4104e1f15`](https://github.com/keystonejs/keystone/commit/4104e1f15c545c05f680e8d16413862e875ca57a), [`ea9608342`](https://github.com/keystonejs/keystone/commit/ea960834262cec66f52fa39c1b3b07b702b3cd4d), [`cbfc67470`](https://github.com/keystonejs/keystone/commit/cbfc6747011329f7210e79ebe228f44ed8607321), [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb), [`3204ae785`](https://github.com/keystonejs/keystone/commit/3204ae78576b0ab5649d5f5ae9cfbb1def347af1), [`4b06157be`](https://github.com/keystonejs/keystone/commit/4b06157be6cffde2d88969823f7c410fefd82317), [`839666e25`](https://github.com/keystonejs/keystone/commit/839666e25d8bffefd034e6344e11d72dd43b925b), [`64c0d68ac`](https://github.com/keystonejs/keystone/commit/64c0d68acb1ee969097a8fe59b5c296473790c5c), [`b696b2acb`](https://github.com/keystonejs/keystone/commit/b696b2acbf7def8dba41f46ccef5ff852703b95a), [`d970580e1`](https://github.com/keystonejs/keystone/commit/d970580e14904ba2f2ac5e969257e71f77ab67d7)]:
  - @keystonejs/keystone@10.0.0
  - @keystonejs/fields-mongoid@6.0.0
  - @keystonejs/logger@5.1.2

## 8.1.1

### Patch Changes

- [`63e00d80`](https://github.com/keystonejs/keystone/commit/63e00d805f3653863002befdaeda74c711f36f6b) [#2973](https://github.com/keystonejs/keystone/pull/2973) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug which could lead to data loss (knex adapter only) when deleting items from a list which was the `1` side of a `1:N` relationship.

## 8.1.0

### Minor Changes

- [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533) [#2660](https://github.com/keystonejs/keystone/pull/2660) Thanks [@Vultraz](https://github.com/Vultraz)! - Added new `sortBy` query argument.

  Each list now has an additional `Sort<List>By` enum type that represents the valid sorting options for all orderable fields in the list. `sortBy` takes one or more of these enum types, allowing for multi-field/column sorting.

### Patch Changes

- [`e765ad20`](https://github.com/keystonejs/keystone/commit/e765ad20abae9838f64b72b7d43767ec87db336a) [#2866](https://github.com/keystonejs/keystone/pull/2866) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated mongodb and mongoose dependencies to latest version.

- Updated dependencies [[`12126788`](https://github.com/keystonejs/keystone/commit/121267885eb3e279eb5b6d035568f547323dd245), [`e0e3e30a`](https://github.com/keystonejs/keystone/commit/e0e3e30a9051741de3f5a0c12ba00f2238d54800), [`c8e52f3b`](https://github.com/keystonejs/keystone/commit/c8e52f3ba892269922c1ed3af0c2114f07387704), [`2a1e4f49`](https://github.com/keystonejs/keystone/commit/2a1e4f49d7f234c49e5b04440ff786ddf3e9e7ed), [`9e2e0071`](https://github.com/keystonejs/keystone/commit/9e2e00715aff50f2ddfedf3dbc14f390275ff23b), [`b5c44934`](https://github.com/keystonejs/keystone/commit/b5c4493442c5e4cfeba23c058a9a6819c628aab9), [`0fbc5b98`](https://github.com/keystonejs/keystone/commit/0fbc5b989a9f96248d1bd7f2f589fe77cb1d8f7d), [`da1359df`](https://github.com/keystonejs/keystone/commit/da1359dfc1bff7e27505eff876efe3a0865bae2d), [`60e2c7eb`](https://github.com/keystonejs/keystone/commit/60e2c7eb2298a016c68a19a056040a3b45beab2a), [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533), [`e765ad20`](https://github.com/keystonejs/keystone/commit/e765ad20abae9838f64b72b7d43767ec87db336a)]:
  - @keystonejs/keystone@9.0.0
  - @keystonejs/utils@5.4.1
  - @keystonejs/fields-mongoid@5.1.9
  - @keystonejs/mongo-join-builder@7.1.0

## 8.0.2

### Patch Changes

- [`875aa0ed`](https://github.com/keystonejs/keystone/commit/875aa0ed787d901061aa0409160a360546014df3) [#2796](https://github.com/keystonejs/keystone/pull/2796) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug with updating one-to-one relationship values.

- Updated dependencies [[`78fda9d7`](https://github.com/keystonejs/keystone/commit/78fda9d7b9a090240c946553cc42ba0bf6b8a88c)]:
  - @keystonejs/fields-mongoid@5.1.7

## 8.0.1

### Patch Changes

- [`c1345884`](https://github.com/keystonejs/keystone/commit/c134588491c73fabbd5186df1787bce5aec5c7c7) [#2666](https://github.com/keystonejs/keystone/pull/2666) Thanks [@timleslie](https://github.com/timleslie)! - Removed a stray `console.log()`.

## 8.0.0

### Major Changes

- [`fd685241`](https://github.com/keystonejs/keystone/commit/fd68524135025e4d800b4a98932916736dd50e9d) [#2000](https://github.com/keystonejs/keystone/pull/2000) Thanks [@timleslie](https://github.com/timleslie)! - ## Release - Arcade

  This release introduces a **new and improved data schema** for Keystone.
  The new data schema simplifies the way your data is stored and will unlock the development of new functionality within Keystone.

  > **Important:** You will need to make changes to your database to take advantage of the new data schema. Please read the full [release notes](https://www.keystonejs.com/discussions/new-data-schema) for instructions on updating your database.

### Patch Changes

- Updated dependencies [[`fd685241`](https://github.com/keystonejs/keystone/commit/fd68524135025e4d800b4a98932916736dd50e9d)]:
  - @keystonejs/keystone@8.0.0
  - @keystonejs/mongo-join-builder@7.0.0
  - @keystonejs/fields-mongoid@5.1.6

## 7.0.0

### Major Changes

- [`2ae2bd47`](https://github.com/keystonejs/keystone/commit/2ae2bd47eb54a816cfd4c8cd178c460729cbc258) [#2623](https://github.com/keystonejs/keystone/pull/2623) Thanks [@maryam-mv](https://github.com/maryam-mv)! - Updated @sindresorhus/slugify to fix a problem where it was producing unexpected output, eg. adding unexpected underscores: 'NAME1 Website' => 'nam_e1_website'. The slugify output for db name may be different with this change. For the above example, the output will now be 'name_1_website' for the same string.

  If your database name changes unexpectedly, you can add an environment variable called `DATABASE_URL` with a full path to the database. For more information on configuring database connections read the documentation for the [Knex adapter](https://v5.keystonejs.com/keystonejs/adapter-knex/#knexoptions) or [Mongoose adapter](https://v5.keystonejs.com/keystonejs/adapter-mongoose/#mongoose-database-adapter).

  If you are using the `Slug` field type, in some edge-cases, slugs may change when saved after this update. You can use the `generate` option on the slug field for [custom slug generation](https://v5.keystonejs.com/keystonejs/fields/src/types/slug/#custom-generate-method) if required.

### Patch Changes

- [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063) [#2593](https://github.com/keystonejs/keystone/pull/2593) Thanks [@jossmac](https://github.com/jossmac)! - Applied a more consistent voice throughout documentation.

- Updated dependencies [[`4a7d1eab`](https://github.com/keystonejs/keystone/commit/4a7d1eabf9b44fac7e16dfe20afdce409986e8dc), [`cef28dfd`](https://github.com/keystonejs/keystone/commit/cef28dfdad332cf185a577b06600acc3d8ba4888), [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063), [`2cbd38b0`](https://github.com/keystonejs/keystone/commit/2cbd38b05adc98cface11a8767f66b48a1cb0bbf), [`3407fa68`](https://github.com/keystonejs/keystone/commit/3407fa68b91d7ebb3e7288c7e95631013fe12535), [`c2b1b725`](https://github.com/keystonejs/keystone/commit/c2b1b725a9474348964a4ac2e0f5b4aaf1a7f486)]:
  - @keystonejs/keystone@7.1.0
  - @keystonejs/fields-mongoid@5.1.5

## 6.0.0

### Major Changes

- [`cec7ba5e`](https://github.com/keystonejs/keystone/commit/cec7ba5e2061280eff2a1d989054ecb02760e36d) [#2544](https://github.com/keystonejs/keystone/pull/2544) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `prepareFieldAdapter()` method of `BaseListAdapter`, `MongooseAdapter` and `KnexListAdapter`. No action is required unless you were explicitly using this method in your code.

### Minor Changes

- [`ca28681c`](https://github.com/keystonejs/keystone/commit/ca28681ca23c74bc57041fa36c20b93a4520e762) [#2543](https://github.com/keystonejs/keystone/pull/2543) Thanks [@timleslie](https://github.com/timleslie)! - `BaseKeystoneAdapter.connect` and `BaseKeystoneAdapter.postConnect` both now accept a `rels` argument, which provides information about the relationships in the system.

### Patch Changes

- Updated dependencies [[`b6a555c2`](https://github.com/keystonejs/keystone/commit/b6a555c28296394908757f7404b72bc6b828b52a), [`ca28681c`](https://github.com/keystonejs/keystone/commit/ca28681ca23c74bc57041fa36c20b93a4520e762), [`68be8f45`](https://github.com/keystonejs/keystone/commit/68be8f452909100fbddec431d6fe60c20a06a700), [`61a70503`](https://github.com/keystonejs/keystone/commit/61a70503f6c184a8f0f5440466399f12e6d7fa41), [`cec7ba5e`](https://github.com/keystonejs/keystone/commit/cec7ba5e2061280eff2a1d989054ecb02760e36d), [`663ae7b4`](https://github.com/keystonejs/keystone/commit/663ae7b453f450f077795fbbc6c9f138e6b27f52)]:
  - @keystonejs/keystone@7.0.0
  - @keystonejs/utils@5.4.0
  - @keystonejs/fields-mongoid@5.1.4

## 5.2.2

### Patch Changes

- [`83bdf743`](https://github.com/keystonejs/keystone/commit/83bdf743748e39d1ea73eff2c8e3576cc713c624) [#2538](https://github.com/keystonejs/keystone/pull/2538) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated mongo dependencies to latest version.

- Updated dependencies [[`51546e41`](https://github.com/keystonejs/keystone/commit/51546e4142fb8c66cfc413479c671a59618f885b), [`83bdf743`](https://github.com/keystonejs/keystone/commit/83bdf743748e39d1ea73eff2c8e3576cc713c624), [`d30b7498`](https://github.com/keystonejs/keystone/commit/d30b74984b21ae9fc2a3b39850f674639fbac074), [`8f22ab5e`](https://github.com/keystonejs/keystone/commit/8f22ab5eefc034f9fef4fd0f9ec2c2583fc5514f), [`599c0929`](https://github.com/keystonejs/keystone/commit/599c0929b213ebd4beb79e3ccaa685b92348ca81), [`fb510d67`](https://github.com/keystonejs/keystone/commit/fb510d67ab124d8c1bda1884fa2a0d48262b5e4d)]:
  - @keystonejs/utils@5.3.0
  - @keystonejs/keystone@6.0.2
  - @keystonejs/mongo-join-builder@6.1.3

## 5.2.1

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

- Updated dependencies [[`10e88dc3`](https://github.com/keystonejs/keystone/commit/10e88dc3d81f5e021db0bfb31f7547852c602c14), [`e46f0adf`](https://github.com/keystonejs/keystone/commit/e46f0adf97141e1f1205787453173a0585df5bc3), [`6975f169`](https://github.com/keystonejs/keystone/commit/6975f16959bde3fe0e861977471c94a8c9f2c0b0), [`42497b8e`](https://github.com/keystonejs/keystone/commit/42497b8ebbaeaf0f4d7881dbb76c6abafde4cace), [`97fb01fe`](https://github.com/keystonejs/keystone/commit/97fb01fe5a32f5003a084c1fd357852fc28f74e4), [`6111e065`](https://github.com/keystonejs/keystone/commit/6111e06554a6aa6db0f7df1a6c16f9da8e81fce4), [`2d1069f1`](https://github.com/keystonejs/keystone/commit/2d1069f11f5f8941b0a18e482541043c853ebb4f), [`949f2f6a`](https://github.com/keystonejs/keystone/commit/949f2f6a3889492015281ffba45a8b3d37e6d888), [`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722), [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20)]:
  - @keystonejs/keystone@6.0.0
  - @keystonejs/fields-mongoid@5.1.2
  - @keystonejs/logger@5.1.1
  - @keystonejs/mongo-join-builder@6.1.2
  - @keystonejs/utils@5.2.2

## 5.2.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/fields-mongoid@5.1.0
  - @keystonejs/keystone@5.5.0
  - @keystonejs/logger@5.1.0
  - @keystonejs/mongo-join-builder@6.1.0
  - @keystonejs/utils@5.2.0

## 5.1.5

### Patch Changes

- [`a34f1f72`](https://github.com/keystonejs/keystone/commit/a34f1f72613d1b7c79309ffe04fae0a79baa7737) [#2251](https://github.com/keystonejs/keystone/pull/2251) - Uses the new `mongo-join-builder` API.
- Updated dependencies [[`a34f1f72`](https://github.com/keystonejs/keystone/commit/a34f1f72613d1b7c79309ffe04fae0a79baa7737), [`7123e226`](https://github.com/keystonejs/keystone/commit/7123e226e13d3629b2ce7b6746c4292af9bf79e1)]:
  - @keystonejs/mongo-join-builder@6.0.0

## 5.1.4

### Patch Changes

- [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104) [#2191](https://github.com/keystonejs/keystone/pull/2191) - Upgraded `mongoose` to `^5.8.4` and `mongodb` to `^3.4.1`.
- Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a), [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29), [`3d7222cd`](https://github.com/keystonejs/keystone/commit/3d7222cd589ce8accbf3a9de141976c38e2c7e23), [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104), [`05d07adf`](https://github.com/keystonejs/keystone/commit/05d07adf84059ff565cd2394f68d71d92e657485), [`78193f9c`](https://github.com/keystonejs/keystone/commit/78193f9c9d93655fb0d4b8dc494fbe4c622a4d64)]:
  - @keystonejs/fields-mongoid@5.0.3
  - @keystonejs/utils@5.1.3
  - @keystonejs/keystone@5.4.1
  - @keystonejs/mongo-join-builder@5.0.2

## 5.1.3

### Patch Changes

- [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f) [#2006](https://github.com/keystonejs/keystone/pull/2006) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated implementation of all `listAdapter.find\*()` methods to use the `itemsQuery()` API for internal consistency.
- Updated dependencies [[`77056ebd`](https://github.com/keystonejs/keystone/commit/77056ebdb31e58d27372925e8e24311a8c7d9e33), [`733ac847`](https://github.com/keystonejs/keystone/commit/733ac847cab488dc92a30e7b458191d750fd5a3d), [`e68fc43b`](https://github.com/keystonejs/keystone/commit/e68fc43ba006f9c958f9c81ae20b230d05c2cab6), [`d4d89836`](https://github.com/keystonejs/keystone/commit/d4d89836700413c1da2b76e9b82b649c2cac859d), [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866), [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f), [`1f4dc33d`](https://github.com/keystonejs/keystone/commit/1f4dc33d8a5ac4e38427eb215a7a8bc3504ae153), [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071), [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64)]:
  - @keystonejs/keystone@5.3.0
  - @keystonejs/fields-mongoid@5.0.1

## 5.1.2

### Patch Changes

- [`734471e7`](https://github.com/keystonejs/keystone/commit/734471e747375ac0331255a66154d119a9bfe842) [#1926](https://github.com/keystonejs/keystone/pull/1926) Thanks [@timleslie](https://github.com/timleslie)! - Removed `mongoose-unique-validator` due to upstream bug (https://github.com/blakehaswell/mongoose-unique-validator/issues/97).

## 5.1.1

### Patch Changes

- [`ba8aef71`](https://github.com/keystonejs/keystone/commit/ba8aef71d1a04f643fb7f7590d7d6d136b1d4eba) [#1857](https://github.com/keystonejs/keystone/pull/1857) Thanks [@Vultraz](https://github.com/Vultraz)! - Deployed `mongoose-unique-validator` for a more readable error message when unique checks fail.
- Updated dependencies [[`45fd7ab8`](https://github.com/keystonejs/keystone/commit/45fd7ab899655364d0071c0d276d188378944ff5), [`b0756c65`](https://github.com/keystonejs/keystone/commit/b0756c65525625919c72364d8cefc32d864c7c0e), [`d132a3c6`](https://github.com/keystonejs/keystone/commit/d132a3c64aec707b98ed9a9ceffee44a98749b0a)]:
  - @keystonejs/keystone@5.1.1

## 5.1.0

### Minor Changes

- [`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469) [#1851](https://github.com/keystonejs/keystone/pull/1851) Thanks [@jesstelford](https://github.com/jesstelford)! - Added runtime database version validation

### Patch Changes

- [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f) [#1837](https://github.com/keystonejs/keystone/pull/1837) Thanks [@timleslie](https://github.com/timleslie)! - Updated mongo-related dependencies

- Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469), [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f), [`e4a19e3f`](https://github.com/keystonejs/keystone/commit/e4a19e3f3e261ef476aee61d24dd2639eaf61881)]:
  - @keystonejs/keystone@5.1.0
  - @keystonejs/utils@5.1.0
  - @keystonejs/mongo-join-builder@5.0.1

## 5.0.1

### Patch Changes

- [`3c19cddd`](https://github.com/keystonejs/keystone/commit/3c19cddd0b8b8d1e17385a01a813a9e84ec14bb5) [#1838](https://github.com/keystonejs/keystone/pull/1838) Thanks [@jesstelford](https://github.com/jesstelford)! - Adding a new Relationship field when using the Mongoose adapter will no longer
  cause an "\$in needs an array" error to be thrown.

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/fields-mongoid@5.0.0
  - @keystonejs/keystone@5.0.0
  - @keystonejs/logger@5.0.0
  - @keystonejs/mongo-join-builder@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/adapter-mongoose

## 6.0.1

### Patch Changes

- [`768420f5`](https://github.com/keystonejs/keystone/commit/768420f567c244d57a4e2a3aaafe628ea9813d9d) [#1781](https://github.com/keystonejs/keystone/pull/1781) Thanks [@simonswiss](https://github.com/simonswiss)! - changing require path to "@keystone-alpha" instead of "@keystonejs"

- Updated dependencies [[`0a36b0f4`](https://github.com/keystonejs/keystone/commit/0a36b0f403da73a76106b5e14940a789466b4f94), [`3bc02545`](https://github.com/keystonejs/keystone/commit/3bc025452fb8e6e69790bdbee032ddfdeeb7dabb), [`a48281ba`](https://github.com/keystonejs/keystone/commit/a48281ba605bf5bebc89fcbb36d3e69c17182eec), [`effc1f63`](https://github.com/keystonejs/keystone/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/keystone@16.1.0
  - @keystone-alpha/fields-mongoid@1.1.6

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
  - @keystone-alpha/mongo-join-builder@4.0.0
  - @keystone-alpha/fields-mongoid@1.1.5

## 5.0.0

### Major Changes

- [b96a3a58](https://github.com/keystonejs/keystone/commit/b96a3a58): Remove `.queryBuilder` property of the `MongooseListAdapter`.

### Patch Changes

- [4e6a574d](https://github.com/keystonejs/keystone/commit/4e6a574d): Internal refactor to inline the logic which was previously computed by getRelationshipQueryCondition().
- [a48ff0a3](https://github.com/keystonejs/keystone/commit/a48ff0a3): Internal refactor to move defintion of modifierConditions closer to where they're used.
- [82dfef03](https://github.com/keystonejs/keystone/commit/82dfef03): Move tokenizer functions out of this package and into `mongo-join-builder`.

- Updated dependencies [da4013e4](https://github.com/keystonejs/keystone/commit/da4013e4):
- Updated dependencies [157a439d](https://github.com/keystonejs/keystone/commit/157a439d):
  - @keystone-alpha/mongo-join-builder@3.0.0

## 4.0.8

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs
- [a7a9249b](https://github.com/keystonejs/keystone/commit/a7a9249b): Internal refactor

## 4.0.7

- Updated dependencies [42a45bbd](https://github.com/keystonejs/keystone/commit/42a45bbd):
  - @keystone-alpha/keystone@15.1.0

## 4.0.6

- Updated dependencies [b61289b4](https://github.com/keystonejs/keystone/commit/b61289b4):
- Updated dependencies [0bba9f07](https://github.com/keystonejs/keystone/commit/0bba9f07):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone/commit/9ade2b2d):
  - @keystone-alpha/keystone@15.0.0
  - @keystone-alpha/fields-mongoid@1.1.2

## 4.0.5

### Patch Changes

- [a7ac4264](https://github.com/keystonejs/keystone/commit/a7ac4264): Enabled useUnifiedTopology to address deprecation warning

- Updated dependencies [decf7319](https://github.com/keystonejs/keystone/commit/decf7319):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone/commit/89c0d7e9):
- Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone/commit/a8e9378d):
  - @keystone-alpha/keystone@14.0.0
  - @keystone-alpha/fields-mongoid@1.1.1

## 4.0.4

- Updated dependencies [8d0d98c7](https://github.com/keystonejs/keystone/commit/8d0d98c7):
  - @keystone-alpha/keystone@13.0.0

## 4.0.3

- Updated dependencies [33001656](https://github.com/keystonejs/keystone/commit/33001656):
  - @keystone-alpha/keystone@12.0.0

## 4.0.2

- Updated dependencies [e42fdb4a](https://github.com/keystonejs/keystone/commit/e42fdb4a):
  - @keystone-alpha/keystone@11.0.0

## 4.0.1

- Updated dependencies [b86f0e26](https://github.com/keystonejs/keystone/commit/b86f0e26):
  - @keystone-alpha/keystone@10.5.0

## 4.0.0

### Major Changes

- [144e6e86](https://github.com/keystonejs/keystone/commit/144e6e86): - API Changes to Adapters: - Configs are now passed directly to the adapters rather than via `adapterConnectOptions`. - Default connections strings changed for both Knex and Mongoose adapters to be more inline with system defaults. - `keystone.connect()` no longer accepts a `to` paramter - the connection options must be passed to the adapter constructor (as above).

## 3.0.1

### Patch Changes

- [ba146456](https://github.com/keystonejs/keystone/commit/ba146456): Depend on correct version of @keystone-alpha/fields-mongoid

## 3.0.0

### Major Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Adding isIndexed field config and support for in most field types
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade to mongoose 5.6.5

## 2.2.1

- Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone/commit/4007f5dd):
  - @keystone-alpha/keystone@8.0.0

## 2.2.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):

  Allow transforming input types for `equalityConditionsInsensitive` & `stringConditions` methods on the MongooseAdapter.

* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):
  - @keystone-alpha/keystone@7.0.0

## 2.1.0

### Minor Changes

- [3958a9c7](https://github.com/keystonejs/keystone/commit/3958a9c7):

  Removed the isRequired parameter from MongooseFieldAdapter.buildValidator()

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):
  - @keystone-alpha/keystone@6.0.0

## 2.0.1

- Updated dependencies [dfcabe6a](https://github.com/keystonejs/keystone/commit/dfcabe6a):
  - @keystone-alpha/keystone@5.0.0

## 2.0.0

### Major Changes

- [9a0456ff](https://github.com/keystonejs/keystone/commit/9a0456ff):

  Removing 'dbName' config option

## 1.0.7

### Patch Changes

- [bd0ea21f](https://github.com/keystonejs/keystone/commit/bd0ea21f):

  - Add .isRequired and .isUnique properties to field adapters

- [81dc0be5](https://github.com/keystonejs/keystone/commit/81dc0be5):

  - Update dependencies

- [bd0ea21f](https://github.com/keystonejs/keystone/commit/bd0ea21f):

  - `mergeSchemaOptions` now uses `this.isUnique` rather than taking it as a config paramter

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone/commit/24cd26ee):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone/commit/2ef2658f):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone/commit/ae5cf6cc):
* Updated dependencies [b22d6c16](https://github.com/keystonejs/keystone/commit/b22d6c16):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone/commit/b7a2ea9c):
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/mongo-join-builder@2.0.1
  - @keystone-alpha/utils@3.0.0

## 1.0.6

- [patch][06464afb](https://github.com/keystonejs/keystone/commit/06464afb):

  - Simplify internal APIs

## 1.0.5

- [patch][b4dcf44b](https://github.com/keystonejs/keystone/commit/b4dcf44b):

  - Use named exports from @keystone-alpha/keystone package.

- [patch][baff3c89](https://github.com/keystonejs/keystone/commit/baff3c89):

  - Use the updated logger API

- [patch][302930a4](https://github.com/keystonejs/keystone/commit/302930a4):

  - Minor internal code cleanups

- [patch][2f908f30](https://github.com/keystonejs/keystone/commit/2f908f30):

  - Use the updated mongo-join-builder package API.

- [patch][8041c67e](https://github.com/keystonejs/keystone/commit/8041c67e):

  - Restructure internal code

- Updated dependencies [baff3c89](https://github.com/keystonejs/keystone/commit/baff3c89):
- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone/commit/b4dcf44b):
- Updated dependencies [2f908f30](https://github.com/keystonejs/keystone/commit/2f908f30):
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/logger@2.0.0
  - @keystone-alpha/mongo-join-builder@2.0.0

## 1.0.4

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone/commit/8d385ede):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone/commit/52f1c47b):
  - @keystone-alpha/keystone@2.0.0

## 1.0.3

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone/commit/98c02a46):
  - @keystone-alpha/keystone@1.0.4
  - @keystone-alpha/mongo-join-builder@1.0.3
  - @keystone-alpha/utils@2.0.0

## 1.0.2

- [patch][11c372fa](https://github.com/keystonejs/keystone/commit/11c372fa):

  - Update minor-level dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

- [patch][7417ea3a](https://github.com/keystonejs/keystone/commit/7417ea3a):

  - Update patch-level dependencies

## 1.0.1

- [patch][6ba2fd99](https://github.com/keystonejs/keystone/commit/6ba2fd99):

  - Mongoose option useFindAndModify is defaulted to false, resolves deprecation warnings

- [patch][1f0bc236](https://github.com/keystonejs/keystone/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/adapter-mongoose

## 2.0.1

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] b155d942:

  - Update mongo/mongoose dependencies

## 2.0.0

- [minor] 5f891cff:

  - Add a setupHooks method to BaseFieldAdapter

- [major] 53e27d75:

  - Removes methods from Mongoose adapter classes: getFieldAdapterByQueryConditionKey, getSimpleQueryConditions, getRelationshipQueryConditions, getQueryConditions, getRelationshipQueryConditions, getRefListAdapter, hasQueryCondition.

- [patch] 797dc862:

  - Move itemsQueryMeta onto the base adapter class

- [major] 6471fc4a:

  - Remove mapsToPath method from MongooseListAdapter

- [major] 48773907:

  - Move findFieldAdapterForQuerySegment onto the BaseListAdapter

- [major] 860c3b80:

  - Add a postConnect method to list adapters to capture all the work which needs to be done after the database has been connected to

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [a3d5454d]:
  - @voussoir/core@2.0.0
  - @voussoir/mongo-join-builder@0.3.2
  - @voussoir/utils@1.0.0

## 1.0.0

- [patch] 21626b66:

  - preSave/postRead item hooks run consistently

- [patch] 929b177c:

  - Enable sorting on DateTime fields

- [major] 01718870:

  - Field configuration now tasks isRequired and isUnique, rather than required and unique

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [c83c9ed5]:
- Updated dependencies [c3ebd9e6]:
- Updated dependencies [ebae2d6f]:
- Updated dependencies [78fd9555]:
- Updated dependencies [d22820b1]:
  - @voussoir/core@1.0.0

## 0.5.0

- [patch] ff4b98c5:

  - Consolidate mongoose schema pre/post hooks for field types

- [minor] 9c383fe8:

  - Always use \$set and { new: true } in the mongoose adapter update() method

- [minor] b0d19c24:

  - Use consistent query condition builders across all field types

- Updated dependencies [45d4c379]:
  - @voussoir/core@0.7.0

## 0.4.1

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/core@0.6.0

## 0.4.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/core@0.5.0

## 0.3.2

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/core@0.4.0

## 0.3.1

- [patch] Updated dependencies [74af97e](74af97e)
  - @voussoir/mongo-join-builder@0.2.0

## 0.3.0

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [minor] Support unique field constraint for mongoose adapter [750a83e](750a83e)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/core@0.3.0
  - @voussoir/mongo-join-builder@0.1.3
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
