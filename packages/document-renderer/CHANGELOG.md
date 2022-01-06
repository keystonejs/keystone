# @keystone-6/document-renderer

## 1.0.0

### Major Changes

- [#7028](https://github.com/keystonejs/keystone/pull/7028) [`3c7a581c1`](https://github.com/keystonejs/keystone/commit/3c7a581c1e53ae49c9f74509de3927ebf2703bde) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Released Keystone 6

# @keystone-next/document-renderer

## 5.0.0

### Major Changes

- [#6957](https://github.com/keystonejs/keystone/pull/6957) [`de8cf44e7`](https://github.com/keystonejs/keystone/commit/de8cf44e7b328ab98e1466d7191d9ee65a57b02a) Thanks [@bladey](https://github.com/bladey)! - Update Node engines to support current Node LTS versions, currently versions 14 and 16.

### Patch Changes

- [#6961](https://github.com/keystonejs/keystone/pull/6961) [`18e3168aa`](https://github.com/keystonejs/keystone/commit/18e3168aae5739f5596c7811cd30c8d1f47ad77a) Thanks [@datner](https://github.com/datner)! - Fixed default renderer of `layout` block

## 4.0.1

### Patch Changes

- [#6744](https://github.com/keystonejs/keystone/pull/6744) [`0ef1ee3cc`](https://github.com/keystonejs/keystone/commit/0ef1ee3ccd99f0f3e1f955f03d00b1a0f238c7cd) Thanks [@bladey](https://github.com/bladey)! - Renamed branch `master` to `main`.

* [#6754](https://github.com/keystonejs/keystone/pull/6754) [`bed3a560a`](https://github.com/keystonejs/keystone/commit/bed3a560a59d4fe787f3beebd65f8148453aae35) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated dist filenames

## 4.0.0

### Major Changes

- [#6040](https://github.com/keystonejs/keystone/pull/6040) [`890e3d0a5`](https://github.com/keystonejs/keystone/commit/890e3d0a500ecc30cc88946ba53438812b11b2a4) Thanks [@timleslie](https://github.com/timleslie)! - The value of `data` passed to the inline relationship renderer now matches the data returned by the GraphQL query.
  Falsey values of `data.label` are no longer set to `data.id` and falsey values of `data.data` are no longer set to `{}`.

### Patch Changes

- [#6087](https://github.com/keystonejs/keystone/pull/6087) [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951) Thanks [@JedWatson](https://github.com/JedWatson)! - Move source code from the `packages-next` to the `packages` directory.

* [#6036](https://github.com/keystonejs/keystone/pull/6036) [`093f9791b`](https://github.com/keystonejs/keystone/commit/093f9791bc37357b9700a9c49a7ae1102757bca5) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed the relationship name not being passed to the inline relationship renderer

## 3.0.0

### Major Changes

- [#5746](https://github.com/keystonejs/keystone/pull/5746) [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d) Thanks [@timleslie](https://github.com/timleslie)! - Update Node.js dependency to `^12.20 || >= 14.13`.

## 2.0.3

### Patch Changes

- [#5417](https://github.com/keystonejs/keystone/pull/5417) [`34e3b6309`](https://github.com/keystonejs/keystone/commit/34e3b6309e3eb8a7efe8469fe76e8ffd4417b244) Thanks [@alexmgrant](https://github.com/alexmgrant)! - Fixed `renderers` prop not being respected.

## 2.0.2

### Patch Changes

- [#5122](https://github.com/keystonejs/keystone/pull/5122) [`387e0cb6c`](https://github.com/keystonejs/keystone/commit/387e0cb6cecef7ee0539f6bb7be5709be868a590) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `DocumentRenderer` not rendering links

## 2.0.1

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

## 2.0.0

### Major Changes

- [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf) [#4622](https://github.com/keystonejs/keystone/pull/4622) Thanks [@renovate](https://github.com/apps/renovate)! - Updated react and react-dom to v17

### Minor Changes

- [`3968aa5d6`](https://github.com/keystonejs/keystone/commit/3968aa5d61c73ad589c1b7005b7b5db60dd26853) [#4821](https://github.com/keystonejs/keystone/pull/4821) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added renderer for relationship nodes

### Patch Changes

- [`a1266a199`](https://github.com/keystonejs/keystone/commit/a1266a199537e77684adaf0337716924b6c48aa8) [#4816](https://github.com/keystonejs/keystone/pull/4816) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed renderer prop to allow providing some of the renderers and exported `DocumentRendererProps` and `defaultRenderers`

## 1.0.0

### Major Changes

- [`2ed7ee700`](https://github.com/keystonejs/keystone/commit/2ed7ee70047c4c2bb6b855ec51a2fa58e4c7474d) [#4720](https://github.com/keystonejs/keystone/pull/4720) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release
