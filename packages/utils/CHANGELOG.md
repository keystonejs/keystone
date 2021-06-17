# @keystonejs/utils

## 12.0.0

### Major Changes

- [#5874](https://github.com/keystonejs/keystone/pull/5874) [`4c90c0d3c`](https://github.com/keystonejs/keystone/commit/4c90c0d3c8e75c6a58910c4bd563b3b80e61e801) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed the following exports as they're no longer used by Keystone:

  - `noop`
  - `identity`
  - `getType`
  - `escapeRegExp`
  - `mapKeys`
  - `mapKeyNames`
  - `resolveAllKeys`
  - `unique`
  - `intersection`
  - `pick`
  - `omitBy`
  - `objMerge`
  - `defaultObj`
  - `filterValues`
  - `arrayToObject`
  - `flatten`
  - `zipObj`
  - `mergeWhereClause`
  - `createLazyDeferred`
  - `versionGreaterOrEqualTo`
  - `upcase`
  - `humanize`

### Minor Changes

- [#5854](https://github.com/keystonejs/keystone/pull/5854) [`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Replaced the types `FileMode` and `ImageMode` with `AssetMode`.

  Added internal experimental Keystone Cloud integration capabilities for images.

### Patch Changes

- Updated dependencies [[`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4), [`4995c682d`](https://github.com/keystonejs/keystone/commit/4995c682dbdcfac2100de9fab98ba1e0e08cbcc2), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`84a5e7f3b`](https://github.com/keystonejs/keystone/commit/84a5e7f3bc3a29ff31d642831e7aaadfc8534ba1), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`97fd5e05d`](https://github.com/keystonejs/keystone/commit/97fd5e05d8681bae86001e6b7e8e3f36ebd639b7)]:
  - @keystone-next/types@20.0.0

## 11.0.1

### Patch Changes

- Updated dependencies [[`b9c828fb0`](https://github.com/keystonejs/keystone/commit/b9c828fb0d6e587976dbd0dc4e87004bce3b2ef7), [`5cc35170f`](https://github.com/keystonejs/keystone/commit/5cc35170fd46118089a2a6f863d782aff989bbf0), [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a), [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394), [`7bda87ea7`](https://github.com/keystonejs/keystone/commit/7bda87ea7f11e0faceccc6ab3f715c72b07c129b), [`4b11c5ea8`](https://github.com/keystonejs/keystone/commit/4b11c5ea87b759c24bdbff9d18443bbc972757c0), [`bb4f4ac91`](https://github.com/keystonejs/keystone/commit/bb4f4ac91c3ed70393774f744075971453a12aba)]:
  - @keystone-next/types@19.0.0

## 11.0.0

### Major Changes

- [#5746](https://github.com/keystonejs/keystone/pull/5746) [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d) Thanks [@timleslie](https://github.com/timleslie)! - Update Node.js dependency to `^12.20 || >= 14.13`.

### Patch Changes

- Updated dependencies [[`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d)]:
  - @keystone-next/types@18.0.0

## 10.0.0

### Major Changes

- [#5582](https://github.com/keystonejs/keystone/pull/5582) [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Updated parseImageRef and getRef to accept a different signature for the image ref.

### Minor Changes

- [#5529](https://github.com/keystonejs/keystone/pull/5529) [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added `getFileRef` and `parseFileRef` to exported utilities.

### Patch Changes

- Updated dependencies [[`7e81b52b0`](https://github.com/keystonejs/keystone/commit/7e81b52b0f2240f0c590eb8f6733360cab9fe93a), [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5), [`fdebf79cc`](https://github.com/keystonejs/keystone/commit/fdebf79cc3520ffb65979ddac7d61791f4f37324), [`9fd7cc62a`](https://github.com/keystonejs/keystone/commit/9fd7cc62a889f8a0f8933040bb16fcc36af7795e)]:
  - @keystone-next/types@17.0.1

## 9.0.0

### Major Changes

- [#5397](https://github.com/keystonejs/keystone/pull/5397) [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b) Thanks [@bladey](https://github.com/bladey)! - Updated Node engine version to 12.x due to 10.x reaching EOL on 2021-04-30.

### Minor Changes

- [#5403](https://github.com/keystonejs/keystone/pull/5403) [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added a humanize fn which is string transformation logic ported over from @keystone-next/keystone.

### Patch Changes

- [#5409](https://github.com/keystonejs/keystone/pull/5409) [`b0db0a7a8`](https://github.com/keystonejs/keystone/commit/b0db0a7a8d3aa46a8034022c456ea5100b129dc0) Thanks [@timleslie](https://github.com/timleslie)! - Updated argument types of `intersection` to be `readonly`.

* [#5472](https://github.com/keystonejs/keystone/pull/5472) [`5f2673704`](https://github.com/keystonejs/keystone/commit/5f2673704e997710a088c45e9d95d22e1195b2da) Thanks [@timleslie](https://github.com/timleslie)! - Improved types of `arrayToObject`.

- [#5419](https://github.com/keystonejs/keystone/pull/5419) [`ea708559f`](https://github.com/keystonejs/keystone/commit/ea708559fbd19914fe7eb52f519937e5fe50a143) Thanks [@timleslie](https://github.com/timleslie)! - Updated types for `mapKeyNames` and `flatten` to be more correct.

- Updated dependencies [[`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624), [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7)]:
  - @keystone-next/types@17.0.0

## 8.0.0

### Major Changes

- [#5197](https://github.com/keystonejs/keystone/pull/5197) [`97609a623`](https://github.com/keystonejs/keystone/commit/97609a623334fd8d7b9e24dd099abda2e2a37853) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused functions `captureSuspensePromises` and `countArrays`.

## 7.0.0

### Major Changes

- [#5066](https://github.com/keystonejs/keystone/pull/5066) [`b44f07b6a`](https://github.com/keystonejs/keystone/commit/b44f07b6a7ce1eef6d41513096eadea5aa2be5f7) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused functions `flatMap`, `compose`, and `asyncForEach`.

## 6.0.2

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

## 6.0.1

### Patch Changes

- [`94c8d349d`](https://github.com/keystonejs/keystone/commit/94c8d349d3795cd9abec407f78752417623ee56f) [#4729](https://github.com/keystonejs/keystone/pull/4729) Thanks [@timleslie](https://github.com/timleslie)! - Updated type defintions of API functions to be more correct and informative.

## 6.0.0

### Major Changes

- [`b76241695`](https://github.com/keystonejs/keystone/commit/b7624169554b01dba2185ef43856a223d32f12be) [#4430](https://github.com/keystonejs/keystone/pull/4430) Thanks [@timleslie](https://github.com/timleslie)! - Converted package to TypeScript. `flatMap` no longer defaults the `fn` argument to `i => i`.

## 5.4.3

### Patch Changes

- [`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6) [#3481](https://github.com/keystonejs/keystone/pull/3481) Thanks [@Noviny](https://github.com/Noviny)! - Updated dependencies through a major version - this shouldn't require change by consumers.

## 5.4.2

### Patch Changes

- [`69d7f2e50`](https://github.com/keystonejs/keystone/commit/69d7f2e50ef2325c0d3b02b8bb5c310590796fed) [#3183](https://github.com/keystonejs/keystone/pull/3183) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated doc comments.

## 5.4.1

### Patch Changes

- [`e0e3e30a`](https://github.com/keystonejs/keystone/commit/e0e3e30a9051741de3f5a0c12ba00f2238d54800) [#2697](https://github.com/keystonejs/keystone/pull/2697) Thanks [@Vultraz](https://github.com/Vultraz)! - Converted some stray promise chains to async/await.

## 5.4.0

### Minor Changes

- [`663ae7b4`](https://github.com/keystonejs/keystone/commit/663ae7b453f450f077795fbbc6c9f138e6b27f52) [#2552](https://github.com/keystonejs/keystone/pull/2552) Thanks [@timleslie](https://github.com/timleslie)! - Added `asyncForEach` to `utils` package for iteratively executing an async function over an array.

## 5.3.0

### Minor Changes

- [`51546e41`](https://github.com/keystonejs/keystone/commit/51546e4142fb8c66cfc413479c671a59618f885b) [#2524](https://github.com/keystonejs/keystone/pull/2524) Thanks [@jesstelford](https://github.com/jesstelford)! - Created `upcase` util to make the first letter for word uppercase.

## 5.2.2

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

## 5.2.1

### Patch Changes

- [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09) [#2381](https://github.com/keystonejs/keystone/pull/2381) Thanks [@timleslie](https://github.com/timleslie)! - Updated `@babel/*` dependency packages to latest versions.

## 5.2.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

## 5.1.3

### Patch Changes

- [`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a) [#2144](https://github.com/keystonejs/keystone/pull/2144) - Upgraded all @babel/\* dependencies.

* [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29) [#2189](https://github.com/keystonejs/keystone/pull/2189) - Upgraded prettier to 1.19.1 and formatted code accordingly.

## 5.1.2

### Patch Changes

- [`3d2c4b3f`](https://github.com/keystonejs/keystone/commit/3d2c4b3fb8f05e79fc1a4a8e39077058466795a2) [#2112](https://github.com/keystonejs/keystone/pull/2112) - Added knex adaptar database version validiation

## 5.1.1

### Patch Changes

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Upgrade all Babel deps to the same version (7.7.4)

## 5.1.0

### Minor Changes

- [`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469) [#1851](https://github.com/keystonejs/keystone/pull/1851) Thanks [@jesstelford](https://github.com/jesstelford)! - Added runtime database version validation

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/utils

## 3.2.0

### Minor Changes

- [b2c5277e](https://github.com/keystonejs/keystone/commit/b2c5277e): Add a compose() function to utils.

## 3.1.0

### Minor Changes

- [857386db](https://github.com/keystonejs/keystone/commit/857386db): Add `filterValues(object, predicate)` to remove entries from an object where the value does not match the predicate.

## 3.0.2

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade promise utility dependencies

## 3.0.1

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 3.0.0

### Major Changes

- [b7a2ea9c](https://github.com/keystonejs/keystone/commit/b7a2ea9c):

  - Remove `checkRequiredConfig`, `fixConfigKeys` and `camelize`.

### Minor Changes

- [c9102446](https://github.com/keystonejs/keystone/commit/c9102446):

  - Add a mechanism for loading multiple Suspense-aware components in parallel

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone/commit/81dc0be5):

  - Update dependencies

## 2.0.0

- [major][98c02a46](https://github.com/keystonejs/keystone/commit/98c02a46):

  - Distribute CommonJS & ESM builds of the @keystone-alpha/utils package.

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/utils

## 1.0.0

- [major] 723371a0:

  - Correctly surface nested errors from GraphQL

- [minor] aca26f71:

  - Expose access to GraphQL query method within hooks

- [minor] a3d5454d:

  - Add flatMap, noop, identity functions

## 0.3.1

- [patch] 06b9968e:

  - Add zipObj function

## 0.3.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.2.0

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [minor] Added createLazyDeferred method [9c75136](9c75136)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
