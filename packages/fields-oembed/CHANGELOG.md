# @keystonejs/fields-oembed

## 2.0.0

### Major Changes

- [`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593) [#3394](https://github.com/keystonejs/keystone/pull/3394) Thanks [@timleslie](https://github.com/timleslie)! - Converted `Field` getters `.gqlUpdateInputFields` and `.gqlCreateInputFields` into methods, `.gqlUpdateInputFields({ schemaName })` and `...gqlCreateInputFields({ schemaName })`.

### Patch Changes

- Updated dependencies [[`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593), [`e8b2e4772`](https://github.com/keystonejs/keystone/commit/e8b2e477206acffb143f19fb14be1e3b4cd0eb91)]:
  - @keystonejs/fields@17.0.0
  - @keystonejs/adapter-knex@11.0.2
  - @keystonejs/adapter-mongoose@9.0.3
  - @keystonejs/fields-content@8.0.1

## 1.0.0

### Major Changes

- [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25) [#3280](https://github.com/keystonejs/keystone/pull/3280) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Initial release

### Minor Changes

- [`b663e7f1e`](https://github.com/keystonejs/keystone/commit/b663e7f1ea61c3e9cebb7fe661e4d77e154de6dd) [#3248](https://github.com/keystonejs/keystone/pull/3248) Thanks [@Abogical](https://github.com/Abogical)! - Added a `parameters` config option that allows setting additional request parameters to the url.

  See: https://iframely.com/docs/parameters

### Patch Changes

- Updated dependencies [[`d38a41f25`](https://github.com/keystonejs/keystone/commit/d38a41f25a1b4c90c05d2fb85116dc385d4ee77a), [`5ede731fc`](https://github.com/keystonejs/keystone/commit/5ede731fc58a79e7322b852bdd2d971ece45281e), [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25), [`694f3acfb`](https://github.com/keystonejs/keystone/commit/694f3acfb9faa78aebfcf48cf711165560f16ff7), [`149d6fd6f`](https://github.com/keystonejs/keystone/commit/149d6fd6ff057c17570346063c173376769dcc79), [`e44102e9f`](https://github.com/keystonejs/keystone/commit/e44102e9f7f770b1528d642d763ccf9f88f3cbb1)]:
  - @keystonejs/fields@16.0.0
  - @keystonejs/fields-content@8.0.0
