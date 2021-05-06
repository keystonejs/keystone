# @keystonejs/adapter-prisma

## 6.1.0

### Minor Changes

- [#5616](https://github.com/keystonejs/keystone/pull/5616) [`3d3894679`](https://github.com/keystonejs/keystone/commit/3d38946798650d117c39ce522987b169e616b2b9) Thanks [@timleslie](https://github.com/timleslie)! - Added an `isIndexed` config option to the `text`, `integer`, `float`, `select`, and `timestamp` field types.

### Patch Changes

- Updated dependencies [[`3d3894679`](https://github.com/keystonejs/keystone/commit/3d38946798650d117c39ce522987b169e616b2b9)]:
  - @keystone-next/fields@8.1.0

## 6.0.1

### Patch Changes

- [#5571](https://github.com/keystonejs/keystone/pull/5571) [`05d4883ee`](https://github.com/keystonejs/keystone/commit/05d4883ee19bcfdfcbff7f80693a3fa85cf81aaa) Thanks [@timleslie](https://github.com/timleslie)! - Added a `beforeExit` handler to explicitly terminate the prisma child process to avoid zombie processes when the server crashes.

* [#5552](https://github.com/keystonejs/keystone/pull/5552) [`a0c5aa307`](https://github.com/keystonejs/keystone/commit/a0c5aa30771d187253d0cfe24b4b686e136136cc) Thanks [@timleslie](https://github.com/timleslie)! - Improved handling of null filter inputs.

* Updated dependencies [[`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`f7d4c9b9f`](https://github.com/keystonejs/keystone/commit/f7d4c9b9f06cc3090b59d4b29e0907e9f3d1faee), [`7e81b52b0`](https://github.com/keystonejs/keystone/commit/7e81b52b0f2240f0c590eb8f6733360cab9fe93a), [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5), [`fdebf79cc`](https://github.com/keystonejs/keystone/commit/fdebf79cc3520ffb65979ddac7d61791f4f37324), [`8577eb3ba`](https://github.com/keystonejs/keystone/commit/8577eb3baafe9cd61c48d89aca9eff252765e5a6), [`9fd7cc62a`](https://github.com/keystonejs/keystone/commit/9fd7cc62a889f8a0f8933040bb16fcc36af7795e), [`3e33cd3ff`](https://github.com/keystonejs/keystone/commit/3e33cd3ff46f824ec3516e5810a7e5027b332a5a), [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1)]:
  - @keystone-next/fields@8.0.0
  - @keystone-next/types@17.0.1
  - @keystone-next/utils-legacy@10.0.0

## 6.0.0

### Major Changes

- [#5397](https://github.com/keystonejs/keystone/pull/5397) [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b) Thanks [@bladey](https://github.com/bladey)! - Updated Node engine version to 12.x due to 10.x reaching EOL on 2021-04-30.

### Minor Changes

- [#5284](https://github.com/keystonejs/keystone/pull/5284) [`8ab2c9bb6`](https://github.com/keystonejs/keystone/commit/8ab2c9bb6633c2f85844e658f534582c30a39a57) Thanks [@timleslie](https://github.com/timleslie)! - Converted package to TypeScript.

* [#5406](https://github.com/keystonejs/keystone/pull/5406) [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767) Thanks [@timleslie](https://github.com/timleslie)! - Added a `.containsConditions()` method to include string filters just for the `contains` and `not_contains` options.

### Patch Changes

- [#5406](https://github.com/keystonejs/keystone/pull/5406) [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug which added unsupported string filter options to the GraphQL API for the SQLite provider.
  Added a `.containsInputFields()` method to include string filters just for the `contains` and `not_contains` options.

* [#5442](https://github.com/keystonejs/keystone/pull/5442) [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db) Thanks [@timleslie](https://github.com/timleslie)! - Updated type definitions to be more consistent and correct.

- [#5460](https://github.com/keystonejs/keystone/pull/5460) [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated the core code from the `@keystone-next/keystone-legacy` package into `@keystone-next/keystone`.

* [#5466](https://github.com/keystonejs/keystone/pull/5466) [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78) Thanks [@timleslie](https://github.com/timleslie)! - Improved the `BaseKeystone` type to be more correct.

* Updated dependencies [[`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124), [`b0db0a7a8`](https://github.com/keystonejs/keystone/commit/b0db0a7a8d3aa46a8034022c456ea5100b129dc0), [`f059f6349`](https://github.com/keystonejs/keystone/commit/f059f6349bee3dce8bbf4a0584b235e97872851c), [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`5f2673704`](https://github.com/keystonejs/keystone/commit/5f2673704e997710a088c45e9d95d22e1195b2da), [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`ea708559f`](https://github.com/keystonejs/keystone/commit/ea708559fbd19914fe7eb52f519937e5fe50a143), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276), [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`89b869e8d`](https://github.com/keystonejs/keystone/commit/89b869e8d492151449f2146108767a7e5e5ecdfa), [`58a793988`](https://github.com/keystonejs/keystone/commit/58a7939888ec84d0f089d77ca1ce9d94ef0d9a85)]:
  - @keystone-next/types@17.0.0
  - @keystone-next/fields@7.0.0
  - @keystone-next/utils-legacy@9.0.0

## 5.0.0

### Major Changes

- [#5319](https://github.com/keystonejs/keystone/pull/5319) [`1261c398b`](https://github.com/keystonejs/keystone/commit/1261c398b94ffef2737226cceaebaed1b3c04c72) Thanks [@timleslie](https://github.com/timleslie)! - Removed legacy `PrismaAdapter.listAdapterClass`, `PrismaAdapter.postConnect()`, and `PrismaAdapter.checkDatabaseVersion()`.

* [#5302](https://github.com/keystonejs/keystone/pull/5302) [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `CLIOptionsForCreateMigration` and `createMigration` exports

- [#5324](https://github.com/keystonejs/keystone/pull/5324) [`e702fea44`](https://github.com/keystonejs/keystone/commit/e702fea44c3116db158d97b5ffd24440f09c9d49) Thanks [@timleslie](https://github.com/timleslie)! - Removed legacy `.find()`, `.findAll()`, `.findOne()`, `.findById()`, `.itemsQueryMeta()`, `.getFieldAdapterByPath()`, and `.getPrimaryKeyAdapter()` methods from `PrismaListAdapter`.

* [#5287](https://github.com/keystonejs/keystone/pull/5287) [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `getDbSchemaName` and `getPrismaPath` database adapter options. To change the database schema that Keystone uses, you can add `?schema=whatever` to the database url.

- [#5302](https://github.com/keystonejs/keystone/pull/5302) [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed formatting of Prisma schema returned from `_generatePrismaSchema` method and made it return synchronously

* [#5320](https://github.com/keystonejs/keystone/pull/5320) [`fda82869c`](https://github.com/keystonejs/keystone/commit/fda82869c376d05fd007bec22d7bde2604db445b) Thanks [@timleslie](https://github.com/timleslie)! - Removed legacy default ID field support.

- [#5285](https://github.com/keystonejs/keystone/pull/5285) [`5cd94b2a3`](https://github.com/keystonejs/keystone/commit/5cd94b2a32b3eddaf00ad77229f7e9664899c3b9) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `dropDatabase` method and config option

* [#5287](https://github.com/keystonejs/keystone/pull/5287) [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed migrationMode and all migration related methods on the adapter and instead require that a prisma client is passed to the adapter to be able to connect to the database

### Patch Changes

- [#5281](https://github.com/keystonejs/keystone/pull/5281) [`4f0abec0b`](https://github.com/keystonejs/keystone/commit/4f0abec0b19c3495c1ae6d7dac49fb46253cf7b3) Thanks [@timleslie](https://github.com/timleslie)! - Removed the legacy `BaseKeystoneAdapter`, `BaseListAdapter`, and `BaseFieldAdapter` exports.

- Updated dependencies [[`e702fea44`](https://github.com/keystonejs/keystone/commit/e702fea44c3116db158d97b5ffd24440f09c9d49), [`955787055`](https://github.com/keystonejs/keystone/commit/955787055a54fb33eb45c80dd39fa86a9ff632a0), [`fda82869c`](https://github.com/keystonejs/keystone/commit/fda82869c376d05fd007bec22d7bde2604db445b), [`4f0abec0b`](https://github.com/keystonejs/keystone/commit/4f0abec0b19c3495c1ae6d7dac49fb46253cf7b3)]:
  - @keystone-next/keystone-legacy@23.0.0

## 4.0.1

### Patch Changes

- Updated dependencies [[`e944b1ebb`](https://github.com/keystonejs/keystone/commit/e944b1ebbede95500b06028c591ee8947278a479), [`ca1be4156`](https://github.com/keystonejs/keystone/commit/ca1be415663dd822b3adda1e073bd7a1d4a9b97b), [`7ae452ad1`](https://github.com/keystonejs/keystone/commit/7ae452ad144d1186225e94ff39be0eaf9983f585), [`97609a623`](https://github.com/keystonejs/keystone/commit/97609a623334fd8d7b9e24dd099abda2e2a37853), [`45272d0b1`](https://github.com/keystonejs/keystone/commit/45272d0b1dc68e6ae8dbc4cfda790b3a50cf1b25), [`ade638de0`](https://github.com/keystonejs/keystone/commit/ade638de07142e8ecd0c3bf6c805eed76fd89878), [`2a1fc416e`](https://github.com/keystonejs/keystone/commit/2a1fc416e8f0a83e108a72fcec81b380c601f3ef), [`9e78d8818`](https://github.com/keystonejs/keystone/commit/9e78d88187d8d789e5f080fd4529742f54ff1ddd), [`5510ae33f`](https://github.com/keystonejs/keystone/commit/5510ae33fb18d42e378a00f1f78b803fb01b3fad), [`4d405390c`](https://github.com/keystonejs/keystone/commit/4d405390c0f8dcc37e6fe4da7ce3866c699088f3), [`b36758a12`](https://github.com/keystonejs/keystone/commit/b36758a121c096e8776420949c77a5304957a969), [`fe9fc5e0d`](https://github.com/keystonejs/keystone/commit/fe9fc5e0de8cefb889624e43bc281ac408bcd3b8), [`b8cd13fdf`](https://github.com/keystonejs/keystone/commit/b8cd13fdfcec645140a06b0331b240583eace061), [`32578f01e`](https://github.com/keystonejs/keystone/commit/32578f01e70ea972d438a29fa1e3793c1e02750b)]:
  - @keystone-next/keystone-legacy@22.0.0
  - @keystone-next/utils-legacy@8.0.0
  - @keystone-next/fields-auto-increment-legacy@9.0.0

## 4.0.0

### Major Changes

- [#5135](https://github.com/keystonejs/keystone/pull/5135) [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next dev` with the Prisma adapter so that it interactively prompts for creating and applying a migration

* [#5118](https://github.com/keystonejs/keystone/pull/5118) [`2ff93692a`](https://github.com/keystonejs/keystone/commit/2ff93692aaef70474449f30fb249eae8aa33a64a) Thanks [@timleslie](https://github.com/timleslie)! - Updated schema generation to add an index on all foreign key values for relationship fields.

- [#5155](https://github.com/keystonejs/keystone/pull/5155) [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `createOnly` migration mode

* [#5135](https://github.com/keystonejs/keystone/pull/5135) [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed default migrationMode from `dev` to `prototype`

### Minor Changes

- [#3946](https://github.com/keystonejs/keystone/pull/3946) [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05) Thanks [@timleslie](https://github.com/timleslie)! - Added experimental support for Prisma + SQLite as a database adapter.

* [#5102](https://github.com/keystonejs/keystone/pull/5102) [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `none-skip-client-generation` migrationMode

- [#5148](https://github.com/keystonejs/keystone/pull/5148) [`e6b16d4e9`](https://github.com/keystonejs/keystone/commit/e6b16d4e9d95be8b3d3134931cf077b92a438806) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next deploy` to use Prisma's programmatic APIs to apply migrations

* [#5155](https://github.com/keystonejs/keystone/pull/5155) [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed `keystone-next generate` so that it uses Prisma's programmatic APIs to generate migrations and it accepts the following options as command line arguments or as prompts:

  - `--name` to set the name of the migration
  - `--accept-data-loss` to allow resetting the database when it is out of sync with the migrations
  - `--allow-empty` to create an empty migration when there are no changes to the schema

- [#5152](https://github.com/keystonejs/keystone/pull/5152) [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next reset` to use Prisma's programmatic APIs to reset the database.

* [#5142](https://github.com/keystonejs/keystone/pull/5142) [`543232c3f`](https://github.com/keystonejs/keystone/commit/543232c3f151f2294cf63e0944d1724b7b0ac33e) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma to 2.19.0

### Patch Changes

- [#5059](https://github.com/keystonejs/keystone/pull/5059) [`b3c4a756f`](https://github.com/keystonejs/keystone/commit/b3c4a756fd2028d1e29967392d37098419e54ec3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced usage of prisma cli when in `migrationMode: 'prototype'` with programmatic calls to `@prisma/migrate` to improve performance

* [#5150](https://github.com/keystonejs/keystone/pull/5150) [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed) Thanks [@timleslie](https://github.com/timleslie)! - Applied eslint `import/order` rule.

- [#5059](https://github.com/keystonejs/keystone/pull/5059) [`b3c4a756f`](https://github.com/keystonejs/keystone/commit/b3c4a756fd2028d1e29967392d37098419e54ec3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed faulty optimisation that caused migrations to not be run if the prisma client directory and the prisma schema already existed

- Updated dependencies [[`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05), [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed), [`2bccf71b1`](https://github.com/keystonejs/keystone/commit/2bccf71b152a9be65a2df6a9751f1d7a382041ae), [`a4002b045`](https://github.com/keystonejs/keystone/commit/a4002b045b3e783971c382f9373159c04845beeb), [`4ac9148a0`](https://github.com/keystonejs/keystone/commit/4ac9148a0fa5b302d50e0ca4293206e2ef3616b7), [`bafdcb7bd`](https://github.com/keystonejs/keystone/commit/bafdcb7bdcba641bb8a00689a2bcefed10f4d890)]:
  - @keystone-next/fields-auto-increment-legacy@8.2.0
  - @keystone-next/keystone-legacy@21.0.0

## 3.3.0

### Minor Changes

- [#5085](https://github.com/keystonejs/keystone/pull/5085) [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added an option to pass in the prisma client to use instead of attempting to generate one and `require()`ing it to fix the experimental `enableNextJsGraphqlApiEndpoint` option not working on Vercel

### Patch Changes

- Updated dependencies [[`b44f07b6a`](https://github.com/keystonejs/keystone/commit/b44f07b6a7ce1eef6d41513096eadea5aa2be5f7), [`c45cbb9b1`](https://github.com/keystonejs/keystone/commit/c45cbb9b14010b3ced7ea012f3502998ba2ec393), [`b4b276cf6`](https://github.com/keystonejs/keystone/commit/b4b276cf66f90dce2d711c144c0d99c4752f1f5e), [`ab14e7043`](https://github.com/keystonejs/keystone/commit/ab14e70435ef89cf702d407c90396eca53bc3f4d), [`7ad7430dc`](https://github.com/keystonejs/keystone/commit/7ad7430dc377f79f7ad4024879ec2966ba0d185f)]:
  - @keystone-next/utils-legacy@7.0.0
  - @keystone-next/keystone-legacy@20.0.0
  - @keystone-next/fields-auto-increment-legacy@8.1.6

## 3.2.0

### Minor Changes

- [`7bb173018`](https://github.com/keystonejs/keystone/commit/7bb173018afc6d8af4c602dc86c5c4b471277b97) [#5040](https://github.com/keystonejs/keystone/pull/5040) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated Prisma to 2.18.0

## 3.1.0

### Minor Changes

- [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc) [#4892](https://github.com/keystonejs/keystone/pull/4892) Thanks [@timleslie](https://github.com/timleslie)! - Added support for configuring the field to use for `search` filtering via the `searchField` list adapter config option.

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

* [`f32316e6d`](https://github.com/keystonejs/keystone/commit/f32316e6deafdb9001874b08e3f4203250728676) [#4956](https://github.com/keystonejs/keystone/pull/4956) Thanks [@mikestecker](https://github.com/mikestecker)! - Fixed errors when using a schema path containing a space character.

- [`00f19daee`](https://github.com/keystonejs/keystone/commit/00f19daee8bbd75fb58fb76caaa9a3de70ebfcac) [#4890](https://github.com/keystonejs/keystone/pull/4890) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a schema generation issue when two one-sided many-to-many relationships shared the same name.

* [`f826f15c6`](https://github.com/keystonejs/keystone/commit/f826f15c6e00fcfcef6d9153b261e8977f5117f1) [#4984](https://github.com/keystonejs/keystone/pull/4984) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed crash if the prisma client directory exists but the prisma schema doesn't.

* Updated dependencies [[`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7), [`6f985acc7`](https://github.com/keystonejs/keystone/commit/6f985acc775d6037ac69a01215f962285de78c75), [`4eb4753e4`](https://github.com/keystonejs/keystone/commit/4eb4753e45e5a6ca37bdc756aef7adda7f551da4), [`891cd490a`](https://github.com/keystonejs/keystone/commit/891cd490a17026f4af29f0ed9b9ca411747d1d63), [`a16d2cbff`](https://github.com/keystonejs/keystone/commit/a16d2cbffd9aa57d0cbdd783ff5ff0c699ff2d8b), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc)]:
  - @keystone-next/fields-auto-increment-legacy@8.1.5
  - @keystone-next/keystone-legacy@19.3.0
  - @keystone-next/utils-legacy@6.0.2

## 3.0.1

### Patch Changes

- [`d8f64887f`](https://github.com/keystonejs/keystone/commit/d8f64887f2aa428ea8ac35d0efa50ce05534f40b) [#4795](https://github.com/keystonejs/keystone/pull/4795) Thanks [@renovate](https://github.com/apps/renovate)! - Updated to `prisma` `2.16.1`.

- Updated dependencies [[`4035218df`](https://github.com/keystonejs/keystone/commit/4035218df390beff3d42c0d3fc21335230d8a60d), [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0)]:
  - @keystonejs/keystone@19.2.0
  - @keystonejs/fields-auto-increment@8.1.4

## 3.0.0

### Major Changes

- [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d) [#4709](https://github.com/keystonejs/keystone/pull/4709) Thanks [@timleslie](https://github.com/timleslie)! - Database adapters no longer support custom `ListAdapter` classes via the `listAdapterClass` option of `adapterConfig` in `createList()`.

### Minor Changes

- [`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf) [#4707](https://github.com/keystonejs/keystone/pull/4707) Thanks [@timleslie](https://github.com/timleslie)! - Added support for the `Decimal` field type with the Prisma database adapter.

### Patch Changes

- Updated dependencies [[`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d), [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9), [`94c8d349d`](https://github.com/keystonejs/keystone/commit/94c8d349d3795cd9abec407f78752417623ee56f)]:
  - @keystonejs/keystone@19.0.0
  - @keystonejs/utils@6.0.1
  - @keystonejs/fields-auto-increment@8.1.3

## 2.0.0

### Major Changes

- [`fc2b7101f`](https://github.com/keystonejs/keystone/commit/fc2b7101f35f20e4d729269a005816546bb37464) [#4691](https://github.com/keystonejs/keystone/pull/4691) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded Prisma to `2.15.0`, which includes the new migration framework. Added the `migrationMode` config option to the `PrismaAdapter` constructor to control how migrations are applied.

### Patch Changes

- [`6b95cb6e4`](https://github.com/keystonejs/keystone/commit/6b95cb6e4d5bea3a87e22765d5fcf31db2fc31ae) [#4692](https://github.com/keystonejs/keystone/pull/4692) Thanks [@timleslie](https://github.com/timleslie)! - Updated internals for easier development.

* [`e7d4d54e5`](https://github.com/keystonejs/keystone/commit/e7d4d54e5b94e6b376d6eab28a0f2b074f2c95ed) [#4697](https://github.com/keystonejs/keystone/pull/4697) Thanks [@timleslie](https://github.com/timleslie)! - Fixed cases sensitivity and partial string search for the Prisma adapter.

- [`a62a2d996`](https://github.com/keystonejs/keystone/commit/a62a2d996f1080051f7962b7063ae37d7e8b7e63) [#4698](https://github.com/keystonejs/keystone/pull/4698) Thanks [@timleslie](https://github.com/timleslie)! - Updated prisma schema generation to include explicit opposite field for one-sided 1:N relationships.

- Updated dependencies []:
  - @keystonejs/fields-auto-increment@8.1.2

## 1.1.2

### Patch Changes

- [`49eec4dea`](https://github.com/keystonejs/keystone/commit/49eec4dea522c6a043b3eaf93fc8be8256b00aa6) [#4640](https://github.com/keystonejs/keystone/pull/4640) Thanks [@timleslie](https://github.com/timleslie)! - Replaced usage of deprecated `findOne()` method with `findUnique()`.

- Updated dependencies [[`3b7a056bb`](https://github.com/keystonejs/keystone/commit/3b7a056bb835482ceb408a70bf97300741552d19), [`b76241695`](https://github.com/keystonejs/keystone/commit/b7624169554b01dba2185ef43856a223d32f12be), [`4768fbf83`](https://github.com/keystonejs/keystone/commit/4768fbf831ffff648e540c479a1954ae40e05aaa), [`74a8528ea`](https://github.com/keystonejs/keystone/commit/74a8528ea0dad739f4f16af32fe4f8926a188b61)]:
  - @keystonejs/keystone@18.1.0
  - @keystonejs/utils@6.0.0

## 1.1.1

### Patch Changes

- Updated dependencies [[`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95), [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95)]:
  - @keystonejs/keystone@18.0.0

## 1.1.0

### Minor Changes

- [`defd05365`](https://github.com/keystonejs/keystone/commit/defd05365f31d0d6d4b6fd9ffe0a0c3928f97e79) [#4518](https://github.com/keystonejs/keystone/pull/4518) Thanks [@renovate](https://github.com/apps/renovate)! - `Updated prisma monorepo to`v2.12.1`.

### Patch Changes

- Updated dependencies []:
  - @keystonejs/fields-auto-increment@8.1.1

## 1.0.8

### Patch Changes

- [`325910f8d`](https://github.com/keystonejs/keystone/commit/325910f8ddaf2b620ce08d64dc97850d57840115) [#4188](https://github.com/keystonejs/keystone/pull/4188) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependencies to `2.11.0`.

* [`745270261`](https://github.com/keystonejs/keystone/commit/745270261f86337206802bd4e66541c98fd4407f) [#4076](https://github.com/keystonejs/keystone/pull/4076) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@prisma/sdk` to `2.10.2`.

* Updated dependencies [[`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c)]:
  - @keystonejs/fields-auto-increment@8.1.0

## 1.0.7

### Patch Changes

- [`f2b841b90`](https://github.com/keystonejs/keystone/commit/f2b841b90d5ac8adece645df45b8a17832391b50) [#4056](https://github.com/keystonejs/keystone/pull/4056) Thanks [@renovate](https://github.com/apps/renovate)! - Updated prisma monorepo to `2.10.0`.

- Updated dependencies [[`3dd5c570a`](https://github.com/keystonejs/keystone/commit/3dd5c570a27d0795a689407d96fc9623c90a66df)]:
  - @keystonejs/keystone@17.1.1
  - @keystonejs/fields-auto-increment@8.0.1

## 1.0.6

### Patch Changes

- [`874fb3377`](https://github.com/keystonejs/keystone/commit/874fb337786dba2a2513f754bdfb2ab93ac81598) [#4009](https://github.com/keystonejs/keystone/pull/4009) Thanks [@timleslie](https://github.com/timleslie)! - Added a `provider` config option to `PrismaAdapter`. Only `postgresql` is currently supported, and this is the default value.

## 1.0.5

### Patch Changes

- [`29d55659c`](https://github.com/keystonejs/keystone/commit/29d55659ccbb224a5b63e608d1e6bba98d053f71) [#3942](https://github.com/keystonejs/keystone/pull/3942) Thanks [@renovate](https://github.com/apps/renovate)! - Updated `prisma` dependencies to `v2.9.0`.

## 1.0.4

### Patch Changes

- [`d157e7666`](https://github.com/keystonejs/keystone/commit/d157e7666d1057cbeab7dc274244d0e130171ec9) [#3893](https://github.com/keystonejs/keystone/pull/3893) Thanks [@renovate](https://github.com/apps/renovate)! - Updated `prisma` monorepo dependency to `v2.8.1`.

- Updated dependencies [[`20c921c80`](https://github.com/keystonejs/keystone/commit/20c921c805f9ba8e779d0af584e6ff036c264bd4)]:
  - @keystonejs/keystone@17.1.0

## 1.0.3

### Patch Changes

- [`f30928db3`](https://github.com/keystonejs/keystone/commit/f30928db31b0c0a10a27b827b44afc1896dfbafe) [#3788](https://github.com/keystonejs/keystone/pull/3788) Thanks [@timleslie](https://github.com/timleslie)! - Added improved documentation.

* [`bf06edbf4`](https://github.com/keystonejs/keystone/commit/bf06edbf47e69280c3a9e270daa578528d68c447) [#3856](https://github.com/keystonejs/keystone/pull/3856) Thanks [@timleslie](https://github.com/timleslie)! - Updated `prisma` dependency to `2.8.0`. Removed `insensitiveFilters` from `previewFeatures` in `prisma.schema`..

* Updated dependencies [[`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74)]:
  - @keystonejs/fields-auto-increment@8.0.0

## 1.0.2

### Patch Changes

- [`4072ee2b2`](https://github.com/keystonejs/keystone/commit/4072ee2b2746938fc7d41dbecedaaaf0e0b3ff68) [#3821](https://github.com/keystonejs/keystone/pull/3821) Thanks [@timleslie](https://github.com/timleslie)! - Fixed queries with `{search: ""}`, which should return all items in the list.

## 1.0.1

### Patch Changes

- [`eb8180bb8`](https://github.com/keystonejs/keystone/commit/eb8180bb87b62dc3ac317c4f04f988a122c57358) [#3806](https://github.com/keystonejs/keystone/pull/3806) Thanks [@timleslie](https://github.com/timleslie)! - Fixed an issue with the prisma client not being regenerated when the schema changed.

## 1.0.0

### Major Changes

- [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4) [#3298](https://github.com/keystonejs/keystone/pull/3298) Thanks [@timleslie](https://github.com/timleslie)! - Added support for a Prisma adapter to Keystone.

### Patch Changes

- Updated dependencies [[`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4), [`df0687184`](https://github.com/keystonejs/keystone/commit/df068718456d23819a7cae491870be4560b2010d), [`cc56990f2`](https://github.com/keystonejs/keystone/commit/cc56990f2e9a4ecf0c112362e8d472b9286f76bc)]:
  - @keystonejs/fields-auto-increment@7.0.0
  - @keystonejs/keystone@17.0.0
