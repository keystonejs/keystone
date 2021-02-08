# @keystonejs/adapter-prisma

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
