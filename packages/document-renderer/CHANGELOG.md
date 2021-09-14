# @keystone-next/document-renderer

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
