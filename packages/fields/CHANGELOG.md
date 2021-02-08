# @keystonejs/fields

## 21.1.0

### Minor Changes

- [`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf) [#4707](https://github.com/keystonejs/keystone/pull/4707) Thanks [@timleslie](https://github.com/timleslie)! - Added support for the `Decimal` field type with the Prisma database adapter.

* [`680169cad`](https://github.com/keystonejs/keystone/commit/680169cad62dd889ec95961cba9df3b4d012887f) [#4706](https://github.com/keystonejs/keystone/pull/4706) Thanks [@timleslie](https://github.com/timleslie)! - Changed `id` sub-field generator for `File` field type from mongoose ObjectID to `cuid` when using Knex or Prisma adapter.

### Patch Changes

- Updated dependencies [[`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf), [`619ef5051`](https://github.com/keystonejs/keystone/commit/619ef50512c09d7cf988dc3c877eed868eba68a6), [`86b597d41`](https://github.com/keystonejs/keystone/commit/86b597d410c907ed54a4948da438de48e313302f), [`c1257ca83`](https://github.com/keystonejs/keystone/commit/c1257ca834ccf5a0407debe6e7d27b45ed32a26a), [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d), [`5e22cc765`](https://github.com/keystonejs/keystone/commit/5e22cc765a8f18c467457fd2ba738cd90273c8c5), [`b9ec7fff9`](https://github.com/keystonejs/keystone/commit/b9ec7fff9d96ac56e2836543d698cf0b62b5dc8f), [`5ad7c12e8`](https://github.com/keystonejs/keystone/commit/5ad7c12e86573e73e85368076bdc1296f3f69db3), [`94c8d349d`](https://github.com/keystonejs/keystone/commit/94c8d349d3795cd9abec407f78752417623ee56f)]:
  - @keystonejs/adapter-prisma@3.0.0
  - @keystonejs/access-control@6.3.2
  - @keystonejs/adapter-knex@13.0.0
  - @keystonejs/adapter-mongoose@11.0.0
  - @keystonejs/utils@6.0.1

## 21.0.2

### Patch Changes

- Updated dependencies [[`6b95cb6e4`](https://github.com/keystonejs/keystone/commit/6b95cb6e4d5bea3a87e22765d5fcf31db2fc31ae), [`fc2b7101f`](https://github.com/keystonejs/keystone/commit/fc2b7101f35f20e4d729269a005816546bb37464), [`e7d4d54e5`](https://github.com/keystonejs/keystone/commit/e7d4d54e5b94e6b376d6eab28a0f2b074f2c95ed), [`a62a2d996`](https://github.com/keystonejs/keystone/commit/a62a2d996f1080051f7962b7063ae37d7e8b7e63)]:
  - @keystonejs/adapter-prisma@2.0.0

## 21.0.1

### Patch Changes

- [`81e86cbaa`](https://github.com/keystonejs/keystone/commit/81e86cbaa5c73633d6cb0ca2f84e834201e8bf9a) [#4653](https://github.com/keystonejs/keystone/pull/4653) Thanks [@timleslie](https://github.com/timleslie)! - Added `gqlOutputFieldResolvers` method to `DateTime` and `CalendarDay` field types, which ensures that read access control is correctly applied.

- Updated dependencies [[`49eec4dea`](https://github.com/keystonejs/keystone/commit/49eec4dea522c6a043b3eaf93fc8be8256b00aa6), [`b76241695`](https://github.com/keystonejs/keystone/commit/b7624169554b01dba2185ef43856a223d32f12be), [`79967883e`](https://github.com/keystonejs/keystone/commit/79967883edaa86d0625235b558ff0f8f87e0b79f)]:
  - @keystonejs/adapter-prisma@1.1.2
  - @keystonejs/utils@6.0.0
  - @keystonejs/app-admin-ui@7.3.13
  - @keystonejs/access-control@6.3.1
  - @keystonejs/adapter-knex@12.0.4
  - @keystonejs/adapter-mongoose@10.1.2

## 21.0.0

### Major Changes

- [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0) [#4544](https://github.com/keystonejs/keystone/pull/4544) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced `useCompiledBcrypt` option with `bcrypt` option which accepts an alternative implementation of bcrypt(such as the native `bcrypt` npm package) in the password field type.

  For example, if you had the following field definition:

  ```js
  password: { type: Password, useCompiledBcrypt: true }
  ```

  you will need to change it to:

  ```js
  password: { type: Password, bcrypt: require('bcrypt') }
  ```

### Minor Changes

- [`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b) [#4516](https://github.com/keystonejs/keystone/pull/4516) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency mongoose to `^5.11.5`.

### Patch Changes

- Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`f8873064b`](https://github.com/keystonejs/keystone/commit/f8873064b667d62001afe7950e33d019bcff7be3), [`defd05365`](https://github.com/keystonejs/keystone/commit/defd05365f31d0d6d4b6fd9ffe0a0c3928f97e79), [`d329f07a5`](https://github.com/keystonejs/keystone/commit/d329f07a5ce7ebf5d658a7f90334ba4372a2a72d)]:
  - @keystonejs/adapter-mongoose@10.1.0
  - @keystonejs/app-admin-ui@7.3.12
  - @keystonejs/adapter-prisma@1.1.0

## 20.1.3

### Patch Changes

- [`abdaeb9c1`](https://github.com/keystonejs/keystone/commit/abdaeb9c17a0f1d8e6eda1178d79107ac8770058) [#4421](https://github.com/keystonejs/keystone/pull/4421) Thanks [@miguelvvs](https://github.com/miguelvvs)! - Fixed a bug where the File field would show old state after an item is saved

## 20.1.2

### Patch Changes

- [`038b0ae65`](https://github.com/keystonejs/keystone/commit/038b0ae6586f8673de22046842b2ef993b0e1937) [#4395](https://github.com/keystonejs/keystone/pull/4395) Thanks [@miguelvvs](https://github.com/miguelvvs)! - Cancel method was modified to clear the hidden file input and be able to pick exactly the same file that was selected before the cancel action.

* [`4eef4dc55`](https://github.com/keystonejs/keystone/commit/4eef4dc5587cc06f08ead5d5d05db2e9a786b8bc) [#4409](https://github.com/keystonejs/keystone/pull/4409) Thanks [@timleslie](https://github.com/timleslie)! - Fixed [issue](https://github.com/keystonejs/keystone/issues/4310) with creating `Slug` fields when `{ queryLimits: { maxResults } }` is set.

* Updated dependencies [[`fa12a18b0`](https://github.com/keystonejs/keystone/commit/fa12a18b077367563b1b69db55274e47a1bd5027)]:
  - @keystonejs/app-admin-ui@7.3.11

## 20.1.1

### Patch Changes

- [`c62a35fe0`](https://github.com/keystonejs/keystone/commit/c62a35fe0834ec60e2472b22feedda539d18a918) [#4309](https://github.com/keystonejs/keystone/pull/4309) Thanks [@renovate](https://github.com/apps/renovate)! - Update dependency tinymce to ^5.6.0

- Updated dependencies [[`8d7056c8e`](https://github.com/keystonejs/keystone/commit/8d7056c8ed8d4fccfd61e64fc5fc2caf65899cee)]:
  - @arch-ui/drawer@0.0.25
  - @arch-ui/popout@0.0.23
  - @keystonejs/app-admin-ui@7.3.10

## 20.1.0

### Minor Changes

- [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c) [#4238](https://github.com/keystonejs/keystone/pull/4238) Thanks [@timleslie](https://github.com/timleslie)! - Added a `.getBackingTypes()` method to all `Field` implementations, which returns `{ path: { optional, type } }`. This method will be used to generate typescript types in our upcoming [new interfaces](https://www.keystonejs.com/blog/roadmap-update).

### Patch Changes

- [`7afde2fb5`](https://github.com/keystonejs/keystone/commit/7afde2fb516e1d3824d73a96308abb4a6b022400) [#4253](https://github.com/keystonejs/keystone/pull/4253) Thanks [@jossmac](https://github.com/jossmac)! - Admin UI layout experiments and general tidy, esp. fields

* [`5216e9dc6`](https://github.com/keystonejs/keystone/commit/5216e9dc6894c1a6e81765c0278dc6f7c4cc617b) [#4204](https://github.com/keystonejs/keystone/pull/4204) Thanks [@JedWatson](https://github.com/JedWatson)! - Fix Select menu cropping in create item drawer

* Updated dependencies [[`325910f8d`](https://github.com/keystonejs/keystone/commit/325910f8ddaf2b620ce08d64dc97850d57840115), [`745270261`](https://github.com/keystonejs/keystone/commit/745270261f86337206802bd4e66541c98fd4407f)]:
  - @keystonejs/adapter-prisma@1.0.8

## 20.0.0

### Major Changes

- [`a5e40e6c4`](https://github.com/keystonejs/keystone/commit/a5e40e6c4af1ab38cc2079a0f6e27d39d6b7d546) [#3549](https://github.com/keystonejs/keystone/pull/3549) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@sindresorhus/slugify` to `^1.1.0`. Includes a slight breaking change in how some slugs are computed in the `Slug` field type. See https://github.com/sindresorhus/slugify/releases/tag/v1.0.0.

### Patch Changes

- [`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da) [#3580](https://github.com/keystonejs/keystone/pull/3580) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `mongoose` to `^5.10.11`.

- Updated dependencies [[`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da), [`f2b841b90`](https://github.com/keystonejs/keystone/commit/f2b841b90d5ac8adece645df45b8a17832391b50), [`2b682d2c1`](https://github.com/keystonejs/keystone/commit/2b682d2c1b6dc798a8913e4d2e09767c7a2980ac)]:
  - @keystonejs/adapter-mongoose@10.0.1
  - @keystonejs/adapter-prisma@1.0.7
  - @keystonejs/app-admin-ui@7.3.9

## 19.1.1

### Patch Changes

- [`722f57f64`](https://github.com/keystonejs/keystone/commit/722f57f64c3cebe63041868005966367a0bfa2e3) [#4010](https://github.com/keystonejs/keystone/pull/4010) Thanks [@timleslie](https://github.com/timleslie)! - Updated Prisma data type selection for `Select` fields using the `PrismaAdapter`.

- Updated dependencies [[`c4478b1c7`](https://github.com/keystonejs/keystone/commit/c4478b1c74e205232ecb321de91f0eda0e78b819), [`874fb3377`](https://github.com/keystonejs/keystone/commit/874fb337786dba2a2513f754bdfb2ab93ac81598)]:
  - @keystonejs/adapter-knex@12.0.2
  - @keystonejs/adapter-prisma@1.0.6

## 19.1.0

### Minor Changes

- [`f13d7eaab`](https://github.com/keystonejs/keystone/commit/f13d7eaab8e6d53fa9766e419267305886900a28) [#3928](https://github.com/keystonejs/keystone/pull/3928) Thanks [@gautamsi](https://github.com/gautamsi)! - Added format option to DateTimeUtc field similar to DateTime field. This affects only the admn-ui display

### Patch Changes

- Updated dependencies [[`767a02a76`](https://github.com/keystonejs/keystone/commit/767a02a76d787a871832075402722c0df5213549), [`d157e7666`](https://github.com/keystonejs/keystone/commit/d157e7666d1057cbeab7dc274244d0e130171ec9)]:
  - @keystonejs/adapter-knex@12.0.1
  - @keystonejs/adapter-prisma@1.0.4

## 19.0.0

### Major Changes

- [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74) [#3684](https://github.com/keystonejs/keystone/pull/3684) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Make GraphQL output type field non-nullable when it is the primary key on a list

### Patch Changes

- Updated dependencies [[`f30928db3`](https://github.com/keystonejs/keystone/commit/f30928db31b0c0a10a27b827b44afc1896dfbafe), [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74), [`bf06edbf4`](https://github.com/keystonejs/keystone/commit/bf06edbf47e69280c3a9e270daa578528d68c447), [`85fa68456`](https://github.com/keystonejs/keystone/commit/85fa684565d8c9c40036d4544b3c0235dbbd327b)]:
  - @keystonejs/adapter-prisma@1.0.3
  - @keystonejs/adapter-knex@12.0.0
  - @keystonejs/adapter-mongoose@10.0.0
  - @keystonejs/app-admin-ui@7.3.8

## 18.0.0

### Major Changes

- [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4) [#3298](https://github.com/keystonejs/keystone/pull/3298) Thanks [@timleslie](https://github.com/timleslie)! - Added support for a Prisma adapter to Keystone.

### Patch Changes

- [`a02e69987`](https://github.com/keystonejs/keystone/commit/a02e69987902cfde38d820e68cb24b7a20ca1f6f) [#3741](https://github.com/keystonejs/keystone/pull/3741) Thanks [@timleslie](https://github.com/timleslie)! - Updated internals of `Relationship` internals in preparation for `Prisma` support.

- Updated dependencies [[`8c54a34be`](https://github.com/keystonejs/keystone/commit/8c54a34bec0f5f945447a2475f5500415eb154df), [`01b79349e`](https://github.com/keystonejs/keystone/commit/01b79349e625870193933aa044bdf27f8c75753e), [`48623ae44`](https://github.com/keystonejs/keystone/commit/48623ae44568bae1af2861003fa9922a0118cc57), [`966b5bc70`](https://github.com/keystonejs/keystone/commit/966b5bc7003e0f580528c4dcd46647cc4124b592), [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4), [`3e2ca3a2f`](https://github.com/keystonejs/keystone/commit/3e2ca3a2ffa00cb5aababee572902a78e657ec58), [`bf5801070`](https://github.com/keystonejs/keystone/commit/bf5801070568bbcc1ed4f3394a293bfa5bea8b98), [`cc56990f2`](https://github.com/keystonejs/keystone/commit/cc56990f2e9a4ecf0c112362e8d472b9286f76bc)]:
  - @keystonejs/adapter-knex@11.0.7
  - @keystonejs/app-admin-ui@7.3.7
  - @keystonejs/adapter-mongoose@9.0.8
  - @keystonejs/adapter-prisma@1.0.0

## 17.1.3

### Patch Changes

- [`b32f006ad`](https://github.com/keystonejs/keystone/commit/b32f006ad283f8aa1911f55bbecac9942f3f9f25) [#3666](https://github.com/keystonejs/keystone/pull/3666) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@apollo/client` to `^3.2.0`.

* [`6f42b0a9d`](https://github.com/keystonejs/keystone/commit/6f42b0a9d231049f9e7523eb78ec621d9c9d6df9) [#3678](https://github.com/keystonejs/keystone/pull/3678) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused dependency `pluralize`.

- [`27783bbca`](https://github.com/keystonejs/keystone/commit/27783bbca3b1c5ff05402738c14ffa8db73e542b) [#3673](https://github.com/keystonejs/keystone/pull/3673) Thanks [@timleslie](https://github.com/timleslie)! - Updated `Slug` field type to use common tests where possible.

* [`304701d7c`](https://github.com/keystonejs/keystone/commit/304701d7c23e98c8dc40c0f3f5512a0370107c06) [#3585](https://github.com/keystonejs/keystone/pull/3585) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `graphql` to `^15.3.0`.

- [`b6e160678`](https://github.com/keystonejs/keystone/commit/b6e160678b449707261a54a9d565b91663784831) [#3671](https://github.com/keystonejs/keystone/pull/3671) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@primer/octicons-react` to `^11.0.0`.

- Updated dependencies [[`92b34a74e`](https://github.com/keystonejs/keystone/commit/92b34a74e699e3a101f53064e52932b7daeccbfc), [`b32f006ad`](https://github.com/keystonejs/keystone/commit/b32f006ad283f8aa1911f55bbecac9942f3f9f25), [`ecbe1471f`](https://github.com/keystonejs/keystone/commit/ecbe1471fe22ca029a178a57dc216f6445b4053a), [`06dffc42b`](https://github.com/keystonejs/keystone/commit/06dffc42b08062e3166880146c8fb606493ead12), [`7a1f8bbdc`](https://github.com/keystonejs/keystone/commit/7a1f8bbdcdf68c9579e17db77fa826e811abcab4), [`d7fc663c3`](https://github.com/keystonejs/keystone/commit/d7fc663c3799afd2c646cc1ad6670f8e85002093), [`a14283b9c`](https://github.com/keystonejs/keystone/commit/a14283b9c9d80e8a38adede567695bf7e89cbcb9), [`6f42b0a9d`](https://github.com/keystonejs/keystone/commit/6f42b0a9d231049f9e7523eb78ec621d9c9d6df9), [`5c1e55721`](https://github.com/keystonejs/keystone/commit/5c1e5572134fa93c9aefbb537676e30cafd0e7d9), [`a79404183`](https://github.com/keystonejs/keystone/commit/a79404183c8080f5db5cc6591ab2fb4ff5398b5f), [`304701d7c`](https://github.com/keystonejs/keystone/commit/304701d7c23e98c8dc40c0f3f5512a0370107c06), [`aa5b4aa26`](https://github.com/keystonejs/keystone/commit/aa5b4aa269eebc6931d30f6eddc315805c1f4fef), [`b6e160678`](https://github.com/keystonejs/keystone/commit/b6e160678b449707261a54a9d565b91663784831), [`287e031fa`](https://github.com/keystonejs/keystone/commit/287e031facafe66ef71b0f6d6ee558904251589f), [`7956d5da0`](https://github.com/keystonejs/keystone/commit/7956d5da00197dc11f5d54f7870b8fa72c05a3c0)]:
  - @keystonejs/app-admin-ui@7.3.6
  - @arch-ui/drawer@0.0.24
  - @arch-ui/popout@0.0.22
  - @keystonejs/adapter-mongoose@9.0.7
  - @arch-ui/day-picker@1.0.5
  - @arch-ui/button@0.0.22
  - @arch-ui/fields@3.0.5
  - @arch-ui/options@0.0.24
  - @keystonejs/adapter-knex@11.0.6

## 17.1.2

### Patch Changes

- [`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a) [#3610](https://github.com/keystonejs/keystone/pull/3610) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `prettier` to `^2.1.1`.

* [`dd49d2c04`](https://github.com/keystonejs/keystone/commit/dd49d2c040ea8fb8dfc36d2e556be88ca1b74b15) [#3606](https://github.com/keystonejs/keystone/pull/3606) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused dependencies.

- [`8bd44758a`](https://github.com/keystonejs/keystone/commit/8bd44758ac742c95f42151c9fbc16700b698e8e4) [#3625](https://github.com/keystonejs/keystone/pull/3625) Thanks [@singhArmani](https://github.com/singhArmani)! - Updated ID field tests.

* [`fe054e53e`](https://github.com/keystonejs/keystone/commit/fe054e53e71f13a69af1d6dd2a1cd8c68bb31059) [#3635](https://github.com/keystonejs/keystone/pull/3635) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@apollo/client` to `^3.1.5`.

* Updated dependencies [[`8b0fd66bb`](https://github.com/keystonejs/keystone/commit/8b0fd66bbd73a99a4ed321ce737b5dc33e2d11d3), [`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a), [`8cae7cff5`](https://github.com/keystonejs/keystone/commit/8cae7cff513187ec6e740c4b17afb2b753fe625a), [`9dae7a5d0`](https://github.com/keystonejs/keystone/commit/9dae7a5d00a62cd0b7a4470695adc5e1678db3dc), [`7c47967d3`](https://github.com/keystonejs/keystone/commit/7c47967d3f8a6e0026f9cd0108ff1dafc8d331b9), [`c08200087`](https://github.com/keystonejs/keystone/commit/c082000871947eb0a2415ac7355c89bc7b277383), [`fe054e53e`](https://github.com/keystonejs/keystone/commit/fe054e53e71f13a69af1d6dd2a1cd8c68bb31059), [`379c78240`](https://github.com/keystonejs/keystone/commit/379c78240d788875d97642e1f53120818ad64aff)]:
  - @keystonejs/server-side-graphql-client@1.1.2
  - @keystonejs/adapter-knex@11.0.5
  - @keystonejs/app-admin-ui@7.3.5
  - @keystonejs/adapter-mongoose@9.0.6

## 17.1.1

### Patch Changes

- [`cd15192cd`](https://github.com/keystonejs/keystone/commit/cd15192cdae5e476f64a257c196ca569a9440d5a) [#3510](https://github.com/keystonejs/keystone/pull/3510) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `graphql` to `^14.7.0`.

* [`d500613d8`](https://github.com/keystonejs/keystone/commit/d500613d8917e3cbcea2817501d607eddd3b1a8d) [#3528](https://github.com/keystonejs/keystone/pull/3528) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `react-codemirror2` to `^6.0.1`.

- [`6c97a5534`](https://github.com/keystonejs/keystone/commit/6c97a5534e8a18d15aeac8b0471810fdd4d04f80) [#3577](https://github.com/keystonejs/keystone/pull/3577) Thanks [@timleslie](https://github.com/timleslie)! - Updated test framework to support more detailed field tests.

* [`34fcc7052`](https://github.com/keystonejs/keystone/commit/34fcc7052a24db61f1f2f12c46110c060934f4ca) [#3531](https://github.com/keystonejs/keystone/pull/3531) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `slate-react` to `^0.22.10`.

- [`c3488c5e8`](https://github.com/keystonejs/keystone/commit/c3488c5e88628b15eb9fe804551c3c5c44c07e0f) [#3511](https://github.com/keystonejs/keystone/pull/3511) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `intersection-observer` to `^0.11.0`.

* [`e62b3308b`](https://github.com/keystonejs/keystone/commit/e62b3308bd841b5f58ac9fa1f84707f9187fda6b) [#3524](https://github.com/keystonejs/keystone/pull/3524) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `node-fetch` to `^2.6.0`.

- [`7036585f2`](https://github.com/keystonejs/keystone/commit/7036585f25c3b690b7a6fd04c39b5b781ff5bcd9) [#3530](https://github.com/keystonejs/keystone/pull/3530) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `slate` to `^0.47.9`.

* [`2e6a06202`](https://github.com/keystonejs/keystone/commit/2e6a06202299b36c36fd3efd895f2280479eac31) [#3532](https://github.com/keystonejs/keystone/pull/3532) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated filter tests across all field types.
  Fixed errors with filtering by `null` in the `Decimal`, `MongoId` and `Uuid` field types.

- [`a42ee3a30`](https://github.com/keystonejs/keystone/commit/a42ee3a306c899a7ae46909fe132522cbeff7812) [#3508](https://github.com/keystonejs/keystone/pull/3508) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `date-fns` to `^2.16.1`.

* [`438051442`](https://github.com/keystonejs/keystone/commit/4380514421020f4418a9f966c9fec60e014478b9) [#3433](https://github.com/keystonejs/keystone/pull/3433) Thanks [@singhArmani](https://github.com/singhArmani)! - Added filter and CRUD tests for `File` field type.

- [`b3aa85031`](https://github.com/keystonejs/keystone/commit/b3aa850311cbc1622568f69f9cb4b9f46ab9db22) [#3519](https://github.com/keystonejs/keystone/pull/3519) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `mongoose` to `~5.9.29`.

* [`518718e19`](https://github.com/keystonejs/keystone/commit/518718e197d0a2d723c8e184552ddd5d8e165f12) [#3586](https://github.com/keystonejs/keystone/pull/3586) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `graphql-upload` to `11.0.0`.

- [`28b88abd3`](https://github.com/keystonejs/keystone/commit/28b88abd369f0df12eae72107db7c24323eda4b5) [#3507](https://github.com/keystonejs/keystone/pull/3507) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Apollo GraphQL packages dependencies.

- Updated dependencies [[`e8e2baa7b`](https://github.com/keystonejs/keystone/commit/e8e2baa7b1a9330cb483c2f30682d64f857d314c), [`cd15192cd`](https://github.com/keystonejs/keystone/commit/cd15192cdae5e476f64a257c196ca569a9440d5a), [`e9bc4367a`](https://github.com/keystonejs/keystone/commit/e9bc4367ac31f3fe3a2898198c600c76c42165b2), [`5fb75bab6`](https://github.com/keystonejs/keystone/commit/5fb75bab638c59ccf690c46d862b9801bf1d28f6), [`729e897e6`](https://github.com/keystonejs/keystone/commit/729e897e689f2673f38d6c0caf22e7cee7ee8ff3), [`d3a4f9263`](https://github.com/keystonejs/keystone/commit/d3a4f9263de0d11a1613e420f660eccc2a48172d), [`40b751ad6`](https://github.com/keystonejs/keystone/commit/40b751ad6f09aec137ef42df10fdbb1240173afb), [`c3488c5e8`](https://github.com/keystonejs/keystone/commit/c3488c5e88628b15eb9fe804551c3c5c44c07e0f), [`003b856e6`](https://github.com/keystonejs/keystone/commit/003b856e686cc1ee0f984c1acf024c1fa0c27837), [`a42ee3a30`](https://github.com/keystonejs/keystone/commit/a42ee3a306c899a7ae46909fe132522cbeff7812), [`b3aa85031`](https://github.com/keystonejs/keystone/commit/b3aa850311cbc1622568f69f9cb4b9f46ab9db22), [`16fba3b98`](https://github.com/keystonejs/keystone/commit/16fba3b98271410e570a370f610da7cd0686f294), [`28b88abd3`](https://github.com/keystonejs/keystone/commit/28b88abd369f0df12eae72107db7c24323eda4b5), [`16e4d91a2`](https://github.com/keystonejs/keystone/commit/16e4d91a20cc6a079c60ea9801381da55444b1e1)]:
  - @keystonejs/app-admin-ui@7.3.4
  - @keystonejs/adapter-knex@11.0.4
  - @arch-ui/day-picker@1.0.4
  - @keystonejs/adapter-mongoose@9.0.5
  - @arch-ui/drawer@0.0.23
  - @arch-ui/popout@0.0.21
  - @arch-ui/tooltip@0.1.14

## 17.1.0

### Minor Changes

- [`69d627813`](https://github.com/keystonejs/keystone/commit/69d627813adfc10d29707f5c882ca15621de12a5) [#3501](https://github.com/keystonejs/keystone/pull/3501) Thanks [@singhArmani](https://github.com/singhArmani)! - Removed unsupported filters for `File`, `CloudinaryImage`, `LocationGoogle`, `Unsplash`, and `OEmbed` field types.

### Patch Changes

- [`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6) [#3481](https://github.com/keystonejs/keystone/pull/3481) Thanks [@Noviny](https://github.com/Noviny)! - Updated dependencies through a major version - this shouldn't require change by consumers.

* [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e) [#3477](https://github.com/keystonejs/keystone/pull/3477) Thanks [@Noviny](https://github.com/Noviny)! - Updating dependencies:

  These changes bring the keystone dev experience inline with installing keystone from npm :D

- [`ac44568f9`](https://github.com/keystonejs/keystone/commit/ac44568f91fd54ccbc39accf83bcfb3276ce1a72) [#3500](https://github.com/keystonejs/keystone/pull/3500) Thanks [@timleslie](https://github.com/timleslie)! - Updated test scripts to be more consistent.

* [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc) [#3438](https://github.com/keystonejs/keystone/pull/3438) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Apollo GraphQL package dependencies.

- [`483b20ec5`](https://github.com/keystonejs/keystone/commit/483b20ec53ff89f1d026c0495fdae5df60a7cf59) [#3487](https://github.com/keystonejs/keystone/pull/3487) Thanks [@singhArmani](https://github.com/singhArmani)! - Updated CRUD API tests for field types.

* [`0fc878fa9`](https://github.com/keystonejs/keystone/commit/0fc878fa918c3196196f943f195ffaa62fce504b) [#3439](https://github.com/keystonejs/keystone/pull/3439) Thanks [@renovate](https://github.com/apps/renovate)! - Updated babel dependencies.

- [`ea367f759`](https://github.com/keystonejs/keystone/commit/ea367f7594f47efc3528d9917cce010b3a16bf4d) [#3435](https://github.com/keystonejs/keystone/pull/3435) Thanks [@singhArmani](https://github.com/singhArmani)! - Updated `required` and `uniqueness` tests for field API.

* [`0153168d7`](https://github.com/keystonejs/keystone/commit/0153168d73ce8cd7ede4eb9c8518e5e2bf859709) [#3456](https://github.com/keystonejs/keystone/pull/3456) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `apply-ref` to `^0.2.3`.

* Updated dependencies [[`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6), [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e), [`64d745013`](https://github.com/keystonejs/keystone/commit/64d745013fd2cccc1fb14c4f02ac84778b5c9abc), [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc), [`0fc878fa9`](https://github.com/keystonejs/keystone/commit/0fc878fa918c3196196f943f195ffaa62fce504b), [`dc689f9ac`](https://github.com/keystonejs/keystone/commit/dc689f9ac8e213137dfed9e81992bbe4318b44ae), [`fcf632dbb`](https://github.com/keystonejs/keystone/commit/fcf632dbbc610bbf90dc3647f0acdf8c868b2a8d), [`096d13fc2`](https://github.com/keystonejs/keystone/commit/096d13fc25696ed1769cf817b705dfd80da601b2), [`0153168d7`](https://github.com/keystonejs/keystone/commit/0153168d73ce8cd7ede4eb9c8518e5e2bf859709)]:
  - @keystonejs/adapter-knex@11.0.3
  - @keystonejs/adapter-mongoose@9.0.4
  - @arch-ui/drawer@0.0.22
  - @arch-ui/popout@0.0.20
  - @keystonejs/utils@5.4.3
  - @keystonejs/app-admin-ui@7.3.3
  - @arch-ui/alert@0.0.18
  - @arch-ui/button@0.0.21
  - @arch-ui/controls@0.1.9
  - @arch-ui/day-picker@1.0.3
  - @arch-ui/fields@3.0.4
  - @arch-ui/filters@0.0.20
  - @arch-ui/input@0.1.11
  - @arch-ui/layout@0.2.14
  - @arch-ui/loading@0.0.18
  - @arch-ui/lozenge@0.0.17
  - @arch-ui/options@0.0.23
  - @arch-ui/tooltip@0.1.13
  - @arch-ui/typography@0.0.18
  - @arch-ui/select@0.1.9
  - @arch-ui/theme@0.0.11

## 17.0.0

### Major Changes

- [`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593) [#3394](https://github.com/keystonejs/keystone/pull/3394) Thanks [@timleslie](https://github.com/timleslie)! - Converted `Field` getters `.gqlUpdateInputFields` and `.gqlCreateInputFields` into methods, `.gqlUpdateInputFields({ schemaName })` and `...gqlCreateInputFields({ schemaName })`.

### Patch Changes

- [`e8b2e4772`](https://github.com/keystonejs/keystone/commit/e8b2e477206acffb143f19fb14be1e3b4cd0eb91) [#3409](https://github.com/keystonejs/keystone/pull/3409) Thanks [@timleslie](https://github.com/timleslie)! - Fixed incorrectly generated graphQL for certain access control configurations #3389.

- Updated dependencies [[`fba90ac5d`](https://github.com/keystonejs/keystone/commit/fba90ac5db7328e952c44cb7c0bb8db76dd954b8)]:
  - @keystonejs/app-admin-ui@7.3.2
  - @keystonejs/adapter-knex@11.0.2
  - @keystonejs/adapter-mongoose@9.0.3
  - @keystonejs/test-utils@8.0.1

## 16.1.0

### Minor Changes

- [`9338f3739`](https://github.com/keystonejs/keystone/commit/9338f3739ecff5f626a713a06ce65c1e29888d25) [#3363](https://github.com/keystonejs/keystone/pull/3363) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Expose field type views at `@keystonejs/fields/types/*/views/{Cell,Controller,Filter,Field}`

### Patch Changes

- [`3db2f3956`](https://github.com/keystonejs/keystone/commit/3db2f395688342fe9a1dda14be5ce8308c9c39a6) [#3374](https://github.com/keystonejs/keystone/pull/3374) Thanks [@timleslie](https://github.com/timleslie)! - Cleaned up the implementation of generating unique `Slug` values.

* [`7e78ffdaa`](https://github.com/keystonejs/keystone/commit/7e78ffdaa96050e49e8e2678a3c4f1897fedae4f) [#3400](https://github.com/keystonejs/keystone/pull/3400) Thanks [@timleslie](https://github.com/timleslie)! - Restricted `mongoose` to the version range `~5.9.11` to avoid a [bug](https://github.com/keystonejs/keystone/issues/3397) in `5.10.0`.

- [`7b0875723`](https://github.com/keystonejs/keystone/commit/7b0875723783780988f2dee4e5ee406a3b44ca98) [#3371](https://github.com/keystonejs/keystone/pull/3371) Thanks [@singhArmani](https://github.com/singhArmani)! - Added filter tests for `DateTimeUtc` field

* [`0369985e3`](https://github.com/keystonejs/keystone/commit/0369985e320afd6112f2664f8a8edc1ed7167130) [#3391](https://github.com/keystonejs/keystone/pull/3391) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `MockAdapter`, `MockListAdapter` and `MockIdType` classes from `@keystonejs/test-utils`.

- [`7422922f5`](https://github.com/keystonejs/keystone/commit/7422922f5649a2b52699f67a77645e9c91800688) [#3375](https://github.com/keystonejs/keystone/pull/3375) Thanks [@singhArmani](https://github.com/singhArmani)! - Added `Filter` tests for the `Url` field type

* [`df8f92a37`](https://github.com/keystonejs/keystone/commit/df8f92a378d2d787f5bee774f013767c09ec35cf) [#3392](https://github.com/keystonejs/keystone/pull/3392) Thanks [@timleslie](https://github.com/timleslie)! - Updated `match` function in tests to use `getItems` function from `server-side-graphql-client`.

- [`cc5bb8915`](https://github.com/keystonejs/keystone/commit/cc5bb891579281338ad7fad0873531be81d877d4) [#3387](https://github.com/keystonejs/keystone/pull/3387) Thanks [@singhArmani](https://github.com/singhArmani)! - Refactored internals to use `server-side-graphql-client`.

* [`1b3943e4f`](https://github.com/keystonejs/keystone/commit/1b3943e4f66c61c446085736949c6b83e9087afb) [#3378](https://github.com/keystonejs/keystone/pull/3378) Thanks [@timleslie](https://github.com/timleslie)! - Updated tests for the `Slug` field type.

- [`b300720eb`](https://github.com/keystonejs/keystone/commit/b300720eb4e079bc30efb17ed3b48ab71cadc160) [#3373](https://github.com/keystonejs/keystone/pull/3373) Thanks [@timleslie](https://github.com/timleslie)! - Removed internal global variables.

- Updated dependencies [[`7e78ffdaa`](https://github.com/keystonejs/keystone/commit/7e78ffdaa96050e49e8e2678a3c4f1897fedae4f), [`72cd47b35`](https://github.com/keystonejs/keystone/commit/72cd47b357052b69e1d525758ff8a1a0cf44c5c2), [`0369985e3`](https://github.com/keystonejs/keystone/commit/0369985e320afd6112f2664f8a8edc1ed7167130), [`9338f3739`](https://github.com/keystonejs/keystone/commit/9338f3739ecff5f626a713a06ce65c1e29888d25), [`714316718`](https://github.com/keystonejs/keystone/commit/7143167187e3e3519b0b58e2b04ff0fee8fc75dc), [`cc5bb8915`](https://github.com/keystonejs/keystone/commit/cc5bb891579281338ad7fad0873531be81d877d4)]:
  - @keystonejs/adapter-mongoose@9.0.2
  - @keystonejs/server-side-graphql-client@1.1.1
  - @keystonejs/test-utils@8.0.0
  - @keystonejs/app-admin-ui@7.3.1

## 16.0.0

### Major Changes

- [`d38a41f25`](https://github.com/keystonejs/keystone/commit/d38a41f25a1b4c90c05d2fb85116dc385d4ee77a) [#3308](https://github.com/keystonejs/keystone/pull/3308) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Move `@keystonejs/fields-datetime-utc` into `@keystonejs/fields`. Please update your imports from `@keystonejs/fields-datetime-utc` to `@keystonejs/fields`.

* [`5ede731fc`](https://github.com/keystonejs/keystone/commit/5ede731fc58a79e7322b852bdd2d971ece45281e) [#3305](https://github.com/keystonejs/keystone/pull/3305) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Moved the `Location` field from `@keystonejs/fields` to `@keystonejs/fields-location-google` and renamed to `LocationGoogle`. If you were using the `Location` field from `@keystonejs/fields`, please install `@keystonejs/fields-location-google` and import `LocationGoogle` from it.

- [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25) [#3280](https://github.com/keystonejs/keystone/pull/3280) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Moved `@keystonejs/fields-cloudinary-image`, `@keystonejs/fields-unsplash` and `@keystonejs/fields-oembed` out of the core fields package `@keystonejs/fields`.

  ```js
  const { CloudinaryImage, Unsplash, OEmbed } = require('@keystonejs/fields');
  ```

  Needs to be changed to:

  ```js
  const { CloudinaryImage } = require('@keystonejs/fields-cloudinary-image');
  const { Unsplash } = require('@keystonejs/fields-unsplash');
  const { OEmbed } = require('@keystonejs/fields-oembed');
  ```

* [`e44102e9f`](https://github.com/keystonejs/keystone/commit/e44102e9f7f770b1528d642d763ccf9f88f3cbb1) [#3307](https://github.com/keystonejs/keystone/pull/3307) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Moved the `Color` field from `@keystonejs/fields` to `@keystonejs/fields-color`.

  Note: If using the `Color` field you need to update imports to point to `@keystonejs/fields-color`.

### Minor Changes

- [`694f3acfb`](https://github.com/keystonejs/keystone/commit/694f3acfb9faa78aebfcf48cf711165560f16ff7) [#3125](https://github.com/keystonejs/keystone/pull/3125) Thanks [@Vultraz](https://github.com/Vultraz)! - Migrated to Apollo Client v3.

### Patch Changes

- [`149d6fd6f`](https://github.com/keystonejs/keystone/commit/149d6fd6ff057c17570346063c173376769dcc79) [#3304](https://github.com/keystonejs/keystone/pull/3304) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Renamed `@keystonejs/field-content` to `@keystonejs/fields-content`. Please install `@keystonejs/fields-content` and update your imports from `@keystonejs/field-content` to `@keystonejs/fields-content`.

- Updated dependencies [[`318e39b74`](https://github.com/keystonejs/keystone/commit/318e39b74b2fa3152d4ff09bccec93238e8345ef), [`b0af7d5ba`](https://github.com/keystonejs/keystone/commit/b0af7d5baa6ceea8d80215afa290fd76240ee823), [`694f3acfb`](https://github.com/keystonejs/keystone/commit/694f3acfb9faa78aebfcf48cf711165560f16ff7)]:
  - @keystonejs/app-admin-ui@7.3.0

## 15.0.0

### Major Changes

- [`af5171563`](https://github.com/keystonejs/keystone/commit/af51715637433bcdd2538835c98ac71a8eb86122) [#3283](https://github.com/keystonejs/keystone/pull/3283) Thanks [@timleslie](https://github.com/timleslie)! - Removed `BaseListAdapter.findFieldAdapterForQuerySegment()` and `MongoRelationshipInterface.supportsRelationshipQuery()`.

* [`7da9d67d7`](https://github.com/keystonejs/keystone/commit/7da9d67d7d481c44a81406c6b34540a3f0a8340d) [#3284](https://github.com/keystonejs/keystone/pull/3284) Thanks [@timleslie](https://github.com/timleslie)! - Removed `MongoRelationshipInterface.getRefListAdapter()` and `KnexRelationshipInterface.getRefListAdapter()`.

- [`c3883e01c`](https://github.com/keystonejs/keystone/commit/c3883e01c01b83cf5938de9bebf2dd68f4861364) [#3261](https://github.com/keystonejs/keystone/pull/3261) Thanks [@timleslie](https://github.com/timleslie)! - `many` relationships now have a GraphQL type of `[Item!]!`, rather than `[Item]`.

  The old type of `[Item]` implied that the relationship field could return `null`, or that some of the items it returned could be `null`. In practice, neither of these things ever happened. The new type better reflects this reality.

  The filter argument `{path}_is_null` has also been removed for `many` relationships, as it does not apply to a non-null array type.

### Patch Changes

- [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2) [#3299](https://github.com/keystonejs/keystone/pull/3299) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug on `MongooseAdapter` where `DateTime` fields did not respect the `isUnique` flag.

* [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2) [#3299](https://github.com/keystonejs/keystone/pull/3299) Thanks [@timleslie](https://github.com/timleslie)! - Added more robust checks for support of the `isUnique` flag config. Added tests for this flag.

- [`fd2b8d1cf`](https://github.com/keystonejs/keystone/commit/fd2b8d1cf0b23b177951d65006a0d0faf666a5d6) [#3290](https://github.com/keystonejs/keystone/pull/3290) Thanks [@timleslie](https://github.com/timleslie)! - Refactored relationship internals. No functional changes.

- Updated dependencies [[`d7e011319`](https://github.com/keystonejs/keystone/commit/d7e011319d18275e7e3ca1ab2209b2042c6775cb), [`b53b6fe5a`](https://github.com/keystonejs/keystone/commit/b53b6fe5a8cbefba20008ca54ee3fe4b346e8497), [`5a3849806`](https://github.com/keystonejs/keystone/commit/5a3849806d00e62b722461d02f6e4639bc45c1eb), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2), [`5332988e3`](https://github.com/keystonejs/keystone/commit/5332988e3fafe6a3594f7dcecd79a9402df28015), [`2e10b1083`](https://github.com/keystonejs/keystone/commit/2e10b1083c0ab3925b877f16543c3d302f618313)]:
  - @keystonejs/build-field-types@5.2.11
  - @keystonejs/app-admin-ui@7.2.0
  - @keystonejs/access-control@6.3.0
  - @keystonejs/field-content@7.0.3
  - @keystonejs/test-utils@7.1.1
  - @keystonejs/adapter-knex@11.0.1
  - @keystonejs/adapter-mongoose@9.0.1

## 14.0.0

### Major Changes

- [`5fc97cbf4`](https://github.com/keystonejs/keystone/commit/5fc97cbf4489587a3a8cb38c04ba81fc2cb1fc5a) [#3171](https://github.com/keystonejs/keystone/pull/3171) Thanks [@timleslie](https://github.com/timleslie)! - Hooks no longer recieve a `{ query }` argument. This functionality has been superseded by `context.executeGraphQL()`.

  ```
  {
    ...
    hooks: {
      resolveInput: async ({ actions: { query } } ) => {
        ...
        const { data, errors } = await query(`{ ... }`);
        ...
      }
    }
  }
  ```

  should be changed to

  ```
  {
    ...
    hooks: {
      resolveInput: async ({ context } ) => {
        ...
        const { data, errors } = await context.executeGraphQL({ query: `{ ... }` });
        ...
      }
    }
  }
  ```

  See [the docs](/docs/discussions/server-side-graphql.md) for more details on how to use `context.executeGraphQL()`.

### Patch Changes

- [`4b95d8a46`](https://github.com/keystonejs/keystone/commit/4b95d8a46d53d32b2873e350716311441cd37262) [#3245](https://github.com/keystonejs/keystone/pull/3245) Thanks [@singhArmani](https://github.com/singhArmani)! - Allow passing in the `null` value to the **CalendarDay**[https://www.keystonejs.com/keystonejs/fields/src/types/calendar-day/#calendarday] field type.

  Passing in the `null` value for **CalendarDay** field was throwing a `TypeError` inside the inputValidation method of CalendarDay.
  This fix allow passing the null value.

* [`0cbb7e7b0`](https://github.com/keystonejs/keystone/commit/0cbb7e7b096c2a99685631a601fce7273d03cc70) [#3242](https://github.com/keystonejs/keystone/pull/3242) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Fix a bug with the location field where it is unable to render in admin ui after deleting the value.

- [`51aef1ef0`](https://github.com/keystonejs/keystone/commit/51aef1ef06a89422e89a6118b7820848d5970669) [#3146](https://github.com/keystonejs/keystone/pull/3146) Thanks [@Vultraz](https://github.com/Vultraz)! - Migrated to @primer/octicons-react v10.

- Updated dependencies [[`753fa13ab`](https://github.com/keystonejs/keystone/commit/753fa13ab976cebdd145f4da948e13244612eedb), [`51c898537`](https://github.com/keystonejs/keystone/commit/51c898537c7fdc8578fa47eade6a499594b0d154), [`49984caae`](https://github.com/keystonejs/keystone/commit/49984caaec803ed86b027c9634ac6b3f671e9ba7), [`e6117d259`](https://github.com/keystonejs/keystone/commit/e6117d259e0ceeacc0b42e3db0bd39dd39537090), [`283839cfb`](https://github.com/keystonejs/keystone/commit/283839cfb84f80818dd85699e011eee4775e550d), [`79d4c0d92`](https://github.com/keystonejs/keystone/commit/79d4c0d9250c1d1c1c46bcb2eaddae313eb7ac5f), [`c9ca62876`](https://github.com/keystonejs/keystone/commit/c9ca628765f1ecb599c8556de2d31567ddf12504), [`622cc7d69`](https://github.com/keystonejs/keystone/commit/622cc7d6976ecb71f5b135c931ac0fcb4afdb1c7), [`7bdec6446`](https://github.com/keystonejs/keystone/commit/7bdec6446ed97fa962bb96abe07975bb23c6ec7a), [`51aef1ef0`](https://github.com/keystonejs/keystone/commit/51aef1ef06a89422e89a6118b7820848d5970669)]:
  - @keystonejs/test-utils@7.1.0
  - @keystonejs/adapter-knex@11.0.0
  - @keystonejs/app-admin-ui@7.1.0
  - @keystonejs/build-field-types@5.2.10
  - @keystonejs/adapter-mongoose@9.0.0
  - @arch-ui/day-picker@1.0.2
  - @arch-ui/fields@3.0.3
  - @arch-ui/options@0.0.22
  - @keystonejs/field-content@7.0.2

## 13.0.2

### Patch Changes

- [`4ddc3dc6f`](https://github.com/keystonejs/keystone/commit/4ddc3dc6f87c192627d00db85a1080411400eeb5) [#3212](https://github.com/keystonejs/keystone/pull/3212) Thanks [@timleslie](https://github.com/timleslie)! - Removed `name` argument from calls to `setupServer` in tests.

* [`3adb2ac2a`](https://github.com/keystonejs/keystone/commit/3adb2ac2ac4ab65636ffea1b2b1f7044410c2b8b) [#3176](https://github.com/keystonejs/keystone/pull/3176) Thanks [@timleslie](https://github.com/timleslie)! - Updated docs for `Virtual` field type to show how to execute server-side GraphQL operations.

* Updated dependencies [[`4ddc3dc6f`](https://github.com/keystonejs/keystone/commit/4ddc3dc6f87c192627d00db85a1080411400eeb5), [`69d7f2e50`](https://github.com/keystonejs/keystone/commit/69d7f2e50ef2325c0d3b02b8bb5c310590796fed)]:
  - @keystonejs/test-utils@7.0.1
  - @keystonejs/utils@5.4.2
  - @keystonejs/app-admin-ui@7.0.5

## 13.0.1

### Patch Changes

- [`4884ce609`](https://github.com/keystonejs/keystone/commit/4884ce6094b3c9ec203c702a5de97b983bd14176) [#3167](https://github.com/keystonejs/keystone/pull/3167) Thanks [@timleslie](https://github.com/timleslie)! - Updated to use `context.executeGraphQL` for all server-side GraphQL operations.

- Updated dependencies [[`c6eac2dc2`](https://github.com/keystonejs/keystone/commit/c6eac2dc2dec857c668a5794fd84829d164563f3)]:
  - @keystonejs/test-utils@7.0.0

## 13.0.0

### Major Changes

- [`b693b2fa8`](https://github.com/keystonejs/keystone/commit/b693b2fa8a391d7f5bcfbea11061679bd4b559d8) [#3002](https://github.com/keystonejs/keystone/pull/3002) Thanks [@timleslie](https://github.com/timleslie)! - The `CalendarDay` field type options `yearRangeFrom` and `yearRangeTo` have been removed, and replaced with `dateFrom` and `dateTo`. These options take an ISO8601 formatted date string in the form `YYYY-MM-DD`, e.g. `2020-06-30`. These values are now validated on the server-side, rather than just on the client-side within the Admin UI.

  If you are currently using `yearRangeFrom` or `yearRangeTo` you will need to make the following change:

  ```
  birthday: { type: CalendarDay, yearRangeFrom: 1900, yearRangeTo: 2100 }
  ```

  becomes

  ```
  birthday: { type: CalendarDay, dateFrom: '1900-01-01', dateTo: '2100-12-31' }
  ```

### Patch Changes

- [`c235e34c7`](https://github.com/keystonejs/keystone/commit/c235e34c7a72cd05b05b3d1af08c93c1e98a8e91) [#3140](https://github.com/keystonejs/keystone/pull/3140) Thanks [@molomby](https://github.com/molomby)! - Improving field type list and adding some missing field docs

- Updated dependencies [[`c235e34c7`](https://github.com/keystonejs/keystone/commit/c235e34c7a72cd05b05b3d1af08c93c1e98a8e91), [`dec3d336a`](https://github.com/keystonejs/keystone/commit/dec3d336adbe8156722fbe65f315a57b2f5c08e7), [`2e5a93dee`](https://github.com/keystonejs/keystone/commit/2e5a93dee5be11bf020c1397c7653bdf07a90d24), [`2d0ed13f7`](https://github.com/keystonejs/keystone/commit/2d0ed13f7f4e92c9e87eb700df55c80bf06179bb), [`b693b2fa8`](https://github.com/keystonejs/keystone/commit/b693b2fa8a391d7f5bcfbea11061679bd4b559d8), [`950f23443`](https://github.com/keystonejs/keystone/commit/950f23443ef8f1a176a3cf6b039f93a29d954f5e)]:
  - @keystonejs/field-content@7.0.1
  - @keystonejs/access-control@6.2.0
  - @keystonejs/app-admin-ui@7.0.3
  - @arch-ui/day-picker@1.0.1
  - @keystonejs/test-utils@6.2.0

## 12.0.1

### Patch Changes

- [`8a1338362`](https://github.com/keystonejs/keystone/commit/8a13383629b99745ba39cd8ff1e91214be7f98da) [#3086](https://github.com/keystonejs/keystone/pull/3086) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Fixed an issue with the AdminUI where some icons were throwing errors.

- Updated dependencies [[`8a1338362`](https://github.com/keystonejs/keystone/commit/8a13383629b99745ba39cd8ff1e91214be7f98da)]:
  - @keystonejs/app-admin-ui@7.0.1

## 12.0.0

### Major Changes

- [`ea9608342`](https://github.com/keystonejs/keystone/commit/ea960834262cec66f52fa39c1b3b07b702b3cd4d) [#2976](https://github.com/keystonejs/keystone/pull/2976) Thanks [@Vultraz](https://github.com/Vultraz)! - Refactored how list and item queries and generated. Field controllers' `getFilterGraphQL` method now returns an object in the format { filter: value } rather than a GraphQL string. Additionally, `getFilterValue` should now return `undefined` instead of `null` if the filter should not be submitted.

### Minor Changes

- [`c2ebb51c7`](https://github.com/keystonejs/keystone/commit/c2ebb51c786297879fe9fac2007804055631e9e2) [#2258](https://github.com/keystonejs/keystone/pull/2258) Thanks [@gautamsi](https://github.com/gautamsi)! - \* Added `isReadOnly` option on field's `adminConfig`. Fields with this option set will be excluded from the `create` form, and set as disabled in the `update` form in the Admin UI.

  - Updated the item detail page to include fields with access `{ update: false }` in a disabled state, rather than excluded the form.
  - Updated all Field Views to accept `isDisabled` prop. When set to `true` this will disable the field input.

  Example:

  ```js
  keystone.createList('Todo', {
    fields: {
      name: { type: Text, isRequired: true },
      someReadOnlyField: {
        type: Text,
        adminConfig: {
          isReadOnly: true,
        },
        defaultValue: 'Some default value',
      },
    },
  });
  ```

* [`fdfb01417`](https://github.com/keystonejs/keystone/commit/fdfb01417b6d330342f4b6c326767c9567e35ca5) [#2947](https://github.com/keystonejs/keystone/pull/2947) Thanks [@timleslie](https://github.com/timleslie)! - Added support for arguments being defined on `Virtual` fields.

### Patch Changes

- [`c3faeeff4`](https://github.com/keystonejs/keystone/commit/c3faeeff41f9b29a9fc31ca4e7778b596fcb20b9) [#3019](https://github.com/keystonejs/keystone/pull/3019) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed a layout issue with required checkbox fields.

* [`397982096`](https://github.com/keystonejs/keystone/commit/39798209642571d3ba698e11410f5161cd1943bb) [#2956](https://github.com/keystonejs/keystone/pull/2956) Thanks [@Vultraz](https://github.com/Vultraz)! - Added a password field cell view.

- [`538378e4e`](https://github.com/keystonejs/keystone/commit/538378e4eb143dbe6e7a943408e0af302eb86b85) [#2987](https://github.com/keystonejs/keystone/pull/2987) Thanks [@Vultraz](https://github.com/Vultraz)! - Simplifed ItemLink handling.

* [`9f67e0e91`](https://github.com/keystonejs/keystone/commit/9f67e0e912b4f7dcb90fcb07c4b30bd6c45de464) [#3036](https://github.com/keystonejs/keystone/pull/3036) Thanks [@Vultraz](https://github.com/Vultraz)! - Cleaned up some code in the field definitions.

- [`8fddd97b2`](https://github.com/keystonejs/keystone/commit/8fddd97b20f1928ff7306d5d0dcc96e58ffe55fb) [#2994](https://github.com/keystonejs/keystone/pull/2994) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed React warning about controlled handling in the Float field.

* [`83548d43d`](https://github.com/keystonejs/keystone/commit/83548d43d661959a34a6de475994430ee1de3a1d) [#3009](https://github.com/keystonejs/keystone/pull/3009) Thanks [@Vultraz](https://github.com/Vultraz)! - Removed adminPath and authStrategy members from base field Controller class.

- [`5ea313461`](https://github.com/keystonejs/keystone/commit/5ea313461aa2cba310b2634cc87780092c84b5be) [#3081](https://github.com/keystonejs/keystone/pull/3081) Thanks [@pahaz](https://github.com/pahaz)! - Removed redundant code.

* [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb) [#2990](https://github.com/keystonejs/keystone/pull/2990) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated various Apollo dependencies to their latest versions.

- [`04c57fa78`](https://github.com/keystonejs/keystone/commit/04c57fa7840714d3413e093d468b78d740c95c9a) [#3007](https://github.com/keystonejs/keystone/pull/3007) Thanks [@Vultraz](https://github.com/Vultraz)! - Added client-side is-required flag to most fields.

* [`f33388b50`](https://github.com/keystonejs/keystone/commit/f33388b5061d59747ab46e238f43e9b08f52bd1e) [#3068](https://github.com/keystonejs/keystone/pull/3068) Thanks [@Vultraz](https://github.com/Vultraz)! - Improved File field image-not-found display.

- [`4b06157be`](https://github.com/keystonejs/keystone/commit/4b06157be6cffde2d88969823f7c410fefd82317) [#2046](https://github.com/keystonejs/keystone/pull/2046) Thanks [@Vultraz](https://github.com/Vultraz)! - Removed some workarounds for issues with older graphql versions

* [`649017fbd`](https://github.com/keystonejs/keystone/commit/649017fbd5ea17c36e8c49d44836e1f2bcae2692) [#3040](https://github.com/keystonejs/keystone/pull/3040) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed an error when clearing the last selection in the Select field filter.

- [`170faf568`](https://github.com/keystonejs/keystone/commit/170faf568fef5b74147791476b466dc7a25c7d6f) [#3041](https://github.com/keystonejs/keystone/pull/3041) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug when the `ref` list of a `Relationship` field had access control of `{ create: false }`. Keystone no longer throws an error on startup. Fixes #1677.

* [`de27d2c16`](https://github.com/keystonejs/keystone/commit/de27d2c16b520ae5126a74efb85c70ae88ae6b60) [#2970](https://github.com/keystonejs/keystone/pull/2970) Thanks [@Vultraz](https://github.com/Vultraz)! - Added validation to ensure the CloudinaryImage field is used with CloudinaryAdapter.

* Updated dependencies [[`c2ebb51c7`](https://github.com/keystonejs/keystone/commit/c2ebb51c786297879fe9fac2007804055631e9e2), [`f493eecc3`](https://github.com/keystonejs/keystone/commit/f493eecc34a0f1a6ba9f8eea1c34882784c1b5fe), [`b61987552`](https://github.com/keystonejs/keystone/commit/b619875520aa3b10d104794140f7977ffaebfbf0), [`397982096`](https://github.com/keystonejs/keystone/commit/39798209642571d3ba698e11410f5161cd1943bb), [`538378e4e`](https://github.com/keystonejs/keystone/commit/538378e4eb143dbe6e7a943408e0af302eb86b85), [`9f67e0e91`](https://github.com/keystonejs/keystone/commit/9f67e0e912b4f7dcb90fcb07c4b30bd6c45de464), [`ea9608342`](https://github.com/keystonejs/keystone/commit/ea960834262cec66f52fa39c1b3b07b702b3cd4d), [`83548d43d`](https://github.com/keystonejs/keystone/commit/83548d43d661959a34a6de475994430ee1de3a1d), [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb), [`da8ca8835`](https://github.com/keystonejs/keystone/commit/da8ca8835a910cc9b2f53e12ddaef88ffc194695), [`04c57fa78`](https://github.com/keystonejs/keystone/commit/04c57fa7840714d3413e093d468b78d740c95c9a), [`fd4e9100a`](https://github.com/keystonejs/keystone/commit/fd4e9100a636e0654db45d2471ce47a19b753647), [`4b06157be`](https://github.com/keystonejs/keystone/commit/4b06157be6cffde2d88969823f7c410fefd82317), [`6ab523476`](https://github.com/keystonejs/keystone/commit/6ab523476ceca5ad57e7833ebd172b2da6c0b5fd), [`839666e25`](https://github.com/keystonejs/keystone/commit/839666e25d8bffefd034e6344e11d72dd43b925b), [`9ca0733e5`](https://github.com/keystonejs/keystone/commit/9ca0733e57b525a7efdfdedfb7c80364e186994e), [`a8d444b25`](https://github.com/keystonejs/keystone/commit/a8d444b25109f84e9d4659f2a260c5ad65f93393), [`7203c5889`](https://github.com/keystonejs/keystone/commit/7203c588901c46fae1550f3596cab43a1dd5052a), [`d2390b703`](https://github.com/keystonejs/keystone/commit/d2390b703d30e0b4264ab6ed9b1ba4d7bb9fca6c), [`34a9816d3`](https://github.com/keystonejs/keystone/commit/34a9816d3c40a35409be735e748cea2c6d5aa895), [`60db743aa`](https://github.com/keystonejs/keystone/commit/60db743aa79f6590d6a3ebb0169021f1c36f64cc), [`326242533`](https://github.com/keystonejs/keystone/commit/3262425335de5eee6979e38ebb45f19a22c1ee1a), [`b15221ac2`](https://github.com/keystonejs/keystone/commit/b15221ac21746b1380ddb31395cdd386d52920a9), [`16649fa55`](https://github.com/keystonejs/keystone/commit/16649fa556ae3723ca97eb0752653259ccae4bc2), [`ba363d9a8`](https://github.com/keystonejs/keystone/commit/ba363d9a82d3ca3ec464547a5d9e38354bc2a172), [`927150d81`](https://github.com/keystonejs/keystone/commit/927150d81e297fdb5c8ccad087ea255b861dfe32), [`c7599a46f`](https://github.com/keystonejs/keystone/commit/c7599a46f05108b10b3a805a20b77b4d834e616d), [`86f3fffb8`](https://github.com/keystonejs/keystone/commit/86f3fffb8aa4de455cf18d7c95f5135a5ad17731), [`1cc3deaf0`](https://github.com/keystonejs/keystone/commit/1cc3deaf0b0a48aecb0f0f2454f4fe2634e1da5f), [`070519dbe`](https://github.com/keystonejs/keystone/commit/070519dbec289b759759343d084bc5d2de9d4b37), [`98bd9d8c0`](https://github.com/keystonejs/keystone/commit/98bd9d8c05971e88f46dc9c9892f6a232ddf124c), [`10babad4b`](https://github.com/keystonejs/keystone/commit/10babad4b4135738bc0633b113e5c96d3ddb9e9f), [`24f5ab51c`](https://github.com/keystonejs/keystone/commit/24f5ab51c69d744fb0e1f47a0723c2cc70492010), [`c35f9cd1c`](https://github.com/keystonejs/keystone/commit/c35f9cd1cba5bf27eb9cf7cc1a113716bc4a50ef)]:
  - @keystonejs/app-admin-ui@7.0.0
  - @keystonejs/field-content@7.0.0
  - @arch-ui/input@0.1.10
  - @keystonejs/access-control@6.0.0
  - @arch-ui/fields@3.0.2
  - @keystonejs/build-field-types@5.2.8
  - @arch-ui/button@0.0.20
  - @keystonejs/adapter-knex@10.0.2
  - @keystonejs/adapter-mongoose@8.1.2
  - @keystonejs/test-utils@6.1.3

## 11.0.0

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

- [`a124417f`](https://github.com/keystonejs/keystone/commit/a124417fddc75889db5e4e8e0d5625fb4af12590) [#2943](https://github.com/keystonejs/keystone/pull/2943) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed error when Relationship field was passed an undefined or null value.

* [`54931d75`](https://github.com/keystonejs/keystone/commit/54931d75d3f26f4f300c2c4c3ee65ed3183b4a6a) [#2923](https://github.com/keystonejs/keystone/pull/2923) Thanks [@timleslie](https://github.com/timleslie)! - Updated documentation for the CalendarDay field type.

- [`59ed6310`](https://github.com/keystonejs/keystone/commit/59ed6310bacc76f571639de048689becbedbeac5) [#2930](https://github.com/keystonejs/keystone/pull/2930) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed many usability issues with the CalendarDay field:

  - Fixed field not functioning as a proper controlled component in the Create popout.
  - Fixed field initially displaying "Invalid Date" before defaulting to 1970-01-01.
  - Filter input no longer defaults to the current date. This was bugged; submitting the form with no changes would match nothing.
  - Filter input now falls back to no value when given an invalid date. Previously, it was falling back to 1970-01-01.
  - Fixed filter input not initially displaying the current value when in edit mode (it was displaying the current date).
  - Fixed filter input not being initially focused.
  - Fixed filter input not being submitted properly if focus wasn't lost first.

  Updated chrono-node dependency to 1.4.6.

- Updated dependencies [[`2b0f6441`](https://github.com/keystonejs/keystone/commit/2b0f6441e50787a4a82f417b573078717b39e9be), [`f9604621`](https://github.com/keystonejs/keystone/commit/f9604621048afceb071a43c7b8d36d944555487f), [`3e5a8962`](https://github.com/keystonejs/keystone/commit/3e5a8962cc982765574464537904008be975b446), [`5a58bde6`](https://github.com/keystonejs/keystone/commit/5a58bde636f551f2d241086d47781d3c88852b99), [`e9a0de2c`](https://github.com/keystonejs/keystone/commit/e9a0de2cc03c211beca01ec206244105bdca6afc), [`3b0f4137`](https://github.com/keystonejs/keystone/commit/3b0f4137df4112c79e6db57ae68fe04ad338da4c), [`15c57317`](https://github.com/keystonejs/keystone/commit/15c573178fa056912503f3ed83efeccceabba3ec), [`d60e2ca9`](https://github.com/keystonejs/keystone/commit/d60e2ca91ab4a7dd815e030bcc92991c3380fa7e), [`94d55b8f`](https://github.com/keystonejs/keystone/commit/94d55b8fc3a334a556c19765063e9efb594b41a7), [`59ed6310`](https://github.com/keystonejs/keystone/commit/59ed6310bacc76f571639de048689becbedbeac5), [`2709a6b5`](https://github.com/keystonejs/keystone/commit/2709a6b512fe636d979837599b67bdb17b2517b1)]:
  - @keystonejs/app-admin-ui@6.0.1
  - @arch-ui/button@0.0.19
  - @arch-ui/day-picker@1.0.0
  - @keystonejs/field-content@6.0.1

## 10.0.0

### Major Changes

- [`d8584765`](https://github.com/keystonejs/keystone/commit/d85847652e224e5000e036be2df0b8a45ab96385) [#2906](https://github.com/keystonejs/keystone/pull/2906) Thanks [@timleslie](https://github.com/timleslie)! - Removed `Controller.adminMeta` in favour of explicit values for `.readViews`, `.preloadViews`, `.getListByKey`, `.adminPath`, and `.authStrategy`.

### Minor Changes

- [`72e0a4e1`](https://github.com/keystonejs/keystone/commit/72e0a4e19942df11c72d11c2cf6ee9bc94300d87) [#2895](https://github.com/keystonejs/keystone/pull/2895) Thanks [@Vultraz](https://github.com/Vultraz)! - The base `FieldController` class no longer takes the owning list as a second argument.

* [`6e507838`](https://github.com/keystonejs/keystone/commit/6e5078380e1d17eb2884554eef114fdd521a15f4) [#2890](https://github.com/keystonejs/keystone/pull/2890) Thanks [@Vultraz](https://github.com/Vultraz)! - Refactored the Unsplash content block to use Apollo query hooks.

- [`e2800875`](https://github.com/keystonejs/keystone/commit/e28008756cbcc1e07e012a9fdb0cfa0ad94f3673) [#2897](https://github.com/keystonejs/keystone/pull/2897) Thanks [@Vultraz](https://github.com/Vultraz)! - Elevated isOrderable, isRequired, and adminDoc keys to direct FieldController properties.

* [`bcf03a7f`](https://github.com/keystonejs/keystone/commit/bcf03a7f8067a3f29f22dde397b957bf5cee1a07) [#2873](https://github.com/keystonejs/keystone/pull/2873) Thanks [@Vultraz](https://github.com/Vultraz)! - Cleaned up CreateItemModal implementation. The component is no longer passed to field views and should be imported from the @keystonejs/app-admin-ui package instead.

### Patch Changes

- [`5ec4e5d5`](https://github.com/keystonejs/keystone/commit/5ec4e5d547503baeae2ac2f6317b66c2ebae93b7) [#2915](https://github.com/keystonejs/keystone/pull/2915) Thanks [@timleslie](https://github.com/timleslie)! - Updated website related dependencies.

* [`e3d46ce4`](https://github.com/keystonejs/keystone/commit/e3d46ce4bd9f9ec8808ab3194672c6849e624e27) [#2919](https://github.com/keystonejs/keystone/pull/2919) Thanks [@Vultraz](https://github.com/Vultraz)! - Made handling of field-specific config options more consistent.

- [`285026a0`](https://github.com/keystonejs/keystone/commit/285026a04ffce23ab72d7defc18ced2e980b0de4) [#2916](https://github.com/keystonejs/keystone/pull/2916) Thanks [@Vultraz](https://github.com/Vultraz)! - Cleaned up handling of defaultValue in field controllers.

* [`d4811b02`](https://github.com/keystonejs/keystone/commit/d4811b0231c5d64e95dbbce57531df0931d4defa) [#2708](https://github.com/keystonejs/keystone/pull/2708) Thanks [@Vultraz](https://github.com/Vultraz)! - Some minor cleanup to the file field:

  - Removed unused `route` and `directory` config options.
  - Added `originalFilename` to the admin meta query.
  - Explicitly added `originalFilename` and `encoding` to the Mongoose schema.

- [`60e2c7eb`](https://github.com/keystonejs/keystone/commit/60e2c7eb2298a016c68a19a056040a3b45beab2a) [#2865](https://github.com/keystonejs/keystone/pull/2865) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed a bunch more duplicate field class names (no functional changes).

* [`99da34a8`](https://github.com/keystonejs/keystone/commit/99da34a8db26b8861b08cee330407605e787a80c) [#2887](https://github.com/keystonejs/keystone/pull/2887) Thanks [@timleslie](https://github.com/timleslie)! - Updated views to make use of the `getRefList()` method of the relationship field controller.

- [`e765ad20`](https://github.com/keystonejs/keystone/commit/e765ad20abae9838f64b72b7d43767ec87db336a) [#2866](https://github.com/keystonejs/keystone/pull/2866) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated mongodb and mongoose dependencies to latest version.

* [`d7eb2601`](https://github.com/keystonejs/keystone/commit/d7eb260144d2aa31e7ef4e636e7a23f91dc37285) [#2832](https://github.com/keystonejs/keystone/pull/2832) Thanks [@Vultraz](https://github.com/Vultraz)! - Added horizontal padding to Select field filter dropdown.

* Updated dependencies [[`4d3efe0f`](https://github.com/keystonejs/keystone/commit/4d3efe0fb65e0155c130cf3e0c378f024965f46d), [`c506dfa8`](https://github.com/keystonejs/keystone/commit/c506dfa81a5ef3640716f69412b1a37c947d4f95), [`72e0a4e1`](https://github.com/keystonejs/keystone/commit/72e0a4e19942df11c72d11c2cf6ee9bc94300d87), [`5e20df81`](https://github.com/keystonejs/keystone/commit/5e20df81aaa8b464071c1e0adc64635752163362), [`a1c9c372`](https://github.com/keystonejs/keystone/commit/a1c9c372c274de8cb0d0012c0d5c20c46f356b0a), [`04dffb3c`](https://github.com/keystonejs/keystone/commit/04dffb3c0abd03712df431ff57b3271b10f4f47b), [`bfa3a287`](https://github.com/keystonejs/keystone/commit/bfa3a287a40f625b74d1f430dff6826296bb7019), [`12126788`](https://github.com/keystonejs/keystone/commit/121267885eb3e279eb5b6d035568f547323dd245), [`d639624d`](https://github.com/keystonejs/keystone/commit/d639624db8615b52731af56fea0ae9c573ef38a1), [`e0e3e30a`](https://github.com/keystonejs/keystone/commit/e0e3e30a9051741de3f5a0c12ba00f2238d54800), [`3e9bfb85`](https://github.com/keystonejs/keystone/commit/3e9bfb854196dffcca98f60c5de9ad463d79f4f2), [`5ec4e5d5`](https://github.com/keystonejs/keystone/commit/5ec4e5d547503baeae2ac2f6317b66c2ebae93b7), [`6e507838`](https://github.com/keystonejs/keystone/commit/6e5078380e1d17eb2884554eef114fdd521a15f4), [`3cd5f205`](https://github.com/keystonejs/keystone/commit/3cd5f205348311a2ad00875782530b96c3c477af), [`08087998`](https://github.com/keystonejs/keystone/commit/08087998af0045aa45b26d721f75639cd279ae1b), [`6c19f04c`](https://github.com/keystonejs/keystone/commit/6c19f04c0e5ce972283562daebe60c9f4a29c55c), [`fcb9f2c1`](https://github.com/keystonejs/keystone/commit/fcb9f2c1751ec866adddeb6946e8ab60ffef06e6), [`547fd837`](https://github.com/keystonejs/keystone/commit/547fd8373797f0cb5d8dd0acd193750686053fac), [`2a1e4f49`](https://github.com/keystonejs/keystone/commit/2a1e4f49d7f234c49e5b04440ff786ddf3e9e7ed), [`9e2e0071`](https://github.com/keystonejs/keystone/commit/9e2e00715aff50f2ddfedf3dbc14f390275ff23b), [`d8584765`](https://github.com/keystonejs/keystone/commit/d85847652e224e5000e036be2df0b8a45ab96385), [`405d0ae1`](https://github.com/keystonejs/keystone/commit/405d0ae1d332e31423db43f58ac26c25abbe94a3), [`ddd6b435`](https://github.com/keystonejs/keystone/commit/ddd6b435cc1301cd5ea1ff2e24fa827d9b46aea3), [`121cb02d`](https://github.com/keystonejs/keystone/commit/121cb02d1c9886a24bfa14c985ede48d6a56edca), [`285026a0`](https://github.com/keystonejs/keystone/commit/285026a04ffce23ab72d7defc18ced2e980b0de4), [`babed628`](https://github.com/keystonejs/keystone/commit/babed628a408d7da39990a4c89a19828468555a8), [`216e6dec`](https://github.com/keystonejs/keystone/commit/216e6deca2b0d9a22ddbf0657a01b5122c178269), [`e2800875`](https://github.com/keystonejs/keystone/commit/e28008756cbcc1e07e012a9fdb0cfa0ad94f3673), [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533), [`9a94cee8`](https://github.com/keystonejs/keystone/commit/9a94cee8e59fdf7956d82887390dfb84bf6185fa), [`bcf03a7f`](https://github.com/keystonejs/keystone/commit/bcf03a7f8067a3f29f22dde397b957bf5cee1a07), [`e765ad20`](https://github.com/keystonejs/keystone/commit/e765ad20abae9838f64b72b7d43767ec87db336a), [`1ca8951c`](https://github.com/keystonejs/keystone/commit/1ca8951c71c5af3b0ff338a9a6a8733231fb90c4), [`d7eb2601`](https://github.com/keystonejs/keystone/commit/d7eb260144d2aa31e7ef4e636e7a23f91dc37285)]:
  - @keystonejs/app-admin-ui@6.0.0
  - @keystonejs/utils@5.4.1
  - @arch-ui/day-picker@0.0.26
  - @keystonejs/build-field-types@5.2.7
  - @keystonejs/field-content@6.0.0
  - @keystonejs/test-utils@6.1.2
  - @keystonejs/adapter-knex@10.0.0
  - @arch-ui/popout@0.0.19
  - @keystonejs/adapter-mongoose@8.1.0
  - @arch-ui/options@0.0.21

## 9.0.5

### Patch Changes

- [`b897ba14`](https://github.com/keystonejs/keystone/commit/b897ba14e34aa441b2d658c30b3dda9d1ebd48e2) [#2844](https://github.com/keystonejs/keystone/pull/2844) Thanks [@timleslie](https://github.com/timleslie)! - Fixed broken link in docs.

* [`f266a692`](https://github.com/keystonejs/keystone/commit/f266a6923a24c84936d66e00ec7de0ea0956445b) [#2854](https://github.com/keystonejs/keystone/pull/2854) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded dependencies.

- [`4e56eed6`](https://github.com/keystonejs/keystone/commit/4e56eed68c643fd436c371e2635d3024c51968b0) [#2636](https://github.com/keystonejs/keystone/pull/2636) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added documentation about using blocks in the content field.

- Updated dependencies [[`ab484f19`](https://github.com/keystonejs/keystone/commit/ab484f195752bb3ec59f6beb7d8817dce610ad06), [`1b059e72`](https://github.com/keystonejs/keystone/commit/1b059e726d95bbc6ad09a76ed3b40dbc4cf11682), [`95babf5d`](https://github.com/keystonejs/keystone/commit/95babf5da8488f2d7f8ab9f91ff640576462af6d), [`4af9e407`](https://github.com/keystonejs/keystone/commit/4af9e4075c9329ab27e7aa18a664d2f2bcc1ac2d), [`b897ba14`](https://github.com/keystonejs/keystone/commit/b897ba14e34aa441b2d658c30b3dda9d1ebd48e2), [`0aac3b41`](https://github.com/keystonejs/keystone/commit/0aac3b411a9e4f397645d9641c4675eab7a6e55b), [`b0bfcf79`](https://github.com/keystonejs/keystone/commit/b0bfcf79477249f3c0bb14db68588d84a68f0186), [`4e56eed6`](https://github.com/keystonejs/keystone/commit/4e56eed68c643fd436c371e2635d3024c51968b0), [`8a135a88`](https://github.com/keystonejs/keystone/commit/8a135a88ae6f3a4434db0ba7033cad2e5f18651e), [`63a2f7c3`](https://github.com/keystonejs/keystone/commit/63a2f7c31777d968bad32d6e746e2f960c6ef0ad), [`3d40bd7d`](https://github.com/keystonejs/keystone/commit/3d40bd7dd39f2b5589012356dd2b1698eda4f0b2), [`96f0c6e9`](https://github.com/keystonejs/keystone/commit/96f0c6e917ecdd02af8da52829608b003219d3ca), [`81a9aa7c`](https://github.com/keystonejs/keystone/commit/81a9aa7c2349f9bb71d1a9686e4fa359a14b033f)]:
  - @keystonejs/app-admin-ui@5.12.0
  - @keystonejs/field-content@5.4.8
  - @keystonejs/test-utils@6.1.1
  - @keystonejs/build-field-types@5.2.6

## 9.0.4

### Patch Changes

- [`577b5e69`](https://github.com/keystonejs/keystone/commit/577b5e69ac4f949d1be2a80d8f391cb0a4b1333a) [#2799](https://github.com/keystonejs/keystone/pull/2799) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Upgraded React and Emotion packages.

- Updated dependencies [[`577b5e69`](https://github.com/keystonejs/keystone/commit/577b5e69ac4f949d1be2a80d8f391cb0a4b1333a)]:
  - @keystonejs/app-admin-ui@5.11.1
  - @arch-ui/alert@0.0.17
  - @arch-ui/button@0.0.18
  - @arch-ui/controls@0.1.8
  - @arch-ui/day-picker@0.0.25
  - @arch-ui/drawer@0.0.21
  - @arch-ui/fields@3.0.1
  - @arch-ui/filters@0.0.19
  - @arch-ui/icons@0.1.1
  - @arch-ui/input@0.1.9
  - @arch-ui/layout@0.2.13
  - @arch-ui/loading@0.0.17
  - @arch-ui/lozenge@0.0.16
  - @arch-ui/options@0.0.20
  - @arch-ui/popout@0.0.18
  - @arch-ui/select@0.1.8
  - @arch-ui/tooltip@0.1.12
  - @arch-ui/typography@0.0.17
  - @keystonejs/build-field-types@5.2.5
  - @keystonejs/field-content@5.4.7

## 9.0.3

### Patch Changes

- [`732128fb`](https://github.com/keystonejs/keystone/commit/732128fb3598039cbb13b08c237fcd3c612b6621) [#2786](https://github.com/keystonejs/keystone/pull/2786) Thanks [@Vultraz](https://github.com/Vultraz)! - Upgraded to react-popper 2.2.2.

* [`fecf9179`](https://github.com/keystonejs/keystone/commit/fecf9179718f4527f6951a88307d9792cf32d08c) [#2783](https://github.com/keystonejs/keystone/pull/2783) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Changed the name of variables in several field types. No functional change.

- [`667bed43`](https://github.com/keystonejs/keystone/commit/667bed43ed0a075565c959dc0d5699cc911c7d64) [#2772](https://github.com/keystonejs/keystone/pull/2772) Thanks [@Abogical](https://github.com/Abogical)! - Changed test-utils to a development dependency.

* [`e5fac4db`](https://github.com/keystonejs/keystone/commit/e5fac4db00e1d38c2271d8ca55e7e2bd86a07dfa) [#2730](https://github.com/keystonejs/keystone/pull/2730) Thanks [@Vultraz](https://github.com/Vultraz)! - Made HiddenInput component actually hidden.

* Updated dependencies [[`78fda9d7`](https://github.com/keystonejs/keystone/commit/78fda9d7b9a090240c946553cc42ba0bf6b8a88c), [`732128fb`](https://github.com/keystonejs/keystone/commit/732128fb3598039cbb13b08c237fcd3c612b6621), [`e7afc083`](https://github.com/keystonejs/keystone/commit/e7afc08338cc04bfc8b6eec1a21f777f81f4d6c8), [`501fd3e4`](https://github.com/keystonejs/keystone/commit/501fd3e4a06cfeba0f96a76ff8763d3be577af6e), [`b14c07a1`](https://github.com/keystonejs/keystone/commit/b14c07a154ae1cb92e7cbc87484d99419f92d649), [`875aa0ed`](https://github.com/keystonejs/keystone/commit/875aa0ed787d901061aa0409160a360546014df3), [`16f6c300`](https://github.com/keystonejs/keystone/commit/16f6c3003d1decbb77474455ef608e3efd41ec4b), [`e5fac4db`](https://github.com/keystonejs/keystone/commit/e5fac4db00e1d38c2271d8ca55e7e2bd86a07dfa), [`9c403c7c`](https://github.com/keystonejs/keystone/commit/9c403c7c273cc915d023bd98986d43cd4ab74477)]:
  - @arch-ui/fields@3.0.0
  - @arch-ui/tooltip@0.1.11
  - @keystonejs/field-content@5.4.6
  - @keystonejs/app-admin-ui@5.11.0
  - @keystonejs/adapter-knex@9.0.3
  - @keystonejs/adapter-mongoose@8.0.2
  - @arch-ui/input@0.1.8
  - @arch-ui/icons@0.1.0
  - @arch-ui/day-picker@0.0.24
  - @arch-ui/options@0.0.19

## 9.0.2

### Patch Changes

- [`9d862edc`](https://github.com/keystonejs/keystone/commit/9d862edc506460d4a0456e48ec418b9042b582ad) [#2738](https://github.com/keystonejs/keystone/pull/2738) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated react-select dependency to 3.1.0.

* [`98e9f6d1`](https://github.com/keystonejs/keystone/commit/98e9f6d16e16ee13d2a8a22eb25be9cd2afc6fc0) [#2314](https://github.com/keystonejs/keystone/pull/2314) Thanks [@gautamsi](https://github.com/gautamsi)! - \* Made all values in `adminConfig` list options available to `admin-ui` as part of list's `adminMeta`.

  - Added `adminConfig` option to all Fields which are made available to field's `adminMeta` in `admin-ui`.
  - Added `adminMeta` option in `AdminUIApp` constructor which is also made available to `adminMeta` of `admin-ui`.

  All the improvements are useful in `admin-ui` customizations like UI Hooks or custom Field Views.

* Updated dependencies [[`62f09391`](https://github.com/keystonejs/keystone/commit/62f093911879ca6b57ec0a06ce646e2296593c9a), [`9d862edc`](https://github.com/keystonejs/keystone/commit/9d862edc506460d4a0456e48ec418b9042b582ad), [`344c45ef`](https://github.com/keystonejs/keystone/commit/344c45efbb96a90010f81e4c8447a9c5728ea87f), [`81822d67`](https://github.com/keystonejs/keystone/commit/81822d67822bdc77b360b709f2e824cc43d88f15), [`98be4b48`](https://github.com/keystonejs/keystone/commit/98be4b4858f0f2cd672910acc5e6cc0c079ce21f), [`875c7df5`](https://github.com/keystonejs/keystone/commit/875c7df5873c3a5173fba1a7c3078fcd098f0a32), [`98e9f6d1`](https://github.com/keystonejs/keystone/commit/98e9f6d16e16ee13d2a8a22eb25be9cd2afc6fc0), [`57e6ce29`](https://github.com/keystonejs/keystone/commit/57e6ce293e5afd0add52728aa73c74e90fcbe0f7)]:
  - @keystonejs/test-utils@6.1.0
  - @keystonejs/app-admin-ui@5.10.0
  - @arch-ui/options@0.0.18
  - @arch-ui/select@0.1.7
  - @arch-ui/controls@0.1.7
  - @keystonejs/adapter-knex@9.0.2
  - @arch-ui/layout@0.2.12

## 9.0.1

### Patch Changes

- [`c013d8bc`](https://github.com/keystonejs/keystone/commit/c013d8bc1113b2a31ededc3918ab98c2c99f25f4) [#2425](https://github.com/keystonejs/keystone/pull/2425) Thanks [@Vultraz](https://github.com/Vultraz)! - The `password_is_set` flag is now used to display "Update password" or "Set password" in the Admin UI for `Password` fields.

* [`93ae77ef`](https://github.com/keystonejs/keystone/commit/93ae77efe71151279a15ddb7ddc3df60651022b4) [#2701](https://github.com/keystonejs/keystone/pull/2701) Thanks [@BasitAli](https://github.com/BasitAli)! - Fixed "Is exactly" filter on `Text` fields.

- [`eb90aea6`](https://github.com/keystonejs/keystone/commit/eb90aea6b33dda8d95baba818306328dd747247f) [#2726](https://github.com/keystonejs/keystone/pull/2726) Thanks [@Vultraz](https://github.com/Vultraz)! - Improved Checkbox field filter interface.

- Updated dependencies [[`3193f4a5`](https://github.com/keystonejs/keystone/commit/3193f4a56c6391d07e8c04913a667940ef7b8815), [`390a7fc3`](https://github.com/keystonejs/keystone/commit/390a7fc3b20169c628dd7aa2e2a4d72b678a345f)]:
  - @keystonejs/app-admin-ui@5.9.6
  - @arch-ui/day-picker@0.0.23

## 9.0.0

### Major Changes

- [`fd685241`](https://github.com/keystonejs/keystone/commit/fd68524135025e4d800b4a98932916736dd50e9d) [#2000](https://github.com/keystonejs/keystone/pull/2000) Thanks [@timleslie](https://github.com/timleslie)! - ## Release - Arcade

  This release introduces a **new and improved data schema** for Keystone.
  The new data schema simplifies the way your data is stored and will unlock the development of new functionality within Keystone.

  > **Important:** You will need to make changes to your database to take advantage of the new data schema. Please read the full [release notes](https://www.keystonejs.com/discussions/new-data-schema) for instructions on updating your database.

### Patch Changes

- Updated dependencies [[`fd685241`](https://github.com/keystonejs/keystone/commit/fd68524135025e4d800b4a98932916736dd50e9d)]:
  - @keystonejs/adapter-knex@9.0.0
  - @keystonejs/adapter-mongoose@8.0.0
  - @keystonejs/test-utils@6.0.3
  - @keystonejs/app-admin-ui@5.9.5
  - @keystonejs/field-content@5.4.5

## 8.0.0

### Major Changes

- [`2ae2bd47`](https://github.com/keystonejs/keystone/commit/2ae2bd47eb54a816cfd4c8cd178c460729cbc258) [#2623](https://github.com/keystonejs/keystone/pull/2623) Thanks [@maryam-mv](https://github.com/maryam-mv)! - Updated @sindresorhus/slugify to fix a problem where it was producing unexpected output, eg. adding unexpected underscores: 'NAME1 Website' => 'nam_e1_website'. The slugify output for db name may be different with this change. For the above example, the output will now be 'name_1_website' for the same string.

  If your database name changes unexpectedly, you can add an environment variable called `DATABASE_URL` with a full path to the database. For more information on configuring database connections read the documentation for the [Knex adapter](https://v5.keystonejs.com/keystonejs/adapter-knex/#knexoptions) or [Mongoose adapter](https://v5.keystonejs.com/keystonejs/adapter-mongoose/#mongoose-database-adapter).

  If you are using the `Slug` field type, in some edge-cases, slugs may change when saved after this update. You can use the `generate` option on the slug field for [custom slug generation](https://v5.keystonejs.com/keystonejs/fields/src/types/slug/#custom-generate-method) if required.

### Minor Changes

- [`d138736d`](https://github.com/keystonejs/keystone/commit/d138736db184c5884171c7a65e43377f248046b5) [#2617](https://github.com/keystonejs/keystone/pull/2617) Thanks [@JedWatson](https://github.com/JedWatson)! - Added dataType support to Select fields, values can now be stored as enums, strings or integers

### Patch Changes

- [`e7e4bc1d`](https://github.com/keystonejs/keystone/commit/e7e4bc1d22149d4daceb31d303f6ad10c2b853ba) [#2585](https://github.com/keystonejs/keystone/pull/2585) Thanks [@timleslie](https://github.com/timleslie)! - Internal refactor, no functional changes.

* [`58c4ffc3`](https://github.com/keystonejs/keystone/commit/58c4ffc3d4b1edf8bdfbc4ea299133d303239fc6) [#2611](https://github.com/keystonejs/keystone/pull/2611) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed a build error with OEmbed field.

- [`007063c4`](https://github.com/keystonejs/keystone/commit/007063c4f17e6e7038312ed9126eaf91757e7939) [#2616](https://github.com/keystonejs/keystone/pull/2616) Thanks [@JedWatson](https://github.com/JedWatson)! - Improved layout of checkbox fields.

* [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063) [#2593](https://github.com/keystonejs/keystone/pull/2593) Thanks [@jossmac](https://github.com/jossmac)! - Applied a more consistent voice throughout documentation.

- [`2cbd38b0`](https://github.com/keystonejs/keystone/commit/2cbd38b05adc98cface11a8767f66b48a1cb0bbf) [#2539](https://github.com/keystonejs/keystone/pull/2539) Thanks [@jesstelford](https://github.com/jesstelford)! - Normalize the behaviour of presaving in Mongo based on Decimal field fix in #2537

- Updated dependencies [[`b4d16b89`](https://github.com/keystonejs/keystone/commit/b4d16b89aab643f34d70f42823817a246bf16373), [`7fc00071`](https://github.com/keystonejs/keystone/commit/7fc00071cd22514103593f0da68b9efa3bf853e9), [`63169b6a`](https://github.com/keystonejs/keystone/commit/63169b6a6b6a4dc286cd224b7f871960f2d4b0ad), [`007063c4`](https://github.com/keystonejs/keystone/commit/007063c4f17e6e7038312ed9126eaf91757e7939), [`c08c28d2`](https://github.com/keystonejs/keystone/commit/c08c28d22f2c6a2bfa73ab0ea347c9e0da8a9063), [`2ae2bd47`](https://github.com/keystonejs/keystone/commit/2ae2bd47eb54a816cfd4c8cd178c460729cbc258), [`0b37b13b`](https://github.com/keystonejs/keystone/commit/0b37b13b5b11a5391b70920f9e8cbd6c5a71f586)]:
  - @keystonejs/app-admin-ui@5.9.4
  - @arch-ui/alert@0.0.16
  - @arch-ui/day-picker@0.0.22
  - @arch-ui/drawer@0.0.20
  - @arch-ui/loading@0.0.16
  - @arch-ui/lozenge@0.0.15
  - @arch-ui/options@0.0.17
  - @arch-ui/tooltip@0.1.10
  - @arch-ui/typography@0.0.16
  - @arch-ui/fields@2.1.5
  - @keystonejs/adapter-knex@8.0.0
  - @keystonejs/adapter-mongoose@7.0.0
  - @keystonejs/test-utils@6.0.2
  - @keystonejs/field-content@5.4.4
  - @arch-ui/button@0.0.17

## 7.0.2

### Patch Changes

- [`68be8f45`](https://github.com/keystonejs/keystone/commit/68be8f452909100fbddec431d6fe60c20a06a700) [#2549](https://github.com/keystonejs/keystone/pull/2549) Thanks [@jesstelford](https://github.com/jesstelford)! - Removed unused 'existingItem' parameter from calls to .defaultValue() methods.

- Updated dependencies [[`b6a555c2`](https://github.com/keystonejs/keystone/commit/b6a555c28296394908757f7404b72bc6b828b52a), [`abac6ad8`](https://github.com/keystonejs/keystone/commit/abac6ad83ad71f40047473c81d50b6af80ad41b2), [`7c9d36a2`](https://github.com/keystonejs/keystone/commit/7c9d36a2d5002258964cbd9414766ee244945005), [`ca28681c`](https://github.com/keystonejs/keystone/commit/ca28681ca23c74bc57041fa36c20b93a4520e762), [`cec7ba5e`](https://github.com/keystonejs/keystone/commit/cec7ba5e2061280eff2a1d989054ecb02760e36d), [`663ae7b4`](https://github.com/keystonejs/keystone/commit/663ae7b453f450f077795fbbc6c9f138e6b27f52)]:
  - @keystonejs/app-admin-ui@5.9.3
  - @keystonejs/adapter-knex@7.0.0
  - @keystonejs/build-field-types@5.2.4
  - @keystonejs/adapter-mongoose@6.0.0
  - @keystonejs/utils@5.4.0
  - @keystonejs/test-utils@6.0.1

## 7.0.1

### Patch Changes

- [`83bdf743`](https://github.com/keystonejs/keystone/commit/83bdf743748e39d1ea73eff2c8e3576cc713c624) [#2538](https://github.com/keystonejs/keystone/pull/2538) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated mongo dependencies to latest version.

* [`d748156b`](https://github.com/keystonejs/keystone/commit/d748156ba5ebe33f4271fae0df781e0c63f2b7e6) [#2537](https://github.com/keystonejs/keystone/pull/2537) Thanks [@jesstelford](https://github.com/jesstelford)! - Introduce a framework for testing CRUD operations on fields. This surfaced a bug in the Decimal field where updating _other_ fields would result in a Decimal field being reset to null.

- [`1d9c6762`](https://github.com/keystonejs/keystone/commit/1d9c6762d32409c71da6a68a083a81197c35aac3) [#2525](https://github.com/keystonejs/keystone/pull/2525) Thanks [@jesstelford](https://github.com/jesstelford)! - Refactored `matchFilter` to use named args (via an object) which makes understanding test code easier.

- Updated dependencies [[`51546e41`](https://github.com/keystonejs/keystone/commit/51546e4142fb8c66cfc413479c671a59618f885b), [`83bdf743`](https://github.com/keystonejs/keystone/commit/83bdf743748e39d1ea73eff2c8e3576cc713c624), [`1d9c6762`](https://github.com/keystonejs/keystone/commit/1d9c6762d32409c71da6a68a083a81197c35aac3), [`fb510d67`](https://github.com/keystonejs/keystone/commit/fb510d67ab124d8c1bda1884fa2a0d48262b5e4d)]:
  - @keystonejs/utils@5.3.0
  - @keystonejs/adapter-mongoose@5.2.2
  - @keystonejs/test-utils@6.0.0
  - @keystonejs/build-field-types@5.2.3

## 7.0.0

### Major Changes

- [`161bf3e5`](https://github.com/keystonejs/keystone/commit/161bf3e57acb1b3d88a0836507d4c8dd4935f260) [#2523](https://github.com/keystonejs/keystone/pull/2523) Thanks [@timleslie](https://github.com/timleslie)! - Replaced default bcrypt implementation from `bcrypt` to `bcryptjs`. You can use the new `useCompiledBcrypt` config option to the `Password` field to keep the use of the `bcrypt` package. `bcrypt` must be manually listed in your `package.json` if use set `{ useCompiledBcrypt: true }`, as it is no longer a dependency of Keystone.

### Patch Changes

- Updated dependencies [[`0de5f232`](https://github.com/keystonejs/keystone/commit/0de5f2321ef8f9fe6dd247c3201372a4156e61e9)]:
  - @arch-ui/theme@0.0.10
  - @keystonejs/app-admin-ui@5.9.2
  - @arch-ui/button@0.0.16
  - @arch-ui/input@0.1.7
  - @arch-ui/layout@0.2.11
  - @arch-ui/options@0.0.16
  - @arch-ui/alert@0.0.15
  - @arch-ui/controls@0.1.6
  - @arch-ui/day-picker@0.0.21
  - @arch-ui/drawer@0.0.19
  - @arch-ui/fields@2.1.4
  - @arch-ui/filters@0.0.18
  - @arch-ui/loading@0.0.15
  - @arch-ui/lozenge@0.0.14
  - @arch-ui/popout@0.0.17
  - @arch-ui/select@0.1.6
  - @arch-ui/tooltip@0.1.9
  - @arch-ui/typography@0.0.15
  - @keystonejs/field-content@5.4.3

## 6.3.2

### Patch Changes

- [`fe42a997`](https://github.com/keystonejs/keystone/commit/fe42a997c81825a819ac28f05e02d1ed61099542) [#2489](https://github.com/keystonejs/keystone/pull/2489) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated to Unsplash 6.0.0.

* [`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded React to 16.13.0.

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

- Updated dependencies [[`ca4d2178`](https://github.com/keystonejs/keystone/commit/ca4d217878c6e3829ed0c7a7e7a1909095a2eb7d), [`5dea5561`](https://github.com/keystonejs/keystone/commit/5dea5561527a4e991d017d087f512101d53256b9), [`d7c7d827`](https://github.com/keystonejs/keystone/commit/d7c7d8271c5da8fec01df123c954d6a03aa41146), [`f0148ccb`](https://github.com/keystonejs/keystone/commit/f0148ccb03abb882195b9bd44c34b780170c89ef), [`8aa42fae`](https://github.com/keystonejs/keystone/commit/8aa42fae79d4a63a74d4a0f1e3ac6c74fae6885b), [`42497b8e`](https://github.com/keystonejs/keystone/commit/42497b8ebbaeaf0f4d7881dbb76c6abafde4cace), [`6790d053`](https://github.com/keystonejs/keystone/commit/6790d053effba118d0b3a51806a5c066cf022d45), [`6de20ce6`](https://github.com/keystonejs/keystone/commit/6de20ce6b4aad46d2a8cc5ca8d1ada179aca7c9b), [`70f2101a`](https://github.com/keystonejs/keystone/commit/70f2101ab8dd57615800f11df5b72b8fedb09298), [`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722), [`df422e70`](https://github.com/keystonejs/keystone/commit/df422e70291ebf8660428c9a4a378611623985ae), [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20), [`9d11d7ce`](https://github.com/keystonejs/keystone/commit/9d11d7cea6f31eeceb7326d86460a3f0e25ad01d)]:
  - @keystonejs/field-content@5.4.2
  - @keystonejs/app-admin-ui@5.9.1
  - @keystonejs/build-field-types@5.2.2
  - @keystonejs/access-control@5.2.0
  - @arch-ui/alert@0.0.14
  - @arch-ui/button@0.0.15
  - @arch-ui/controls@0.1.5
  - @arch-ui/day-picker@0.0.20
  - @arch-ui/drawer@0.0.18
  - @arch-ui/fields@2.1.3
  - @arch-ui/filters@0.0.17
  - @arch-ui/icons@0.0.10
  - @arch-ui/input@0.1.6
  - @arch-ui/layout@0.2.10
  - @arch-ui/loading@0.0.14
  - @arch-ui/lozenge@0.0.13
  - @arch-ui/options@0.0.15
  - @arch-ui/popout@0.0.16
  - @arch-ui/select@0.1.5
  - @arch-ui/tooltip@0.1.8
  - @arch-ui/typography@0.0.14
  - @keystonejs/adapter-knex@6.3.2
  - @keystonejs/adapter-mongoose@5.2.1
  - @arch-ui/theme@0.0.9
  - @keystonejs/test-utils@5.1.2
  - @keystonejs/utils@5.2.2

## 6.3.1

### Patch Changes

- [`d8a7b8a2`](https://github.com/keystonejs/keystone/commit/d8a7b8a23b4c3e1545d101a92323be165ad362e2) [#2395](https://github.com/keystonejs/keystone/pull/2395) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded all `@emotion.*` dependencies.

* [`9a388f01`](https://github.com/keystonejs/keystone/commit/9a388f01e388272d56f81af2247d8030e0f2c972) [#2356](https://github.com/keystonejs/keystone/pull/2356) Thanks [@SeanDoyleGit](https://github.com/SeanDoyleGit)! - OEmbed blocks now have a default type of link instead of undefined

- [`bd4096ee`](https://github.com/keystonejs/keystone/commit/bd4096ee86f7790c76db23090b38f880e5aa7ecc) [#2402](https://github.com/keystonejs/keystone/pull/2402) Thanks [@LiamAttClarke](https://github.com/LiamAttClarke)! - Fixed invalid argument dereference in Virtual Field

* [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09) [#2381](https://github.com/keystonejs/keystone/pull/2381) Thanks [@timleslie](https://github.com/timleslie)! - Updated `@babel/*` dependency packages to latest versions.

- [`c059b63c`](https://github.com/keystonejs/keystone/commit/c059b63c6ebdbb60ac4095d1efd791d598b2756c) [#2397](https://github.com/keystonejs/keystone/pull/2397) Thanks [@Vultraz](https://github.com/Vultraz)! - Converted most field React components to functional ones.

- Updated dependencies [[`635529c9`](https://github.com/keystonejs/keystone/commit/635529c9f227ae968332cd32e63875c4561af926), [`6929a7e3`](https://github.com/keystonejs/keystone/commit/6929a7e3339f36e712bcbafc71ddf7a133730b29), [`0c9d3125`](https://github.com/keystonejs/keystone/commit/0c9d3125d9b4bb37047a6c6ed61796e52fba8b17), [`d8a7b8a2`](https://github.com/keystonejs/keystone/commit/d8a7b8a23b4c3e1545d101a92323be165ad362e2), [`5c6ee24c`](https://github.com/keystonejs/keystone/commit/5c6ee24ceea951d7add79af55ef5a408edd8b763), [`6b1ea0ec`](https://github.com/keystonejs/keystone/commit/6b1ea0ec1b536b5c9098105f5e77c0cd5feaf6b0), [`7c552a14`](https://github.com/keystonejs/keystone/commit/7c552a14078843710b7f225a88d1cd2024514981), [`b30d1361`](https://github.com/keystonejs/keystone/commit/b30d13612c54c0a3f0ebc2fc9c777954d4c4727f), [`1d98dae8`](https://github.com/keystonejs/keystone/commit/1d98dae898a5e7c5b580bfcc1745eec5dd323adb), [`fd94849b`](https://github.com/keystonejs/keystone/commit/fd94849bccaf13426d2f7bcc2cd82fe81da7be7e), [`5e8c6df3`](https://github.com/keystonejs/keystone/commit/5e8c6df3e7c8bee4c76ca4d5be38cd6aff198bd8), [`92b8fc4f`](https://github.com/keystonejs/keystone/commit/92b8fc4f2fc83dd40a8be50fc7344d27c59a4085), [`1b3ee45e`](https://github.com/keystonejs/keystone/commit/1b3ee45e9ec6e52329b208c73e5a3597aea69799), [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09), [`4313b645`](https://github.com/keystonejs/keystone/commit/4313b64554b1cc64e64245706b00c0510a5dd0b4)]:
  - @keystonejs/adapter-knex@6.3.1
  - @keystonejs/build-field-types@5.2.1
  - @keystonejs/app-admin-ui@5.9.0
  - @arch-ui/alert@0.0.13
  - @arch-ui/button@0.0.14
  - @arch-ui/controls@0.1.4
  - @arch-ui/day-picker@0.0.19
  - @arch-ui/drawer@0.0.17
  - @arch-ui/fields@2.1.2
  - @arch-ui/filters@0.0.16
  - @arch-ui/input@0.1.5
  - @arch-ui/layout@0.2.9
  - @arch-ui/loading@0.0.13
  - @arch-ui/lozenge@0.0.12
  - @arch-ui/options@0.0.14
  - @arch-ui/popout@0.0.15
  - @arch-ui/tooltip@0.1.7
  - @arch-ui/typography@0.0.13
  - @keystonejs/field-content@5.4.1
  - @keystonejs/test-utils@5.1.1
  - @arch-ui/icons@0.0.9
  - @arch-ui/select@0.1.4
  - @arch-ui/theme@0.0.8
  - @keystonejs/utils@5.2.1

## 6.3.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/access-control@5.1.0
  - @keystonejs/adapter-knex@6.3.0
  - @keystonejs/adapter-mongoose@5.2.0
  - @keystonejs/app-admin-ui@5.8.0
  - @keystonejs/build-field-types@5.2.0
  - @keystonejs/field-content@5.4.0
  - @keystonejs/test-utils@5.1.0
  - @keystonejs/utils@5.2.0

## 6.2.3

### Patch Changes

- [`b8631cf7`](https://github.com/keystonejs/keystone/commit/b8631cf770db14b90f83300358213b7572ca01f2) [#2320](https://github.com/keystonejs/keystone/pull/2320) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `graphql` dependency from 14.4.2 to 14.6.0 and `graphql-type-json` depedency from 0.2.1 to 0.3.1.

- Updated dependencies [[`b8631cf7`](https://github.com/keystonejs/keystone/commit/b8631cf770db14b90f83300358213b7572ca01f2), [`29845426`](https://github.com/keystonejs/keystone/commit/29845426cb699afcc003f6a0b9ef540a61f808b4), [`36a3e6a0`](https://github.com/keystonejs/keystone/commit/36a3e6a089b81a37276bbbe87dea7cf24dd5db9e), [`6c25d331`](https://github.com/keystonejs/keystone/commit/6c25d3319f89351568ad9d007b985a230e54b5b3), [`92d77eac`](https://github.com/keystonejs/keystone/commit/92d77eac59649430c2db810d2c701e5eab8b6e24), [`e93c2da7`](https://github.com/keystonejs/keystone/commit/e93c2da73a3d9f4adb17e00dd596c4326dc1993a), [`1e026fff`](https://github.com/keystonejs/keystone/commit/1e026fff05f777225105ebc188c8411a3b23beac)]:
  - @keystonejs/app-admin-ui@5.7.3
  - @arch-ui/drawer@0.0.16
  - @arch-ui/popout@0.0.14
  - @arch-ui/fields@2.1.1
  - @keystonejs/build-field-types@5.1.5

## 6.2.2

### Patch Changes

- [`8552314d`](https://github.com/keystonejs/keystone/commit/8552314d9f509010c462df6e64fe23839fbea5e3) [#2330](https://github.com/keystonejs/keystone/pull/2330) - Removed the preconstruct step that was causing issues outside the momorepo.
- Updated dependencies [[`8552314d`](https://github.com/keystonejs/keystone/commit/8552314d9f509010c462df6e64fe23839fbea5e3)]:
  - @keystonejs/app-admin-ui@5.7.2

## 6.2.1

### Patch Changes

- [`b0519b55`](https://github.com/keystonejs/keystone/commit/b0519b550b00680bb7233cda0f7eb748863871dc) [#2325](https://github.com/keystonejs/keystone/pull/2325) - Bumped the dependency on the AdminUI package.

## 6.2.0

### Minor Changes

- [`6bc87d43`](https://github.com/keystonejs/keystone/commit/6bc87d43de4861068de257735c1a6cf886cd3c17) [#2279](https://github.com/keystonejs/keystone/pull/2279) - Added React hooks to the AdminUI.

  This PR changes the way the `<CreateItem/>` component works internally. It also paves the way for future AdminUI extensions by exporting front-end components and utilities from `@keystonejs/app-admin-ui/components`. Initially this includes a `<ListProvider/>` component that is currently being consumed by the relationship field.

- [`6eb23086`](https://github.com/keystonejs/keystone/commit/6eb23086485d9bcbb93e35ec716d846790d611f2) [#2287](https://github.com/keystonejs/keystone/pull/2287) - Added `adminDoc` configuration option to all field types.

### Patch Changes

- [`8f54a4eb`](https://github.com/keystonejs/keystone/commit/8f54a4eb2d63ed042d736fd20ab622f326e111b8) [#2269](https://github.com/keystonejs/keystone/pull/2269) - Updated internal relationship configurations of `Content` fields to be self-consistent.
- Updated dependencies [[`6bc87d43`](https://github.com/keystonejs/keystone/commit/6bc87d43de4861068de257735c1a6cf886cd3c17), [`5b058a63`](https://github.com/keystonejs/keystone/commit/5b058a633c84465c9dff7cf940c8cb12bddcf215), [`ca2b043a`](https://github.com/keystonejs/keystone/commit/ca2b043a5043f6b4b110050127b2a9d759bb8569)]:
  - @keystonejs/app-admin-ui@5.7.0
  - @keystonejs/adapter-knex@6.2.0
  - @arch-ui/fields@2.1.0

## 6.1.0

### Minor Changes

- [`220d3a4b`](https://github.com/keystonejs/keystone/commit/220d3a4bc4265dc56653bed4b292f3e4d708502b) [#2005](https://github.com/keystonejs/keystone/pull/2005) - The presentation and usability of the content blocks editor was improved.

### Patch Changes

- [`11586035`](https://github.com/keystonejs/keystone/commit/115860350aa901749d240cb275cada29b8d541f8) [#2211](https://github.com/keystonejs/keystone/pull/2211) - Fixed work of relation select
- Updated dependencies [[`220d3a4b`](https://github.com/keystonejs/keystone/commit/220d3a4bc4265dc56653bed4b292f3e4d708502b)]:
  - @keystonejs/field-content@5.3.0

## 6.0.5

### Patch Changes

- [`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a) [#2144](https://github.com/keystonejs/keystone/pull/2144) - Upgraded all @babel/\* dependencies.

* [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29) [#2189](https://github.com/keystonejs/keystone/pull/2189) - Upgraded prettier to 1.19.1 and formatted code accordingly.

- [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104) [#2191](https://github.com/keystonejs/keystone/pull/2191) - Upgraded `mongoose` to `^5.8.4` and `mongodb` to `^3.4.1`.
- Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a), [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29), [`3d7222cd`](https://github.com/keystonejs/keystone/commit/3d7222cd589ce8accbf3a9de141976c38e2c7e23), [`4cd4499d`](https://github.com/keystonejs/keystone/commit/4cd4499d9d19a5b379b2ae6ab1028c008248629a), [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104)]:
  - @arch-ui/button@0.0.13
  - @arch-ui/controls@0.1.3
  - @arch-ui/day-picker@0.0.18
  - @arch-ui/drawer@0.0.15
  - @arch-ui/fields@2.0.5
  - @arch-ui/filters@0.0.15
  - @arch-ui/icons@0.0.8
  - @arch-ui/input@0.1.4
  - @arch-ui/layout@0.2.8
  - @arch-ui/loading@0.0.12
  - @arch-ui/lozenge@0.0.11
  - @arch-ui/options@0.0.13
  - @arch-ui/popout@0.0.13
  - @arch-ui/select@0.1.3
  - @arch-ui/theme@0.0.7
  - @arch-ui/tooltip@0.1.6
  - @arch-ui/typography@0.0.12
  - @keystonejs/build-field-types@5.1.4
  - @keystonejs/field-content@5.2.2
  - @keystonejs/utils@5.1.3
  - @keystonejs/adapter-knex@6.1.3
  - @keystonejs/test-utils@5.0.3
  - @keystonejs/adapter-mongoose@5.1.4
  - @arch-ui/alert@0.0.12

## 6.0.4

### Patch Changes

- [`85f21ced`](https://github.com/keystonejs/keystone/commit/85f21ced700e9630ce3d22590e4aec0694d621db) [#2122](https://github.com/keystonejs/keystone/pull/2122) - Fix for cloudinary images block error when serialized

## 6.0.3

### Patch Changes

- Updated dependencies [[`3d2c4b3f`](https://github.com/keystonejs/keystone/commit/3d2c4b3fb8f05e79fc1a4a8e39077058466795a2), [`ed85a3d3`](https://github.com/keystonejs/keystone/commit/ed85a3d3776873893e9ba46f3b0c4d0f71bd6b6d)]:
  - @keystonejs/adapter-knex@6.1.1
  - @keystonejs/utils@5.1.2
  - @arch-ui/drawer@0.0.14
  - @arch-ui/popout@0.0.12

## 6.0.2

### Patch Changes

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Removed unused 'immutable' dependency.

* [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Make dates orderable in adminUI.

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Upgrade all Babel deps to the same version (7.7.4)
- Updated dependencies [[`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62)]:
  - @keystonejs/field-content@5.2.0
  - @arch-ui/button@0.0.12
  - @arch-ui/controls@0.1.2
  - @arch-ui/day-picker@0.0.17
  - @arch-ui/drawer@0.0.13
  - @arch-ui/fields@2.0.4
  - @arch-ui/filters@0.0.14
  - @arch-ui/icons@0.0.7
  - @arch-ui/input@0.1.3
  - @arch-ui/layout@0.2.7
  - @arch-ui/loading@0.0.11
  - @arch-ui/lozenge@0.0.10
  - @arch-ui/options@0.0.12
  - @arch-ui/popout@0.0.11
  - @arch-ui/select@0.1.2
  - @arch-ui/theme@0.0.6
  - @arch-ui/tooltip@0.1.5
  - @arch-ui/typography@0.0.11
  - @keystonejs/build-field-types@5.1.3
  - @keystonejs/utils@5.1.1
  - @arch-ui/alert@0.0.11

## 6.0.1

### Patch Changes

- [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290) [#2078](https://github.com/keystonejs/keystone/pull/2078) - Convert to use Apollo hooks

* [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290) [#2078](https://github.com/keystonejs/keystone/pull/2078) - Fixed a bug in the Knex field adapter for virtual fields.

- [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290) [#2078](https://github.com/keystonejs/keystone/pull/2078) - Fixed several issues with the CalendarDay field:

  - Ensured format, yearRangeFrom, and yearRangeTo defaults are set correctly
  - Removed non-functional yearPickerType
  - Made displayed date format consistent between list and detailed views
  - Moved date range validation to validateInput- Updated dependencies [[`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290)]:
  - @arch-ui/alert@0.0.10
  - @arch-ui/day-picker@0.0.16

## 6.0.0

### Major Changes

- [`8188d76c`](https://github.com/keystonejs/keystone/commit/8188d76cb3f5d3e112ef95fd4e1887db9a520d9d) [#1980](https://github.com/keystonejs/keystone/pull/1980) Thanks [@timleslie](https://github.com/timleslie)! - Removed `KnexRelationshipInterface.createForeignKey()`.

### Minor Changes

- [`267dab2f`](https://github.com/keystonejs/keystone/commit/267dab2fee5bbea711c417c13366862e8e0ab3be) [#1799](https://github.com/keystonejs/keystone/pull/1799) Thanks [@SeanDoyleGit](https://github.com/SeanDoyleGit)! - Resolved unsplash images duplication issue in `react-slate`.

* [`af1e9e4d`](https://github.com/keystonejs/keystone/commit/af1e9e4d3b74753b903b20641b51df99184793df) [#1963](https://github.com/keystonejs/keystone/pull/1963) Thanks [@gemscng](https://github.com/gemscng)! - `Text` field filter is now case insensitive by default.

- [`0145f7e2`](https://github.com/keystonejs/keystone/commit/0145f7e21d9297e3037c709587eb3b4220ba3f01) [#1959](https://github.com/keystonejs/keystone/pull/1959) Thanks [@LiamAttClarke](https://github.com/LiamAttClarke)! - Added `in` and `not_in` filters to `IntegerField`.

* [`2cc83b12`](https://github.com/keystonejs/keystone/commit/2cc83b12be757019ba25658139478e8f5b2b19c6) [#1988](https://github.com/keystonejs/keystone/pull/1988) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added an `isOrderable` option to field implementation that controls whether the field is sortable in the AdminUI. Defaults to false and is set to true by sortable field types.

  The `parseFieldAccess` method can now also be overwritten in the field implementation class.

* [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64) [#1978](https://github.com/keystonejs/keystone/pull/1978) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added a new field type `Virtual`. This allows creation of fields that return data computed from other field values or outside Keystone.

### Patch Changes

- [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866) [#1995](https://github.com/keystonejs/keystone/pull/1995) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `react` and `react-dom` to 16.12.0.

* [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071) [#2047](https://github.com/keystonejs/keystone/pull/2047) Thanks [@Vultraz](https://github.com/Vultraz)! - Cleaned up duplicate code in aux list creation.

- [`a1dcbd7b`](https://github.com/keystonejs/keystone/commit/a1dcbd7bd7448fdcacbfe9fb0196bfee3c4a5326) [#2022](https://github.com/keystonejs/keystone/pull/2022) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed minor error message typos.
- Updated dependencies [[`5a5905d0`](https://github.com/keystonejs/keystone/commit/5a5905d07c29d6c49dffcc93a576cb2c599c4a65), [`8188d76c`](https://github.com/keystonejs/keystone/commit/8188d76cb3f5d3e112ef95fd4e1887db9a520d9d), [`0acdae17`](https://github.com/keystonejs/keystone/commit/0acdae17c4b2bcb234a314ad1aba311981affc8f), [`44b2bc93`](https://github.com/keystonejs/keystone/commit/44b2bc938fd508ac75f6a9cbb364006b9f122711), [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866), [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f), [`860dabec`](https://github.com/keystonejs/keystone/commit/860dabecacdf81aa1563cea9a5d50add8623dac1), [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071), [`2a52b3ce`](https://github.com/keystonejs/keystone/commit/2a52b3ce48e0df9589f4958c4d79e2b19aa1c134), [`95372949`](https://github.com/keystonejs/keystone/commit/953729498fd0c7f68c82f6d4e438808777887d36), [`a3fdc50e`](https://github.com/keystonejs/keystone/commit/a3fdc50ebb61b38814816804b04d7cb4bc0fc70a), [`721472e1`](https://github.com/keystonejs/keystone/commit/721472e1801584be5807d6637c646b1755366d3e), [`af635bc5`](https://github.com/keystonejs/keystone/commit/af635bc5684f9cf044170bea79dc31055fd275e9), [`da62aa4a`](https://github.com/keystonejs/keystone/commit/da62aa4a0af9cf27fd59fdcfb6b960e24999254d)]:
  - @keystonejs/field-content@5.1.0
  - @keystonejs/adapter-knex@6.0.0
  - @arch-ui/alert@0.0.9
  - @arch-ui/button@0.0.11
  - @arch-ui/controls@0.1.1
  - @arch-ui/day-picker@0.0.15
  - @arch-ui/drawer@0.0.12
  - @arch-ui/fields@2.0.3
  - @arch-ui/filters@0.0.13
  - @arch-ui/icons@0.0.6
  - @arch-ui/input@0.1.2
  - @arch-ui/layout@0.2.6
  - @arch-ui/loading@0.0.10
  - @arch-ui/lozenge@0.0.9
  - @arch-ui/options@0.0.11
  - @arch-ui/popout@0.0.10
  - @arch-ui/select@0.1.1
  - @arch-ui/tooltip@0.1.4
  - @arch-ui/typography@0.0.10
  - @keystonejs/build-field-types@5.1.2
  - @keystonejs/adapter-mongoose@5.1.3
  - @keystonejs/test-utils@5.0.2

## 5.2.0

### Minor Changes

- [`1a723a54`](https://github.com/keystonejs/keystone/commit/1a723a544a918457a9de241a8387f2ce5b555e50) [#1880](https://github.com/keystonejs/keystone/pull/1880) Thanks [@gautamsi](https://github.com/gautamsi)! - Replaced `RelationShip` field's implementation of `CreateItemModel` with a prop provided by `admin-ui`

  Exported following components from `admin-ui` which can be used outside of `admin-ui` to have same look and feel when working with Lists. One simple use is in custom pages where this can be customized differently than core list pages

  - `List`
  - `ListData`
  - `ListLayout`
  - `ListManage`
  - `FieldSelect`
  - `Search`
  - `ActiveFilters`
  - `Pagination`
  - `CreateItemModal`
  - `DeleteItemModal`
  - `DeleteManyItemsModal`
  - `ListTable`
  - `PageLoading`
  - `ToastContainer`
  - `UpdateManyItemsModal`
  - `Popout`

### Patch Changes

- [`ddfc7845`](https://github.com/keystonejs/keystone/commit/ddfc7845399e5108f7fd68169153983122554e96) [#1934](https://github.com/keystonejs/keystone/pull/1934) Thanks [@Vultraz](https://github.com/Vultraz)! - Removed stray Content field implementation (it's now in the field-content package)
- Updated dependencies [[`946eb315`](https://github.com/keystonejs/keystone/commit/946eb3157a1cc4946fe9e2c2b1101edf4918ab86), [`ddbf1063`](https://github.com/keystonejs/keystone/commit/ddbf10630530c7c7c9e388c6b047b2cbac96dab9)]:
  - @keystonejs/build-field-types@5.1.1

## 5.1.0

### Minor Changes

- [`20632bca`](https://github.com/keystonejs/keystone/commit/20632bca495058f2845d36fe95650eede0a9ebdc) [#1875](https://github.com/keystonejs/keystone/pull/1875) Thanks [@jordanoverbye](https://github.com/jordanoverbye)! - Added a default `getFilterTypes` method to `FieldController`.

* [`3138013c`](https://github.com/keystonejs/keystone/commit/3138013c49205bd7f9b05833ae6158ebeb281dc0) [#1913](https://github.com/keystonejs/keystone/pull/1913) Thanks [@jordanoverbye](https://github.com/jordanoverbye)! - Improved a11y for the `Checkbox` field.

### Patch Changes

- [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad) [#1819](https://github.com/keystonejs/keystone/pull/1819) Thanks [@w01fgang](https://github.com/w01fgang)! - Upgraded `flow` and fixed flow errors and (probably) bugs.

* [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad) [#1819](https://github.com/keystonejs/keystone/pull/1819) Thanks [@w01fgang](https://github.com/w01fgang)! - Upgraded `@emotion/core` and `@emotion/styled`.

- [`5595e4c4`](https://github.com/keystonejs/keystone/commit/5595e4c45c618fa7e13a3d91e3ea3892b4f10475) [#1808](https://github.com/keystonejs/keystone/pull/1808) Thanks [@gautamsi](https://github.com/gautamsi)! - Upgraded `react-apollo` and replaced use of `react-apollo-hooks` with `react-apollo`. `react-apollo` has a similar hooks API to `react-apollo-hooks`.
- Updated dependencies [[`8735393e`](https://github.com/keystonejs/keystone/commit/8735393ec7b01dd0491700244e915b4b47c1cc53), [`b68b74f3`](https://github.com/keystonejs/keystone/commit/b68b74f3e77ebd91711c72aac369ab2d5905cb36), [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad), [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad), [`3138013c`](https://github.com/keystonejs/keystone/commit/3138013c49205bd7f9b05833ae6158ebeb281dc0), [`0154f892`](https://github.com/keystonejs/keystone/commit/0154f892a1771b4f88b35f34a1ba47eaf1721dfe), [`ba8aef71`](https://github.com/keystonejs/keystone/commit/ba8aef71d1a04f643fb7f7590d7d6d136b1d4eba), [`b17b50c0`](https://github.com/keystonejs/keystone/commit/b17b50c0783dd246786aad1de41136967ad73b5c)]:
  - @keystonejs/build-field-types@5.0.1
  - @keystonejs/adapter-knex@5.1.0
  - @arch-ui/button@0.0.10
  - @arch-ui/controls@0.1.0
  - @arch-ui/day-picker@0.0.14
  - @arch-ui/drawer@0.0.11
  - @arch-ui/layout@0.2.5
  - @arch-ui/typography@0.0.9
  - @arch-ui/alert@0.0.8
  - @arch-ui/fields@2.0.2
  - @arch-ui/filters@0.0.12
  - @arch-ui/input@0.1.1
  - @arch-ui/loading@0.0.9
  - @arch-ui/lozenge@0.0.8
  - @arch-ui/options@0.0.10
  - @arch-ui/popout@0.0.9
  - @arch-ui/tooltip@0.1.3
  - @keystonejs/field-content@5.0.1
  - @keystonejs/adapter-mongoose@5.1.1

## 5.0.2

### Patch Changes

- [`ebbcad70`](https://github.com/keystonejs/keystone/commit/ebbcad7042596a9c83c32c8e08dad50f9fcb59fd) [#1833](https://github.com/keystonejs/keystone/pull/1833) Thanks [@Vultraz](https://github.com/Vultraz)! - Added getFilename LocalFileAdapter config parameter to allow configuration of saved filename and saved original filename in database.

* [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f) [#1837](https://github.com/keystonejs/keystone/pull/1837) Thanks [@timleslie](https://github.com/timleslie)! - Updated mongo-related dependencies

* Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469), [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f)]:
  - @keystonejs/adapter-mongoose@5.1.0
  - @keystonejs/utils@5.1.0
  - @keystonejs/adapter-knex@5.0.1
  - @keystonejs/test-utils@5.0.1

## 5.0.1

### Patch Changes

- [`209b7078`](https://github.com/keystonejs/keystone/commit/209b7078c7fa4f4d87568c58cb6cb6ad8162fe46) [#1817](https://github.com/keystonejs/keystone/pull/1817) Thanks [@Vultraz](https://github.com/Vultraz)! - Doc updates and minor functionality improvements for file field/adapters

- Updated dependencies [[`3c19cddd`](https://github.com/keystonejs/keystone/commit/3c19cddd0b8b8d1e17385a01a813a9e84ec14bb5)]:
  - @keystonejs/adapter-mongoose@5.0.1

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/access-control@5.0.0
  - @keystonejs/adapter-knex@5.0.0
  - @keystonejs/adapter-mongoose@5.0.0
  - @keystonejs/build-field-types@5.0.0
  - @keystonejs/field-content@5.0.0
  - @keystonejs/test-utils@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/fields

## 15.0.0

### Major Changes

- [`effc1f63`](https://github.com/keystonejs/keystone/commit/effc1f639d5824720b7a9d82c2ee881d77acb901) [#1789](https://github.com/keystonejs/keystone/pull/1789) Thanks [@timleslie](https://github.com/timleslie)! - `Relationship.convertResolvedOperationsToFieldValue()` has been removed.

### Patch Changes

- Updated dependencies [[`768420f5`](https://github.com/keystonejs/keystone/commit/768420f567c244d57a4e2a3aaafe628ea9813d9d)]:
  - @keystone-alpha/adapter-knex@6.0.2
  - @keystone-alpha/adapter-mongoose@6.0.1
  - @keystone-alpha/field-content@3.1.4

## 14.0.0

### Major Changes

- [`6d7d0df0`](https://github.com/keystonejs/keystone/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9) [#1729](https://github.com/keystonejs/keystone/pull/1729) Thanks [@timleslie](https://github.com/timleslie)! - This change significantly changes how and when we populate `many`-relationships during queries and mutations.
  The behaviour of the GraphQL API has not changed, but queries should be more performant, particularly for items with many related items.
  The `existingItem` parameter in hooks will no longer have the `many`-relationship fields populated.
  `List.listQuery()` no longer populates `many` relationship fields.
  For most users there should not need to be any changes to code unless they are explicitly relying on a `many`-relationship field in a hook, in which case they will need to execute an explicit query to obtain the desired values.

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/adapter-knex@6.0.0
  - @keystone-alpha/adapter-mongoose@6.0.0
  - @keystone-alpha/test-utils@2.6.3
  - @keystone-alpha/field-content@3.1.3

## 13.1.0

### Minor Changes

- [464d7579](https://github.com/keystonejs/keystone/commit/464d7579): Add Location field

### Patch Changes

- [3a52447d](https://github.com/keystonejs/keystone/commit/3a52447d): Ensure updateMutation() is always called with a string ID when resolving backlinks.

- Updated dependencies [6c4df466](https://github.com/keystonejs/keystone/commit/6c4df466):
- Updated dependencies [464d7579](https://github.com/keystonejs/keystone/commit/464d7579):
  - @keystone-alpha/test-utils@2.6.2
  - @keystone-alpha/adapter-knex@5.0.0
  - @arch-ui/day-picker@0.0.13
  - @arch-ui/select@0.1.0

## 13.0.0

### Major Changes

- [4e6a574d](https://github.com/keystonejs/keystone/commit/4e6a574d): MongoRelationshipInterface.getRelationshipQueryCondition() has been removed.

- Updated dependencies [b96a3a58](https://github.com/keystonejs/keystone/commit/b96a3a58):
  - @keystone-alpha/test-utils@2.6.1
  - @keystone-alpha/adapter-mongoose@5.0.0

## 12.3.0

### Minor Changes

- [552e6fb6](https://github.com/keystonejs/keystone/commit/552e6fb6): Add support for schema cache hints

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 12.2.1

### Patch Changes

- [04aa6a08](https://github.com/keystonejs/keystone/commit/04aa6a08): Fix regression when parent list of a Content field had a `where` clause as its access control.

## 12.2.0

### Minor Changes

- [ee000a7f](https://github.com/keystonejs/keystone/commit/ee000a7f): Added alpha channel support to the `Color` field. NOTE: This introduces a backwards-compatible change in the format saved to the database. The old format was a 6-character hex string preceded by a `#`, eg; `#663399`. The new format is an `rgba` string, eg; `rgba(102, 51, 153, 1)`. Both formats are fully supported in CSS, and the `Color` field will correctly handle old values stored in the hex format.

## 12.1.0

### Minor Changes

- [f56ffdfd](https://github.com/keystonejs/keystone/commit/f56ffdfd): Apply access control to auxiliary lists

## 12.0.0

### Major Changes

- [9ade2b2d](https://github.com/keystonejs/keystone/commit/9ade2b2d): Add support for `access: { auth: ... }` which controls whether authentication queries and mutations are accessible on a List

  If you have a `List` which is being used as the target of an Authentication Strategy, you should set `access: { auth: true }` on that list.

### Minor Changes

- [e5ad5ef1](https://github.com/keystonejs/keystone/commit/e5ad5ef1): Only generate relationship update types when needed

### Patch Changes

- [c681f476](https://github.com/keystonejs/keystone/commit/c681f476): Fix test flake

- Updated dependencies [7689753c](https://github.com/keystonejs/keystone/commit/7689753c):
  - @arch-ui/controls@0.0.10
  - @arch-ui/day-picker@0.0.12
  - @keystone-alpha/field-content@3.0.1
  - @arch-ui/filters@0.0.11
  - @arch-ui/input@0.1.0

## 11.0.0

### Major Changes

- [89c0d7e9](https://github.com/keystonejs/keystone/commit/89c0d7e9): The `.access` property of Fields is now keyed by `schemaName`. As such, a number of getters have been replaced with methods which take `{ schemaName }`.

  - `get gqlOutputFields()` -> `gqlOutputFields({ schemaName })`
  - `get gqlOutputFieldResolvers()` -> `gqlOutputFieldResolvers({ schemaName })`
  - `get gqlAuxFieldResolvers() -> gqlAuxFieldResolvers({ schemaName })`
  - `get gqlAuxQueryResolvers()` -> `gqlAuxQueryResolvers({ schemaName })`
  - `get gqlAuxMutationResolvers()` -> `gqlAuxMutationResolvers({ schemaName })`
  - `get gqlQueryInputFields()` -> `gqlQueryInputFields({ schemaName })`

- [a8e9378d](https://github.com/keystonejs/keystone/commit/a8e9378d): `Keystone`, `List` and `Field` constructors now take `schemaNames` as config options. A number of methods also now take `schemaName` parameters.
  - `keystone.getTypeDefs()` -> `keystone.getTypeDefs({ schemaName })`
  - `keystone.getAdminSchema()` -> `keystone.getAdminSchema({ schemaName })`
  - `keystone.dumpSchema(file)` -> `keystone.dumpSchema(file, schemaName)`
  - `keystone.getAdminMeta()` -> `keystone.getAdminMeta({ schemaName })`
  - `list.getAdminMeta()` -> `list.getAdminMeta({ schemaName })`
  - `field.getAdminMeta()` -> `field.getAdminMeta({ schemaName })`

### Patch Changes

- [bc0b9813](https://github.com/keystonejs/keystone/commit/bc0b9813): `parseListAccess` and `parseFieldAccess` now take `schemaNames` as an argument, and return a nested access object, with the `schemaNames` as keys.

  For example,

  ```js
  parseListAccess({ defaultAccess: false, access: { public: true }, schemaNames: ['public', 'private'] }
  ```

  will return

  ```js
  {
    public: { create: true, read: true, update: true, delete: true },
    private: { create: false, read: false, update: false, delete: false },
  }
  ```

  These changes are backwards compatible with regard to the `access` argument, so

  ```js
  const access = { create: true, read: true, update: true, delete: true };
  parseListAccess({ access, schemaNames: ['public', 'private'] }
  ```

  will return

  ```js
  {
    public: { create: true, read: true, update: true, delete: true },
    private: { create: true, read: true, update: true, delete: true },
  }
  ```

## 10.7.2

### Patch Changes

- [99dc6cae](https://github.com/keystonejs/keystone/commit/99dc6cae): Revert usage of Apollo Hooks

## 10.7.1

### Patch Changes

- [d9bd327e](https://github.com/keystonejs/keystone/commit/d9bd327e): Embed fields should handle receiving null or '' when being unset

## 10.7.0

### Minor Changes

- [79e362c0](https://github.com/keystonejs/keystone/commit/79e362c0): upgrade react-apollo and use hooks instead of Query and Mutation components

## 10.6.2

### Patch Changes

- [4ab3cc38](https://github.com/keystonejs/keystone/commit/4ab3cc38): OEmbed & Unsplash types no longer lose their value on update.

## 10.6.1

### Patch Changes

- [9c1b1886](https://github.com/keystonejs/keystone/commit/9c1b1886): CloudinaryImage & File fields no longer lose their value during update mutations

## 10.6.0

### Minor Changes

- [f7ba8a35](https://github.com/keystonejs/keystone/commit/f7ba8a35): Prefill nested creates for Relationship fields with back referennces

## 10.5.0

### Minor Changes

- [33ed590e](https://github.com/keystonejs/keystone/commit/33ed590e): Respect static field-level access control in the Admin UI

## 10.4.0

### Minor Changes

- [da65e1a0](https://github.com/keystonejs/keystone/commit/da65e1a0): Allow display and filtering of 'Id' column in Admin UI

## 10.3.0

### Minor Changes

- [a640471a](https://github.com/keystonejs/keystone/commit/a640471a): - Add `Slug.alwaysMakeUnique` option to force calling `makeUnique` even when initially generated slug may already be unique to prevent accidental data leak.
  - Fix a bug where items restricted via access control weren't considered when testing a `Slug` for uniqueness.

## 10.2.0

### Minor Changes

- [e049cfcb](https://github.com/keystonejs/keystone/commit/e049cfcb): Support defaultValue as a function at mutation execution time
- [e049cfcb](https://github.com/keystonejs/keystone/commit/e049cfcb): Support defaultValue as a function in view Controllers

### Patch Changes

- [fc437e06](https://github.com/keystonejs/keystone/commit/fc437e06): Blocks correctly handle case when no mutations are present for their block in a Content field.
- [957a40d9](https://github.com/keystonejs/keystone/commit/957a40d9): Upgrade react-select

- Updated dependencies [144e6e86](https://github.com/keystonejs/keystone/commit/144e6e86):
- Updated dependencies [fc437e06](https://github.com/keystonejs/keystone/commit/fc437e06):
  - @keystone-alpha/test-utils@2.2.1
  - @keystone-alpha/adapter-knex@4.0.0
  - @keystone-alpha/adapter-mongoose@4.0.0
  - @arch-ui/drawer@0.0.10

## 10.1.0

### Minor Changes

- [d7819a55](https://github.com/keystonejs/keystone/commit/d7819a55): Add a Slug field type for auto-generating slugs based on other fields.

### Patch Changes

- [653aa0e2](https://github.com/keystonejs/keystone/commit/653aa0e2): Remove incorrect Cell view config from Slug field
- [9c3b7436](https://github.com/keystonejs/keystone/commit/9c3b7436): Ensure searchUnsplash mutation returns results with a non-null id

## 10.0.0

### Major Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Adding `precision` and `scale` as `knexOptions` for the `Decimal` field type
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Adding isIndexed field config and support for in most field types
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Check for the number type in label resolver to prevent false positive on zero.

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade emotion to 10.0.14
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade prettier to 1.18.2
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Fixing issue with the Select fields on Knex; options not being applied correctly
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade to mongoose 5.6.5
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Fixing application of some field config on knex
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade graphql to 14.4.2
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Ensure the CloudinaryImage Content Block correctly updates the nested Slate.js image Node data instead of overwiting it which could cause issues for the image renderer expecting an Immutable Map, but receiving a plain Object.

## 9.1.0

### Minor Changes

- [18064167](https://github.com/keystonejs/keystone/commit/18064167):

  Adding `knexOptions` to the KnexFieldAdapter to support DB-level config for nullability (`isNotNullable`) and defaults (`defaultTo`)

### Patch Changes

- [4007f5dd](https://github.com/keystonejs/keystone/commit/4007f5dd):

  Adding field instance to the BaseFieldAdapter constructor arguments

## 9.0.0

### Major Changes

- [2b094b7f](https://github.com/keystonejs/keystone/commit/2b094b7f):

  Refactoring the knex adapter (and field adapters) to give the field type more control of the table schema (add 0 or multiple columns, etc)

## 8.1.0

### Minor Changes

- [e945926c](https://github.com/keystonejs/keystone/commit/e945926c):

  Adding Uuid field type with Mongoose and Knex adapters

### Patch Changes

- [ac7934fe](https://github.com/keystonejs/keystone/commit/ac7934fe):

  CloudinaryImage, Unsplash, and OEmbed blocks will correctly re-connect to existing block data if present rather than disconnecting and reconnecting on every save of the Content editor.

* Updated dependencies [ac7934fe](https://github.com/keystonejs/keystone/commit/ac7934fe):
  - @keystone-alpha/field-content@2.0.0

## 8.0.0

### Major Changes

- [b6a9f6b9](https://github.com/keystonejs/keystone/commit/b6a9f6b9):

  Extract `Content` field into its own package: `@keystone-alpha/field-content`.

### Patch Changes

- [98bef287](https://github.com/keystonejs/keystone/commit/98bef287):

  Fix the Relationship field type not allowing relationships to be removed from the Admin UI

## 7.2.0

### Minor Changes

- [c5c46545](https://github.com/keystonejs/keystone/commit/c5c46545):

  Add `searchUnsplash` GraphQL query when using the `Unsplash` field type

### Patch Changes

- [148400dc](https://github.com/keystonejs/keystone/commit/148400dc):

  Using `connect: []` and `create: []` in many-relationship queries now behaves as expected.

* [384135b1](https://github.com/keystonejs/keystone/commit/384135b1):

  Minor bump of bcrypt version

## 7.1.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):

  Add oEmbed Content Block with adapter-specific renderers.

- [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):

  Add an Unsplash Image type which fetches data from the Unsplash API

- [8799190e](https://github.com/keystonejs/keystone/commit/8799190e):

  Expose `options.adminMeta` to Content Blocks.

- [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):

  Add an Unsplash Image Block for the Content field which takes an Unsplash Image ID and displays the image within the Content field.

### Patch Changes

- [8799190e](https://github.com/keystonejs/keystone/commit/8799190e):

  Correctly use `options.adminMeta.readViews()` to load OEmbed Block views.

* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):
* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):
  - @arch-ui/fields@2.0.0
  - @arch-ui/controls@0.0.8
  - @arch-ui/day-picker@0.0.9
  - @arch-ui/filters@0.0.9
  - @arch-ui/input@0.0.8

## 7.0.1

### Patch Changes

- [c3daef1a](https://github.com/keystonejs/keystone/commit/c3daef1a):

  Correctly guard against undefined serverErrors in RelationshipSelect

## 7.0.0

### Major Changes

- [30c1b1e1](https://github.com/keystonejs/keystone/commit/30c1b1e1):

  - Expose a new method on field Controllers: `field#validateInput()`.
    - ```javascript
      /**
       * Perform client-side data validations before performing a
       * mutation. Any errors or warnings raised will abort the mutation and
       * re-render the `Field` view with a new `error` prop.
       *
       * This method is only called on fields whos `.hasChanged()` property returns
       * truthy.
       *
       * If only warnings are raised, the Admin UI will allow the user to confirm
       * they wish to continue anyway. If they continue, and no values have changed
       * since the last validation, validateInput will be called again, however any
       * warnings raised will be ignored and the mutation will proceed as normal.
       * This method is called after `serialize`.
       *
       * @param {Object} options
       * @param {Object} options.resolvedData The data object that would be sent to
       * the server. This data has previously been fed through .serialize()
       * @param {Object} options.originalInput The data as set by the `Field`
       * component. This data has _not_ been previously fed through .serialize().
       * @param {addFieldWarningOrError} options.addFieldValidationError
       * @param {addFieldWarningOrError} options.addFieldValidationWarning
       * @return undefined
       */
      validateInput = ({
        resolvedData,
        originalInput,
        addFieldValidationError,
        addFieldValidationWarning,
      }) => {
        // Call addFieldValidationError / addFieldValidationWarning here
      };
      ```
  - `Password` field is now using `validateInput()` which enforces `isRequired`
    and `minLength` checks in the Admin UI.

### Minor Changes

- [5c28c142](https://github.com/keystonejs/keystone/commit/5c28c142):

  - Add `OEmbed` field

    ```javascript
    const { Keystone } = require('@keystone-alpha/keystone');
    const { OEmbed } = require('@keystone-alpha/fields');
    const { IframelyOEmbedAdapter } = require('@keystone-alpha/oembed-adapters');

    const keystone = new Keystone(/* ... */);

    const iframelyAdapter = new IframelyOEmbedAdapter({
      apiKey: '...', // Get one from https://iframely.com
    });

    keystone.createList('User', {
      fields: {
        portfolio: {
          type: OEmbed,
          adapter: iframelyAdapter,
        },
      },
    });
    ```

### Patch Changes

- [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):

  - Correctly read auth strategy info for displaying the "setCurrentUser" toggle on Relationship fields in the Admin UI

- [3958a9c7](https://github.com/keystonejs/keystone/commit/3958a9c7):

  Fields configured with isRequired now behave as expected on create and update, returning a validation error if they are null.

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [16befb6a](https://github.com/keystonejs/keystone/commit/16befb6a):
  - @arch-ui/fields@1.0.0

## 6.2.2

### Patch Changes

- [25f9ad7e](https://github.com/keystonejs/keystone/commit/25f9ad7e):

  Compile Controller base class to ES5 so that non-native classes can extend it

## 6.2.1

### Patch Changes

- [07692ee7](https://github.com/keystonejs/keystone/commit/07692ee7):

  Fix item details updating failures when Access Control enabled on a field, but that field is not edited (ie; we were sending unedited data to the mutation which would (correctly) fail).

## 6.2.0

### Minor Changes

- [c5a1d301](https://github.com/keystonejs/keystone/commit/c5a1d301):

  - CloudinaryImage single image block correctly loads and displays saved image
  - AdminUI deserialises fields JIT before rendering

## 6.1.1

### Patch Changes

- [d580c298](https://github.com/keystonejs/keystone/commit/d580c298):

  Minor Admin UI Tweaks

* Updated dependencies [71766bd8](https://github.com/keystonejs/keystone/commit/71766bd8):
* Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone/commit/9a0456ff):
  - @arch-ui/day-picker@0.0.7
  - @keystone-alpha/test-utils@2.0.2
  - @keystone-alpha/adapter-mongoose@2.0.0

## 6.1.0

### Minor Changes

- [29728d5e](https://github.com/keystonejs/keystone/commit/29728d5e):

  Allow blocks to pick data sent to the adminUI via extendAdminMeta()

### Patch Changes

- [e502af66](https://github.com/keystonejs/keystone/commit/e502af66):

  Fix dist directories not being cleared before builds causing broken builds with build-field-types

## 6.0.0

### Major Changes

- [9dbed649](https://github.com/keystonejs/keystone/commit/9dbed649):

  Explicit field config options are no longer available on `field.config` for field Implementaiton objects.

- [119448fc](https://github.com/keystonejs/keystone/commit/119448fc):

  - Field view Controllers: Rename `.getValue()` to `.serialize()` and add `.deserialize()` to enable handling pre-save to server & post-read from server respectively.

- [1a7b706c](https://github.com/keystonejs/keystone/commit/1a7b706c):

  - Use build-field-types

- [bd0ea21f](https://github.com/keystonejs/keystone/commit/bd0ea21f):

  - `{ mongooseOptions: { isRequired: true } }` should be replaced by `{ isRequired: true }`

- [119448fc](https://github.com/keystonejs/keystone/commit/119448fc):

  - Field view Controllers: Rename `.getIntialData()` to `.getDefaultValue()` to better reflect the purpose of the function.

### Minor Changes

- [81b481d0](https://github.com/keystonejs/keystone/commit/81b481d0):

  - Added support for isMultiline to Text field type

- [c9102446](https://github.com/keystonejs/keystone/commit/c9102446):

  - Add a mechanism for loading multiple Suspense-aware components in parallel

### Patch Changes

- [ebb858a5](https://github.com/keystonejs/keystone/commit/ebb858a5):

  - Optimistically open Nested Create Item Modal and show loading spinner

- [81dc0be5](https://github.com/keystonejs/keystone/commit/81dc0be5):

  - Update dependencies

- [a4c66012](https://github.com/keystonejs/keystone/commit/a4c66012):

  - Use `.path` rather than `.config.path` in Controllers

- [3aeabc5e](https://github.com/keystonejs/keystone/commit/3aeabc5e):

  - Refactor Content Type to extend Relationship Type to simplify implementation and enable future enhancements

- [b8fc0a22](https://github.com/keystonejs/keystone/commit/b8fc0a22):

  - Update dependency

* Updated dependencies [e6e95173](https://github.com/keystonejs/keystone/commit/e6e95173):
* Updated dependencies [a03fd601](https://github.com/keystonejs/keystone/commit/a03fd601):
* Updated dependencies [5f1a5cf3](https://github.com/keystonejs/keystone/commit/5f1a5cf3):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone/commit/1a7b706c):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone/commit/b7a2ea9c):
* Updated dependencies [5f1a5cf3](https://github.com/keystonejs/keystone/commit/5f1a5cf3):
  - @keystone-alpha/build-field-types@1.0.0
  - @arch-ui/drawer@0.0.6
  - @arch-ui/tooltip@0.0.6
  - @arch-ui/popout@0.0.6
  - @keystone-alpha/access-control@1.0.4
  - @keystone-alpha/adapter-knex@1.0.7
  - @keystone-alpha/adapter-mongoose@1.0.7
  - @keystone-alpha/utils@3.0.0

## 5.0.0

- [patch][5c36ea0b](https://github.com/keystonejs/keystone/commit/5c36ea0b):

  - Content Field no longer throws when no blocks specified or server data is corrupt

- [patch][ec76b500](https://github.com/keystonejs/keystone/commit/ec76b500):

  - Initialise Block Constructors inside Field Controller

- [major][ec76b500](https://github.com/keystonejs/keystone/commit/ec76b500):

  - Rename Content Editor field to document for slate.js consistency

- [major][85b74a2c](https://github.com/keystonejs/keystone/commit/85b74a2c):

  - Expose result of running relationship operations (create/connect/disconnect)

- [patch][e75c105c](https://github.com/keystonejs/keystone/commit/e75c105c):

  - admin revamp

- [patch][d145fcb9](https://github.com/keystonejs/keystone/commit/d145fcb9):

  - Correctly return null to the Admin UI for to-single relationship fields which don't have any ID set

- [patch][ec76b500](https://github.com/keystonejs/keystone/commit/ec76b500):

  - Ensure Content Block views are always loaded even when not imported

## 4.0.0

- [patch][7b8d254d](https://github.com/keystonejs/keystone/commit/7b8d254d):

  - Update external dependencies

- [major][37dcee37](https://github.com/keystonejs/keystone/commit/37dcee37):

  - Generate cjs and esm bundlers for Controller file

- [patch][302930a4](https://github.com/keystonejs/keystone/commit/302930a4):

  - Minor internal code cleanups

- [patch][21be780b](https://github.com/keystonejs/keystone/commit/21be780b):

  - Use updated test-utils APIs

- Updated dependencies [545c9464](https://github.com/keystonejs/keystone/commit/545c9464):
- Updated dependencies [24bed583](https://github.com/keystonejs/keystone/commit/24bed583):
- Updated dependencies [21be780b](https://github.com/keystonejs/keystone/commit/21be780b):
  - @arch-ui/drawer@0.0.4
  - @arch-ui/button@0.0.4
  - @keystone-alpha/test-utils@2.0.0

## 3.0.2

- [patch][03ea2b1d](https://github.com/keystonejs/keystone/commit/03ea2b1d):

  - Bump version of @arch-ui/layout

## 3.0.1

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone/commit/98c02a46):
  - @keystone-alpha/access-control@1.0.2
  - @keystone-alpha/adapter-knex@1.0.3
  - @keystone-alpha/adapter-mongoose@1.0.3
  - @keystone-alpha/utils@2.0.0

## 3.0.0

- [patch][39067f44](https://github.com/keystonejs/keystone/commit/39067f44):

  - Add text date and time pickers

- [major][9a9f214a](https://github.com/keystonejs/keystone/commit/9a9f214a):

  - Build field type views before publishing to npm and stop running Babel on Keystone packages in node_modules in the Admin UI

## 2.0.0

- [major][dcb93771](https://github.com/keystonejs/keystone/commit/dcb93771):

  - Put field type views onto field controllers

- [patch][11c372fa](https://github.com/keystonejs/keystone/commit/11c372fa):

  - Update minor-level dependencies

- [patch][3a775092](https://github.com/keystonejs/keystone/commit/3a775092):

  - Update dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

- [patch][d9a1be91](https://github.com/keystonejs/keystone/commit/d9a1be91):

  - Update dependencies

- [patch][7417ea3a](https://github.com/keystonejs/keystone/commit/7417ea3a):

  - Update patch-level dependencies

- Updated dependencies [96015257](https://github.com/keystonejs/keystone/commit/96015257):
  - @arch-ui/day-picker@0.0.3

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone/commit/9534f98f):

  - Add README.md to package

- [patch][c0e64c01](https://github.com/keystonejs/keystone/commit/c0e64c01):

  - Move system tests into api-tests package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/fields

## 3.1.0

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [minor] eaab547c:

  - Allow adding related items from the Relationship field

- [patch] b155d942:

  - Update mongo/mongoose dependencies

- [patch] d035c199:

  - Re-enable check for bcrypt regex in <password>\_is_set

- Updated dependencies [23c3fee5]:
  - @arch-ui/button@0.0.2
  - @arch-ui/controls@0.0.2
  - @arch-ui/day-picker@0.0.2
  - @arch-ui/drawer@0.0.2
  - @arch-ui/fields@0.0.2
  - @arch-ui/filters@0.0.2
  - @arch-ui/icons@0.0.2
  - @arch-ui/input@0.0.2
  - @arch-ui/layout@0.0.2
  - @arch-ui/lozenge@0.0.2
  - @arch-ui/options@0.0.2
  - @arch-ui/popout@0.0.2
  - @arch-ui/select@0.0.2
  - @arch-ui/theme@0.0.2
  - @arch-ui/tooltip@0.0.2
  - @arch-ui/typography@0.0.2

## 3.0.0

- [patch] 513c7b63:

  - Rename MongoSelectInterface to MongoRelationshipInterface in the relationship field type

- [minor] 5f891cff:

  - Add a setupHooks method to BaseFieldAdapter

- [patch] 723371a0:

  - Correctly surface nested errors from GraphQL

- [major] 53e27d75:

  - Removes methods from Mongoose adapter classes: getFieldAdapterByQueryConditionKey, getSimpleQueryConditions, getRelationshipQueryConditions, getQueryConditions, getRelationshipQueryConditions, getRefListAdapter, hasQueryCondition.

- [minor] 4faf5cfd:

  - Add withMeta flag to Relationship field for disabling meta queries

- [patch] 306f0b7e:

  - Remove recalcHeight prop from Filter props

- [patch] 266b5733:

  - Don't try to resolve nested mutations which will be later backfilled

- [minor] dc53492c:

  - Add support for the Knex adapter

- [patch] 7ce811ab:

  - Converts mongoose ObjectIds to string in File field types

- [major] 5f8043b5:

  - Simplify Field component api
    - Replace item prop with value prop which is equal to item[field.path]
    - Replace itemErrors prop with error prop which is equal to itemErrors[field.path]
    - Change onChange prop so that it only accepts the value rather than the field and the value
    - Remove initialData prop which wasn't used in a Field component and was only pass to the Field components in one the places where the Field component is used

- [minor] f37a8086:

  - Can now dump the GraphQL schema with keystone.dumpSchema(filePath)

- [patch] 9f2ee393:

  - Add adapter parameter to setupServer() and add multiAdapterRunners()

- [patch] 860c3b80:

  - Add a postConnect method to list adapters to capture all the work which needs to be done after the database has been connected to

- Updated dependencies [aca26f71]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [48773907]:
- Updated dependencies [a3d5454d]:
  - @voussoir/access-control@0.4.1
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/test-utils@1.0.0
  - @voussoir/utils@1.0.0
  - @voussoir/adapter-knex@0.0.2

## 2.0.1

- [patch] 3aede2f5:

  - Make relationship select work for large lists

- [patch] c3dd4295:

  - Don't clobber DateTime fields during update mutation

- [patch] 8d8666ad:

  - Dependency upgrade: graphql -> 14.0.3, graphql-tools -> 4.0.3

## 2.0.0

- [patch] 21626b66:

  - preSave/postRead item hooks run consistently

- [patch] 8145619f:

  - update to selecting and managing items in the list view

- [minor] cd885800:

  - Update the field hooks API to use the officially sanctioned hook names.

- [major] c83c9ed5:

  - Add Keystone.getAccessContext and remove List.getAccessControl, List.getFieldAccessControl, and Field.validateAccessControl.

- [patch] c3ebd9e6:

  - Update resolver code to make all list access checks explicit

- [patch] 8ab899dd:

  - Internal refactor of nested mutation handling for relationships

- [patch] 929b177c:

  - Enable sorting on DateTime fields

- [minor] 33843c9e:

  - Update the backlink queue API

- [major] 01718870:

  - Field configuration now tasks isRequired and isUnique, rather than required and unique

- [minor] 3801e040:

  - Separate out the pre-hooks for resolving relationship fields from the field.resolveInput hooks

- [patch] 023a5c72:

  - Enable setting DateTime to null

- [patch] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- [patch] 8fc0abb3:

  - Make DayPicker scrollable

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [ffc98ac4]:
  - @voussoir/access-control@0.4.0

## 1.4.0

- [minor] 3ae588b7:

  - Rename test*AccessControl functions to validate*AccessControl

- [patch] ff4b98c5:

  - Consolidate mongoose schema pre/post hooks for field types

- [patch] 45d4c379:

  - Update the functional API for Keystone List objects for consistency

- [minor] 589dbc02:

  - navigation improvements and paper cut fixes

- [minor] b0d19c24:

  - Use consistent query condition builders across all field types

- Updated dependencies [9c383fe8]:
  - @voussoir/adapter-mongoose@0.5.0
  - @voussoir/test-utils@0.1.2

## 1.3.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

- Updated dependencies [1d30a329"
  ]:
  - @voussoir/ui@0.4.0

## 1.2.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 1.1.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

## 1.0.1

- [patch] Avoid recreating indexes on every app boot (https://github.com/keystonejs/keystone/pull/459) [b84dd80](b84dd80)

## 1.0.0

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [major] `Text` fields now default to case sensitive filtering. Insensitive filters available via the `_i` suffix (eg. `name: "Jane"` -vs- `name_i: "jane"`). This replaces the `${path}_case_sensitive` boolean that could previously be specified when using `Text` field filters. This is all covered in more detail in #359. [445b699](445b699)
- [minor] Support unique field constraint for mongoose adapter [750a83e](750a83e)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/access-control@0.1.3
  - @voussoir/adapter-mongoose@0.3.0
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
