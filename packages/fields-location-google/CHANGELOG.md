# @keystonejs/fields-location-google

## 2.0.0

### Major Changes

- [`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593) [#3394](https://github.com/keystonejs/keystone/pull/3394) Thanks [@timleslie](https://github.com/timleslie)! - Converted `Field` getters `.gqlUpdateInputFields` and `.gqlCreateInputFields` into methods, `.gqlUpdateInputFields({ schemaName })` and `...gqlCreateInputFields({ schemaName })`.

### Patch Changes

- Updated dependencies [[`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593), [`e8b2e4772`](https://github.com/keystonejs/keystone/commit/e8b2e477206acffb143f19fb14be1e3b4cd0eb91)]:
  - @keystonejs/fields@17.0.0
  - @keystonejs/adapter-knex@11.0.2
  - @keystonejs/adapter-mongoose@9.0.3

## 1.0.1

### Patch Changes

- [`7e78ffdaa`](https://github.com/keystonejs/keystone/commit/7e78ffdaa96050e49e8e2678a3c4f1897fedae4f) [#3400](https://github.com/keystonejs/keystone/pull/3400) Thanks [@timleslie](https://github.com/timleslie)! - Restricted `mongoose` to the version range `~5.9.11` to avoid a [bug](https://github.com/keystonejs/keystone/issues/3397) in `5.10.0`.

* [`b300720eb`](https://github.com/keystonejs/keystone/commit/b300720eb4e079bc30efb17ed3b48ab71cadc160) [#3373](https://github.com/keystonejs/keystone/pull/3373) Thanks [@timleslie](https://github.com/timleslie)! - Removed internal global variables.

* Updated dependencies [[`9338f3739`](https://github.com/keystonejs/keystone/commit/9338f3739ecff5f626a713a06ce65c1e29888d25), [`3db2f3956`](https://github.com/keystonejs/keystone/commit/3db2f395688342fe9a1dda14be5ce8308c9c39a6), [`7e78ffdaa`](https://github.com/keystonejs/keystone/commit/7e78ffdaa96050e49e8e2678a3c4f1897fedae4f), [`7b0875723`](https://github.com/keystonejs/keystone/commit/7b0875723783780988f2dee4e5ee406a3b44ca98), [`0369985e3`](https://github.com/keystonejs/keystone/commit/0369985e320afd6112f2664f8a8edc1ed7167130), [`7422922f5`](https://github.com/keystonejs/keystone/commit/7422922f5649a2b52699f67a77645e9c91800688), [`df8f92a37`](https://github.com/keystonejs/keystone/commit/df8f92a378d2d787f5bee774f013767c09ec35cf), [`cc5bb8915`](https://github.com/keystonejs/keystone/commit/cc5bb891579281338ad7fad0873531be81d877d4), [`1b3943e4f`](https://github.com/keystonejs/keystone/commit/1b3943e4f66c61c446085736949c6b83e9087afb), [`b300720eb`](https://github.com/keystonejs/keystone/commit/b300720eb4e079bc30efb17ed3b48ab71cadc160)]:
  - @keystonejs/fields@16.1.0
  - @keystonejs/adapter-mongoose@9.0.2

## 1.0.0

### Major Changes

- [`5ede731fc`](https://github.com/keystonejs/keystone/commit/5ede731fc58a79e7322b852bdd2d971ece45281e) [#3305](https://github.com/keystonejs/keystone/pull/3305) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Moved the `Location` field from `@keystonejs/fields` to `@keystonejs/fields-location-google` and renamed to `LocationGoogle`. If you were using the `Location` field from `@keystonejs/fields`, please install `@keystonejs/fields-location-google` and import `LocationGoogle` from it.

### Patch Changes

- Updated dependencies [[`d38a41f25`](https://github.com/keystonejs/keystone/commit/d38a41f25a1b4c90c05d2fb85116dc385d4ee77a), [`5ede731fc`](https://github.com/keystonejs/keystone/commit/5ede731fc58a79e7322b852bdd2d971ece45281e), [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25), [`694f3acfb`](https://github.com/keystonejs/keystone/commit/694f3acfb9faa78aebfcf48cf711165560f16ff7), [`149d6fd6f`](https://github.com/keystonejs/keystone/commit/149d6fd6ff057c17570346063c173376769dcc79), [`e44102e9f`](https://github.com/keystonejs/keystone/commit/e44102e9f7f770b1528d642d763ccf9f88f3cbb1)]:
  - @keystonejs/fields@16.0.0
