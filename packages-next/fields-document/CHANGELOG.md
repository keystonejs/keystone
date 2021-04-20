# @keystone-next/fields-document

## 5.0.0

### Major Changes

- [#5420](https://github.com/keystonejs/keystone/pull/5420) [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2) Thanks [@timleslie](https://github.com/timleslie)! - Updated core fields implementation to expect an internal option `type.adapter` rather than `type.adapters.prisma`.

### Patch Changes

- [#5415](https://github.com/keystonejs/keystone/pull/5415) [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f) Thanks [@timleslie](https://github.com/timleslie)! - Converted internal JavaScript code to TypeScript.

* [#5442](https://github.com/keystonejs/keystone/pull/5442) [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db) Thanks [@timleslie](https://github.com/timleslie)! - Updated type definitions to be more consistent and correct.

- [#5372](https://github.com/keystonejs/keystone/pull/5372) [`43a0f5429`](https://github.com/keystonejs/keystone/commit/43a0f5429028eb9df53e93f19f2dd6fc328cde32) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed heading styles to be more differentiatable from normal text.

* [#5400](https://github.com/keystonejs/keystone/pull/5400) [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276) Thanks [@timleslie](https://github.com/timleslie)! - Moved the `Implementation` base class from the `fields-legacy` package into the `fields` package.

- [#5371](https://github.com/keystonejs/keystone/pull/5371) [`8eebf9195`](https://github.com/keystonejs/keystone/commit/8eebf9195ac625f6642c76ea145642f075e725fe) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed undo on shortcuts like `->` to `→` undoing the whole shortcut rather than just the replacement

- Updated dependencies [[`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124), [`f059f6349`](https://github.com/keystonejs/keystone/commit/f059f6349bee3dce8bbf4a0584b235e97872851c), [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`8ab2c9bb6`](https://github.com/keystonejs/keystone/commit/8ab2c9bb6633c2f85844e658f534582c30a39a57), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276), [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`89b869e8d`](https://github.com/keystonejs/keystone/commit/89b869e8d492151449f2146108767a7e5e5ecdfa), [`58a793988`](https://github.com/keystonejs/keystone/commit/58a7939888ec84d0f089d77ca1ce9d94ef0d9a85), [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853)]:
  - @keystone-next/admin-ui@14.0.0
  - @keystone-next/types@17.0.0
  - @keystone-next/fields@7.0.0
  - @keystone-next/adapter-prisma-legacy@6.0.0
  - @keystone-ui/button@4.0.0
  - @keystone-ui/fields@3.0.0
  - @keystone-ui/icons@3.0.0
  - @keystone-ui/popover@3.0.0
  - @keystone-ui/tooltip@3.0.0
  - @keystone-next/admin-ui-utils@4.0.0

## 4.0.0

### Major Changes

- [#5273](https://github.com/keystonejs/keystone/pull/5273) [`4fa66ac1f`](https://github.com/keystonejs/keystone/commit/4fa66ac1fc6fd0a43da17dd90797733e8c958785) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for the `knex` and `mongoose` field adapters.

### Patch Changes

- Updated dependencies [[`1261c398b`](https://github.com/keystonejs/keystone/commit/1261c398b94ffef2737226cceaebaed1b3c04c72), [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c), [`e702fea44`](https://github.com/keystonejs/keystone/commit/e702fea44c3116db158d97b5ffd24440f09c9d49), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3), [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8), [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`8665cfe66`](https://github.com/keystonejs/keystone/commit/8665cfe66016e0356681413e31f80a6d5586d364), [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c), [`fda82869c`](https://github.com/keystonejs/keystone/commit/fda82869c376d05fd007bec22d7bde2604db445b), [`4fa66ac1f`](https://github.com/keystonejs/keystone/commit/4fa66ac1fc6fd0a43da17dd90797733e8c958785), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b), [`5cd94b2a3`](https://github.com/keystonejs/keystone/commit/5cd94b2a32b3eddaf00ad77229f7e9664899c3b9), [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca), [`4f0abec0b`](https://github.com/keystonejs/keystone/commit/4f0abec0b19c3495c1ae6d7dac49fb46253cf7b3), [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3), [`bc21855a7`](https://github.com/keystonejs/keystone/commit/bc21855a7ff6dd4dbc278b3e15c9157de765e6ba), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b)]:
  - @keystone-next/adapter-prisma-legacy@5.0.0
  - @keystone-next/fields-legacy@25.0.0
  - @keystone-next/types@16.0.0
  - @keystone-next/admin-ui@13.0.0
  - @keystone-next/fields@6.0.0
  - @keystone-ui/fields@2.1.0
  - @keystone-next/admin-ui-utils@3.0.3

## 3.2.1

### Patch Changes

- [#5212](https://github.com/keystonejs/keystone/pull/5212) [`76e5c7bd3`](https://github.com/keystonejs/keystone/commit/76e5c7bd3d5e4b74b1b3b6b6d6c23d087e81bb21) Thanks [@timleslie](https://github.com/timleslie)! - Moved test fixtures into the new packages.

- Updated dependencies [[`0e01f471d`](https://github.com/keystonejs/keystone/commit/0e01f471dc669e46c88233cb8ce698749ddcf4fa), [`76e5c7bd3`](https://github.com/keystonejs/keystone/commit/76e5c7bd3d5e4b74b1b3b6b6d6c23d087e81bb21), [`ca1be4156`](https://github.com/keystonejs/keystone/commit/ca1be415663dd822b3adda1e073bd7a1d4a9b97b), [`da900777a`](https://github.com/keystonejs/keystone/commit/da900777a27264595a68fe1ed0e7a689944eb372), [`4d405390c`](https://github.com/keystonejs/keystone/commit/4d405390c0f8dcc37e6fe4da7ce3866c699088f3), [`34dd809ee`](https://github.com/keystonejs/keystone/commit/34dd809eef2368bba1e50ed613b36c5dac7262d1), [`a8be4c860`](https://github.com/keystonejs/keystone/commit/a8be4c8602bcda63d96fc956ead8568d8c989ffc), [`0e1487385`](https://github.com/keystonejs/keystone/commit/0e1487385c42556c027a6f7bfbc9aa806b3cbd66), [`aa76102c1`](https://github.com/keystonejs/keystone/commit/aa76102c11bdfea02059df66f406a8b1d387c879), [`f448a8b3a`](https://github.com/keystonejs/keystone/commit/f448a8b3a36b295d4ce5ff9ef2fd7aabcdb5dacc)]:
  - @keystone-next/fields@5.4.0
  - @keystone-next/fields-legacy@24.0.0
  - @keystone-next/types@15.0.1
  - @keystone-next/adapter-knex-legacy@13.2.3
  - @keystone-next/adapter-mongoose-legacy@11.1.3
  - @keystone-next/adapter-prisma-legacy@4.0.1

## 3.2.0

### Minor Changes

- [#5173](https://github.com/keystonejs/keystone/pull/5173) [`7debecb86`](https://github.com/keystonejs/keystone/commit/7debecb86ea41eed98da80324482bd1c63781005) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added support for SQLite with Prisma

### Patch Changes

- Updated dependencies [[`eae55db19`](https://github.com/keystonejs/keystone/commit/eae55db19b656e2bfa7b1e7d7aaf2f57b0a95299)]:
  - @keystone-next/fields-legacy@23.2.0
  - @keystone-next/admin-ui@12.0.1

## 3.1.0

### Minor Changes

- [#3946](https://github.com/keystonejs/keystone/pull/3946) [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05) Thanks [@timleslie](https://github.com/timleslie)! - Added experimental support for Prisma + SQLite as a database adapter.

### Patch Changes

- [#5150](https://github.com/keystonejs/keystone/pull/5150) [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed) Thanks [@timleslie](https://github.com/timleslie)! - Applied eslint `import/order` rule.

* [#5089](https://github.com/keystonejs/keystone/pull/5089) [`a4e34e9eb`](https://github.com/keystonejs/keystone/commit/a4e34e9ebb6f746f54ccd898d0aeb4dc5c5d9271) Thanks [@timleslie](https://github.com/timleslie)! - Updated `slate` dependencies.

* Updated dependencies [[`1eeac4722`](https://github.com/keystonejs/keystone/commit/1eeac4722da174307152dad9b5adf5062e4b6403), [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05), [`b3c4a756f`](https://github.com/keystonejs/keystone/commit/b3c4a756fd2028d1e29967392d37098419e54ec3), [`17c86e0c3`](https://github.com/keystonejs/keystone/commit/17c86e0c3eda7ba08d1bb8edf5eb8ddc9a819e5a), [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d), [`b84abebb6`](https://github.com/keystonejs/keystone/commit/b84abebb6c817172d04f338befa45b3573af55d6), [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed), [`ec6f9b601`](https://github.com/keystonejs/keystone/commit/ec6f9b601ea6fdbfb2335a5e81b7ec3f1b0e4d4d), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`e6b16d4e9`](https://github.com/keystonejs/keystone/commit/e6b16d4e9d95be8b3d3134931cf077b92a438806), [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`b3c4a756f`](https://github.com/keystonejs/keystone/commit/b3c4a756fd2028d1e29967392d37098419e54ec3), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`2ff93692a`](https://github.com/keystonejs/keystone/commit/2ff93692aaef70474449f30fb249eae8aa33a64a), [`40d4fff5d`](https://github.com/keystonejs/keystone/commit/40d4fff5d63850cbd513c80bcb5e551e5782dc4b), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02), [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91), [`543232c3f`](https://github.com/keystonejs/keystone/commit/543232c3f151f2294cf63e0944d1724b7b0ac33e)]:
  - @keystone-next/fields@5.3.0
  - @keystone-next/types@15.0.0
  - @keystone-next/adapter-prisma-legacy@4.0.0
  - @keystone-next/fields-legacy@23.1.0
  - @keystone-ui/fields@2.0.2
  - @keystone-ui/core@2.0.2
  - @keystone-next/admin-ui@12.0.0
  - @keystone-next/admin-ui-utils@3.0.2
  - @keystone-next/adapter-mongoose-legacy@11.1.2
  - @keystone-next/adapter-knex-legacy@13.2.2

## 3.0.1

### Patch Changes

- Updated dependencies [[`c45cbb9b1`](https://github.com/keystonejs/keystone/commit/c45cbb9b14010b3ced7ea012f3502998ba2ec393), [`a2c52848a`](https://github.com/keystonejs/keystone/commit/a2c52848a3a7b66a1968a430040887194e6138d1), [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761)]:
  - @keystone-next/fields-legacy@23.0.0
  - @keystone-next/admin-ui@11.0.0
  - @keystone-next/adapter-prisma-legacy@3.3.0
  - @keystone-next/adapter-knex-legacy@13.2.1
  - @keystone-next/adapter-mongoose-legacy@11.1.1
  - @keystone-next/fields@5.2.1

## 3.0.0

### Major Changes

- [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6) [#4836](https://github.com/keystonejs/keystone/pull/4836) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed `NotEditable` component from rendering a div to a span so it can be used for inline elements

### Minor Changes

- [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6) [#4836](https://github.com/keystonejs/keystone/pull/4836) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `fields.multiselect` prop field

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

* [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6) [#4836](https://github.com/keystonejs/keystone/pull/4836) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `fields.select` not passing options to the select

- [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6) [#4836](https://github.com/keystonejs/keystone/pull/4836) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed documentation in JSDocs for component blocks API

* [`d53eb872f`](https://github.com/keystonejs/keystone/commit/d53eb872ffb0396fcdcae34c380acf9739c8ca5d) [#4883](https://github.com/keystonejs/keystone/pull/4883) Thanks [@JedWatson](https://github.com/JedWatson)! - Allowed the document field toolbar to wrap on smaller screens

* Updated dependencies [[`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7), [`f32316e6d`](https://github.com/keystonejs/keystone/commit/f32316e6deafdb9001874b08e3f4203250728676), [`1c5a39972`](https://github.com/keystonejs/keystone/commit/1c5a39972759a0aad49aed2c4b19e2c70a993a8a), [`687fd5ef0`](https://github.com/keystonejs/keystone/commit/687fd5ef0f798da996f970af1591411f9cfe0985), [`9a9276eb7`](https://github.com/keystonejs/keystone/commit/9a9276eb7acded979b703b4f3ed8bce781e0718a), [`370c0ee62`](https://github.com/keystonejs/keystone/commit/370c0ee623b515177c3863e66545465c13d5c914), [`2655c0b1b`](https://github.com/keystonejs/keystone/commit/2655c0b1bf714d80d46e1ff4e414b4bce474c23d), [`7b84c4066`](https://github.com/keystonejs/keystone/commit/7b84c40661a086b5468cc4d4542dfb696bfc2f93), [`53b8b659f`](https://github.com/keystonejs/keystone/commit/53b8b659ffc7db41e0e0d9ad7393e6a821187340), [`29e787983`](https://github.com/keystonejs/keystone/commit/29e787983bdc26b147d6b5f476e70768bbc5318c), [`d9c20ba66`](https://github.com/keystonejs/keystone/commit/d9c20ba66931077f6e18d3497282be328cfb629f), [`0e265f6c1`](https://github.com/keystonejs/keystone/commit/0e265f6c10eadd37f75e5551b22b50236e830086), [`24e0ef5b6`](https://github.com/keystonejs/keystone/commit/24e0ef5b6bd93c105fdef2caea6b862ff1dfd6f3), [`45ea93421`](https://github.com/keystonejs/keystone/commit/45ea93421f9a6cf9b7ccbd983e0c9cbd687ff6af), [`6c949dbf2`](https://github.com/keystonejs/keystone/commit/6c949dbf262350e280072d82cd48fdd31ff5ba6d), [`3ca5038a0`](https://github.com/keystonejs/keystone/commit/3ca5038a021105a7452f4e7a4641107caa4ffe3a), [`bea9008f8`](https://github.com/keystonejs/keystone/commit/bea9008f82efea7fcf1cb547f3841915cd4689cc), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc), [`00f19daee`](https://github.com/keystonejs/keystone/commit/00f19daee8bbd75fb58fb76caaa9a3de70ebfcac), [`00f19daee`](https://github.com/keystonejs/keystone/commit/00f19daee8bbd75fb58fb76caaa9a3de70ebfcac), [`c63e5d75c`](https://github.com/keystonejs/keystone/commit/c63e5d75cd77cf26f8762bda8143d1c1db6d0e3e), [`0f86e99bb`](https://github.com/keystonejs/keystone/commit/0f86e99bb3aa15f691ab7ff79e5a9ae3d1ac464e), [`f826f15c6`](https://github.com/keystonejs/keystone/commit/f826f15c6e00fcfcef6d9153b261e8977f5117f1), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc)]:
  - @keystone-ui/button@3.0.1
  - @keystone-ui/core@2.0.1
  - @keystone-ui/fields@2.0.1
  - @keystone-ui/icons@2.0.1
  - @keystone-ui/popover@2.0.1
  - @keystone-ui/tooltip@2.0.1
  - @keystone-next/admin-ui@10.0.0
  - @keystone-next/admin-ui-utils@3.0.1
  - @keystone-next/fields@5.1.0
  - @keystone-next/types@14.0.0
  - @keystone-next/adapter-knex-legacy@13.1.0
  - @keystone-next/adapter-mongoose-legacy@11.1.0
  - @keystone-next/adapter-prisma-legacy@3.1.0
  - @keystone-next/fields-legacy@22.0.1

## 2.0.0

### Major Changes

- [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf) [#4622](https://github.com/keystonejs/keystone/pull/4622) Thanks [@renovate](https://github.com/apps/renovate)! - Updated react and react-dom to v17

### Patch Changes

- [`0929fbc4b`](https://github.com/keystonejs/keystone/commit/0929fbc4b7a8ea3511438df26742c9272b2e6b9a) [#4802](https://github.com/keystonejs/keystone/pull/4802) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Stopped unwrapping headings when in the middle of a heading

* [`0929fbc4b`](https://github.com/keystonejs/keystone/commit/0929fbc4b7a8ea3511438df26742c9272b2e6b9a) [#4802](https://github.com/keystonejs/keystone/pull/4802) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated slate to 0.60.3

- [`0929fbc4b`](https://github.com/keystonejs/keystone/commit/0929fbc4b7a8ea3511438df26742c9272b2e6b9a) [#4802](https://github.com/keystonejs/keystone/pull/4802) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed editor so that when the user is at the end of a text node with a mark and a break is inserted, the mark is removed

- Updated dependencies [[`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf), [`208722a42`](https://github.com/keystonejs/keystone/commit/208722a4234434e116846756bab18f7e11674ec8), [`ad75e3d61`](https://github.com/keystonejs/keystone/commit/ad75e3d61c73ba1239fd21b58f175aac01d9f302), [`a0931858e`](https://github.com/keystonejs/keystone/commit/a0931858e499d9504e4e822b850dcf89c3cdac60), [`d8f64887f`](https://github.com/keystonejs/keystone/commit/d8f64887f2aa428ea8ac35d0efa50ce05534f40b), [`45b047ad0`](https://github.com/keystonejs/keystone/commit/45b047ad015fc9d72cf8c2b85529ffe3abbc189e), [`74f428353`](https://github.com/keystonejs/keystone/commit/74f428353b90958f97669cbcb78e18ca44438765), [`4035218df`](https://github.com/keystonejs/keystone/commit/4035218df390beff3d42c0d3fc21335230d8a60d), [`954350389`](https://github.com/keystonejs/keystone/commit/9543503894c3e78a9b69a75cbfb3ca6b85ae34e8), [`e29ae2749`](https://github.com/keystonejs/keystone/commit/e29ae2749321c103dd494eba6778ee4137bb2aa3), [`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0)]:
  - @keystone-next/admin-ui@9.0.0
  - @keystonejs/fields@22.0.0
  - @keystone-next/admin-ui-utils@3.0.0
  - @keystone-next/fields@5.0.0
  - @keystone-ui/button@3.0.0
  - @keystone-ui/core@2.0.0
  - @keystone-ui/fields@2.0.0
  - @keystone-ui/icons@2.0.0
  - @keystone-ui/popover@2.0.0
  - @keystone-ui/tooltip@2.0.0
  - @keystone-next/types@13.0.0
  - @keystonejs/adapter-mongoose@11.0.1
  - @keystonejs/adapter-prisma@3.0.1
  - @keystonejs/adapter-knex@13.0.1

## 1.0.1

### Patch Changes

- Updated dependencies [[`1744c5f05`](https://github.com/keystonejs/keystone/commit/1744c5f05c9a13e680aaa1ed151f23f1d015ed9c), [`d9675553b`](https://github.com/keystonejs/keystone/commit/d9675553b33f39e2c7ada7eb6555d16e9fccb37e), [`fd0dff3fd`](https://github.com/keystonejs/keystone/commit/fd0dff3fdfcbe20b2884357a6e1b20f1b7307652), [`5be53ddc3`](https://github.com/keystonejs/keystone/commit/5be53ddc39be1415d56e2fa5e7898ab9edf468d5), [`fb8bcff91`](https://github.com/keystonejs/keystone/commit/fb8bcff91ef487730164c3330e0742ab13d9b3d7), [`096927a68`](https://github.com/keystonejs/keystone/commit/096927a6813a23030988ba8b64b2e8452f571a33)]:
  - @keystone-next/types@12.0.0
  - @keystone-next/admin-ui@8.0.1
  - @keystone-next/admin-ui-utils@2.0.8
  - @keystone-next/fields@4.1.1

## 1.0.0

### Major Changes

- [`2ed7ee700`](https://github.com/keystonejs/keystone/commit/2ed7ee70047c4c2bb6b855ec51a2fa58e4c7474d) [#4720](https://github.com/keystonejs/keystone/pull/4720) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release

### Patch Changes

- Updated dependencies [[`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf), [`94fbb45f1`](https://github.com/keystonejs/keystone/commit/94fbb45f1920781423f6a8e489e812b74a260099), [`680169cad`](https://github.com/keystonejs/keystone/commit/680169cad62dd889ec95961cba9df3b4d012887f), [`858eedb18`](https://github.com/keystonejs/keystone/commit/858eedb18c14ed017b01f588071192cdac355c47), [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d), [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9)]:
  - @keystonejs/adapter-prisma@3.0.0
  - @keystonejs/fields@21.1.0
  - @keystone-next/types@11.0.2
  - @keystone-ui/tooltip@1.0.6
  - @keystonejs/adapter-knex@13.0.0
  - @keystonejs/adapter-mongoose@11.0.0

## 0.0.9

### Patch Changes

- Updated dependencies [[`6b95cb6e4`](https://github.com/keystonejs/keystone/commit/6b95cb6e4d5bea3a87e22765d5fcf31db2fc31ae), [`fc2b7101f`](https://github.com/keystonejs/keystone/commit/fc2b7101f35f20e4d729269a005816546bb37464), [`a96c24cca`](https://github.com/keystonejs/keystone/commit/a96c24ccab8dadc9e8f0131fe6509abd64a776f5), [`e7d4d54e5`](https://github.com/keystonejs/keystone/commit/e7d4d54e5b94e6b376d6eab28a0f2b074f2c95ed), [`a62a2d996`](https://github.com/keystonejs/keystone/commit/a62a2d996f1080051f7962b7063ae37d7e8b7e63)]:
  - @keystonejs/adapter-prisma@2.0.0
  - @keystone-next/types@11.0.1
  - @keystonejs/fields@21.0.2

## 0.0.8

### Patch Changes

- Updated dependencies [[`49eec4dea`](https://github.com/keystonejs/keystone/commit/49eec4dea522c6a043b3eaf93fc8be8256b00aa6), [`4768fbf83`](https://github.com/keystonejs/keystone/commit/4768fbf831ffff648e540c479a1954ae40e05aaa), [`59027f8a4`](https://github.com/keystonejs/keystone/commit/59027f8a41cb11632f7c1eb5b3a8092193ecc87e), [`0d9404768`](https://github.com/keystonejs/keystone/commit/0d94047686d1bb1308fd8c47b769c999390d8f6d), [`b81a11c17`](https://github.com/keystonejs/keystone/commit/b81a11c171f3627f6cecb66bd2faeb89a68a009e), [`7ffd2ebb4`](https://github.com/keystonejs/keystone/commit/7ffd2ebb42dfaf12e23ba166b44ec4db60d9824b), [`0df2fb79c`](https://github.com/keystonejs/keystone/commit/0df2fb79c56094b5cdc0be6a0d6c2812ff0ec7f9), [`d090053df`](https://github.com/keystonejs/keystone/commit/d090053df9545380c42ddd18fae6782f3c3e2719), [`177cbd530`](https://github.com/keystonejs/keystone/commit/177cbd5303b814d1acaa8ded98e3d114c770bdba), [`160bd77d3`](https://github.com/keystonejs/keystone/commit/160bd77d39d5e99b11bee056fe2c3b2585126bbc), [`831db7c2b`](https://github.com/keystonejs/keystone/commit/831db7c2b7a9bced87acf76e3f431ca88a8880b0), [`a36bcf847`](https://github.com/keystonejs/keystone/commit/a36bcf847806ca0739f7b44d49a9bf6ac26a38d4), [`6ea4ff3cf`](https://github.com/keystonejs/keystone/commit/6ea4ff3cf77d5d2278bf4f0415d11aa7399a0490), [`81e86cbaa`](https://github.com/keystonejs/keystone/commit/81e86cbaa5c73633d6cb0ca2f84e834201e8bf9a)]:
  - @keystonejs/adapter-prisma@1.1.2
  - @keystone-next/types@11.0.0
  - @keystone-next/admin-ui@8.0.0
  - @keystone-ui/fields@1.1.0
  - @keystone-next/fields@4.1.0
  - @keystone-ui/popover@1.1.1
  - @keystone-ui/tooltip@1.0.5
  - @keystonejs/fields@21.0.1
  - @keystonejs/adapter-knex@12.0.4
  - @keystonejs/adapter-mongoose@10.1.2
  - @keystone-next/admin-ui-utils@2.0.7

## 0.0.7

### Patch Changes

- Updated dependencies [[`24ecd72e5`](https://github.com/keystonejs/keystone/commit/24ecd72e54eee12442c7c1d0533936a9ad86620a)]:
  - @keystone-next/admin-ui@7.0.1
  - @keystone-next/fields@4.0.3
  - @keystone-next/types@10.0.0
  - @keystone-next/admin-ui-utils@2.0.6

## 0.0.6

### Patch Changes

- Updated dependencies [[`1236f5f40`](https://github.com/keystonejs/keystone/commit/1236f5f4024f1698b5a39343b4e5dbfa42c5fc9c), [`ba842d48b`](https://github.com/keystonejs/keystone/commit/ba842d48b5e9499ccd6f59d1610d55e964ffdb93), [`933c78a1e`](https://github.com/keystonejs/keystone/commit/933c78a1edc070b63f7720f64c15421ba28bdde5), [`f559e680b`](https://github.com/keystonejs/keystone/commit/f559e680bad7a7c948a317adfb91a3b024b486c4), [`89f7d4599`](https://github.com/keystonejs/keystone/commit/89f7d459906072940da1355c38815d1b3ef49368), [`cf2819544`](https://github.com/keystonejs/keystone/commit/cf2819544426def260ada5eb18fdc9b8a01e9438), [`17519bf64`](https://github.com/keystonejs/keystone/commit/17519bf64f277ad154fad1b0d5a423048e1336e0)]:
  - @keystone-next/admin-ui@7.0.0
  - @keystone-ui/tooltip@1.0.4
  - @keystone-next/types@9.0.0
  - @keystonejs/adapter-mongoose@10.1.1
  - @keystone-next/fields@4.0.2
  - @keystone-next/admin-ui-utils@2.0.5
  - @keystonejs/adapter-knex@12.0.3
  - @keystonejs/adapter-prisma@1.1.1

## 0.0.5

### Patch Changes

- Updated dependencies [[`075ef1628`](https://github.com/keystonejs/keystone/commit/075ef16281a89c8291f90275adca98f042cc54da)]:
  - @keystone-next/admin-ui@6.0.0
  - @keystone-next/types@8.0.0
  - @keystone-next/fields@4.0.1
  - @keystone-next/admin-ui-utils@2.0.4

## 0.0.4

### Patch Changes

- Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0), [`2d3668c49`](https://github.com/keystonejs/keystone/commit/2d3668c49d1913afecbacf2b5ef164e553210956), [`6912c7b9d`](https://github.com/keystonejs/keystone/commit/6912c7b9dc3d786e61e6f657b0886b258d942c30), [`e33cf0c1e`](https://github.com/keystonejs/keystone/commit/e33cf0c1e78ae69cffaf45009e47ca1198464cf2), [`defd05365`](https://github.com/keystonejs/keystone/commit/defd05365f31d0d6d4b6fd9ffe0a0c3928f97e79), [`5c75534f6`](https://github.com/keystonejs/keystone/commit/5c75534f6e9e0f10a6556a1f1dc87b5fdd986dd4), [`6d09df338`](https://github.com/keystonejs/keystone/commit/6d09df3381d1682b8002d52ed1696b661fdff035), [`d329f07a5`](https://github.com/keystonejs/keystone/commit/d329f07a5ce7ebf5d658a7f90334ba4372a2a72d), [`88b230317`](https://github.com/keystonejs/keystone/commit/88b2303177253aa5d76b50d40d19138af2bc3e41), [`39639b203`](https://github.com/keystonejs/keystone/commit/39639b2031bb749067ef537ea47e5d93a8bb89da), [`661104764`](https://github.com/keystonejs/keystone/commit/66110476491953af2134cd3cd4e3ef7c361ac5da), [`dab8121a6`](https://github.com/keystonejs/keystone/commit/dab8121a6a8eae4c42a5a9ecbdb72a3e8b1eeda4), [`88b230317`](https://github.com/keystonejs/keystone/commit/88b2303177253aa5d76b50d40d19138af2bc3e41), [`481e456ac`](https://github.com/keystonejs/keystone/commit/481e456ac4158207436ddd9be18fdca0f27b6409), [`08398473b`](https://github.com/keystonejs/keystone/commit/08398473bb81dfd43a3c134ed8de61e45aa770f0), [`2308e5efc`](https://github.com/keystonejs/keystone/commit/2308e5efc7c6893c87652411496b15a8124f6e05), [`4d3cb8e32`](https://github.com/keystonejs/keystone/commit/4d3cb8e32b22250fdbe04af758b0aad727ba63e4), [`f2c7675fb`](https://github.com/keystonejs/keystone/commit/f2c7675fb51ed41e6df8248c76b9322d6de5ee0d)]:
  - @keystonejs/adapter-mongoose@10.1.0
  - @keystonejs/fields@21.0.0
  - @keystone-next/fields@4.0.0
  - @keystone-next/admin-ui@5.0.0
  - @keystonejs/adapter-prisma@1.1.0
  - @keystone-next/types@7.0.0
  - @keystone-ui/core@1.0.4
  - @keystone-ui/fields@1.0.3
  - @keystone-next/admin-ui-utils@2.0.3

## 0.0.3

### Patch Changes

- Updated dependencies [[`dc58df5c8`](https://github.com/keystonejs/keystone/commit/dc58df5c87d694ce94b7d1c2b20d4976176dbd13), [`a5d7b264a`](https://github.com/keystonejs/keystone/commit/a5d7b264ad3e5590e335758881d22f7f296203c9), [`b7a4b997b`](https://github.com/keystonejs/keystone/commit/b7a4b997bae5b2269bea0ad94ca771e63c26ab95), [`ca34424d5`](https://github.com/keystonejs/keystone/commit/ca34424d58e58cc4a657828b1362978be8ee4f62), [`cffa011f7`](https://github.com/keystonejs/keystone/commit/cffa011f79a49e2f5c9165f82e6dff09a88a5b6d), [`192cbed74`](https://github.com/keystonejs/keystone/commit/192cbed74267b68be7de632667261ab943be1e2a), [`2338ed731`](https://github.com/keystonejs/keystone/commit/2338ed73185cd3d33c62fac69064c8a4950dc3fd), [`57092b7c1`](https://github.com/keystonejs/keystone/commit/57092b7c13845fffd1f3767bb609d203afbc2776), [`dbfef6256`](https://github.com/keystonejs/keystone/commit/dbfef6256b11d94250885f5f3a11d0ba81ad3b08), [`b21b62ed5`](https://github.com/keystonejs/keystone/commit/b21b62ed59fcd83ef2fc89587544b9d64522ba27), [`2da044a0c`](https://github.com/keystonejs/keystone/commit/2da044a0cb22dc16a54b7b5555c2b2678e8d4cab), [`341ee2b4b`](https://github.com/keystonejs/keystone/commit/341ee2b4b7eab89f296146ff9e14ce53233235f6), [`4b019b8cf`](https://github.com/keystonejs/keystone/commit/4b019b8cfcb7bea6f800609da5d07e8c8abfc80a), [`68d361d25`](https://github.com/keystonejs/keystone/commit/68d361d2596e8811caf00390c60341ef0c233c7b), [`3f3c65ab2`](https://github.com/keystonejs/keystone/commit/3f3c65ab2d206ef1c72f17259e73fb24a79f0a9b), [`bf22d9f2a`](https://github.com/keystonejs/keystone/commit/bf22d9f2afe537111b95571b86d4fd2759eb6a98), [`3be854440`](https://github.com/keystonejs/keystone/commit/3be85444064b8e62e97670594a1d2599ec2fd11c), [`fe52e25e0`](https://github.com/keystonejs/keystone/commit/fe52e25e04db121adbc6a0ce3bd0dbe1c7270180), [`1c12b8204`](https://github.com/keystonejs/keystone/commit/1c12b8204f8238997ddaf7337c44cf26ebea9ba4), [`6a364a664`](https://github.com/keystonejs/keystone/commit/6a364a664ce16f741408111054f0f3437a63a194), [`79ae6462a`](https://github.com/keystonejs/keystone/commit/79ae6462aac5ba9e27f9e95eacb2d94e76ce6a77)]:
  - @keystone-next/admin-ui@4.0.0
  - @keystone-next/types@6.0.0
  - @keystone-next/fields@3.2.2
  - @keystone-next/admin-ui-utils@2.0.2

## 0.0.2

### Patch Changes

- Updated dependencies [[`abdaeb9c1`](https://github.com/keystonejs/keystone/commit/abdaeb9c17a0f1d8e6eda1178d79107ac8770058), [`b6498d9f1`](https://github.com/keystonejs/keystone/commit/b6498d9f1341648742f2db78fec53b851b36dddd), [`d36e580cc`](https://github.com/keystonejs/keystone/commit/d36e580cc21e4b77a1bd0615c96c0793b9c5dac5), [`803626e88`](https://github.com/keystonejs/keystone/commit/803626e8854f9b7d293bd1829398d25a6692154a)]:
  - @keystonejs/fields@20.1.3
  - @keystone-next/types@5.0.0
  - @keystone-next/admin-ui@3.1.2
  - @keystone-next/admin-ui-utils@2.0.1
  - @keystone-next/fields@3.2.1

## 0.0.1

### Patch Changes

- [`eddd7e795`](https://github.com/keystonejs/keystone/commit/eddd7e79599e20f5bef61f240d874b37d0a084c4) [#4376](https://github.com/keystonejs/keystone/pull/4376) Thanks [@jossmac](https://github.com/jossmac)! - tidy the document field; primarily the toolbar

- [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a) [#4378](https://github.com/keystonejs/keystone/pull/4378) Thanks [@timleslie](https://github.com/timleslie)! - Updated code to consistently use `context` rather than `ctx` for graphQL context variables.

- Updated dependencies [[`8b12f795d`](https://github.com/keystonejs/keystone/commit/8b12f795d64dc085ca663921aa6826350d234cd0), [`8b12f795d`](https://github.com/keystonejs/keystone/commit/8b12f795d64dc085ca663921aa6826350d234cd0), [`038b0ae65`](https://github.com/keystonejs/keystone/commit/038b0ae6586f8673de22046842b2ef993b0e1937), [`55a04a100`](https://github.com/keystonejs/keystone/commit/55a04a1004b7f15fcd41b4935d74fd1847c9deeb), [`f4a855c71`](https://github.com/keystonejs/keystone/commit/f4a855c71e966ef3ebc894a3b0f1af51e5182394), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567), [`fa12a18b0`](https://github.com/keystonejs/keystone/commit/fa12a18b077367563b1b69db55274e47a1bd5027), [`4eef4dc55`](https://github.com/keystonejs/keystone/commit/4eef4dc5587cc06f08ead5d5d05db2e9a786b8bc), [`eddd7e795`](https://github.com/keystonejs/keystone/commit/eddd7e79599e20f5bef61f240d874b37d0a084c4), [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`b8c2c48ec`](https://github.com/keystonejs/keystone/commit/b8c2c48ec3746809894af7347c205f6a95329e8d)]:
  - @keystone-next/fields@3.2.0
  - @keystone-ui/popover@1.1.0
  - @keystonejs/fields@20.1.2
  - @keystone-ui/core@1.0.3
  - @keystone-next/admin-ui@3.1.1
  - @keystone-next/admin-ui-utils@2.0.0
  - @keystone-next/types@4.1.1
  - @keystone-ui/tooltip@1.0.3
