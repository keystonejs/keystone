# @keystonejs/adapter-prisma

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
