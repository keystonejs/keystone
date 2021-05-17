# @keystone-next/keystone

## 17.2.0

### Minor Changes

- [#5143](https://github.com/keystonejs/keystone/pull/5143) [`1ef9986dd`](https://github.com/keystonejs/keystone/commit/1ef9986ddc5a4a881a3fc6fae3d1420447174fdb) Thanks [@timleslie](https://github.com/timleslie)! - Added `graphql.cacheHint` configuration for lists and fields.

### Patch Changes

- [#5727](https://github.com/keystonejs/keystone/pull/5727) [`737b3e6e5`](https://github.com/keystonejs/keystone/commit/737b3e6e53d0948de8f1419709ece5648ff4529a) Thanks [@cameronbraid](https://github.com/cameronbraid)! - Fixed a bug in `storedSessions` not correctly identifying the current `sessionId`.

* [#5686](https://github.com/keystonejs/keystone/pull/5686) [`62e68c8e5`](https://github.com/keystonejs/keystone/commit/62e68c8e5b4964785a173ab05ff89cba9cc685f2) Thanks [@timleslie](https://github.com/timleslie)! - Reduced the explicit dependence on the internal Keystone object when creating context objects.

- [#5673](https://github.com/keystonejs/keystone/pull/5673) [`deb7f9504`](https://github.com/keystonejs/keystone/commit/deb7f9504573da67b0cd76d3f53dc0fcceaf1021) Thanks [@timleslie](https://github.com/timleslie)! - Refactored code to parse `config.db`. No functional changes.

- Updated dependencies [[`62e68c8e5`](https://github.com/keystonejs/keystone/commit/62e68c8e5b4964785a173ab05ff89cba9cc685f2), [`deb7f9504`](https://github.com/keystonejs/keystone/commit/deb7f9504573da67b0cd76d3f53dc0fcceaf1021), [`1ef9986dd`](https://github.com/keystonejs/keystone/commit/1ef9986ddc5a4a881a3fc6fae3d1420447174fdb), [`669f0d8ac`](https://github.com/keystonejs/keystone/commit/669f0d8acfce5d6b7eaaa972ab354597c53c2568)]:
  - @keystone-next/types@17.1.0
  - @keystone-next/admin-ui@14.1.3

## 17.1.1

### Patch Changes

- [#5613](https://github.com/keystonejs/keystone/pull/5613) [`85dfdfb1e`](https://github.com/keystonejs/keystone/commit/85dfdfb1ea236bb1515ac6df43f974b30d0bf89a) Thanks [@timleslie](https://github.com/timleslie)! - Improved the types of `withItemData`.

- Updated dependencies [[`3aea3b12f`](https://github.com/keystonejs/keystone/commit/3aea3b12fd0047e54671ead796fca15b625ade66), [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857), [`b0a72a112`](https://github.com/keystonejs/keystone/commit/b0a72a112dae7857defc8b745e674d55a29be766), [`79a0844b9`](https://github.com/keystonejs/keystone/commit/79a0844b9d5125891e3eaad4dc3999b232cefaa2), [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857), [`2b3efc8a8`](https://github.com/keystonejs/keystone/commit/2b3efc8a883e1e5832ed5111a6e0e4d3ee59f162), [`fc9c3d55d`](https://github.com/keystonejs/keystone/commit/fc9c3d55d5a2e6a87bcb9e9ed50a19a503290457), [`400d88257`](https://github.com/keystonejs/keystone/commit/400d88257a3383595cf76c9399848b356dd51a11), [`dbe831976`](https://github.com/keystonejs/keystone/commit/dbe831976eeee876f3722d4b96e1b752b67cb945), [`53225b0ef`](https://github.com/keystonejs/keystone/commit/53225b0efcf33810c1c91a0a4ec3e2369733ab0a), [`79d092afc`](https://github.com/keystonejs/keystone/commit/79d092afca565abe780e84d917299ecb749752f1), [`bb8920843`](https://github.com/keystonejs/keystone/commit/bb8920843a1e0d803b8238bd17e9d65802698685)]:
  - @keystone-next/admin-ui@14.1.2
  - @keystone-next/fields@8.2.0

## 17.1.0

### Minor Changes

- [#5609](https://github.com/keystonejs/keystone/pull/5609) [`1c0265171`](https://github.com/keystonejs/keystone/commit/1c0265171db2e334c25d014d855ec919c3d4782c) Thanks [@renovate](https://github.com/apps/renovate)! - Upgraded Primsa dependency to `2.22.0`.

### Patch Changes

- [#5601](https://github.com/keystonejs/keystone/pull/5601) [`8b77b6971`](https://github.com/keystonejs/keystone/commit/8b77b697187f8d5eb73e862b2c07b8bfbb769e0b) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Next.js dependency to `^10.2.0`.

* [#5592](https://github.com/keystonejs/keystone/pull/5592) [`1043243ff`](https://github.com/keystonejs/keystone/commit/1043243ff5a22bb067cf4aa6e46d28a529203121) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed uncaught exception in file stream.

* Updated dependencies [[`3d3894679`](https://github.com/keystonejs/keystone/commit/3d38946798650d117c39ce522987b169e616b2b9), [`8b77b6971`](https://github.com/keystonejs/keystone/commit/8b77b697187f8d5eb73e862b2c07b8bfbb769e0b)]:
  - @keystone-next/fields@8.1.0
  - @keystone-next/adapter-prisma-legacy@6.1.0
  - @keystone-next/admin-ui@14.1.1

## 17.0.0

### Major Changes

- [#5582](https://github.com/keystonejs/keystone/pull/5582) [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Changed image ref to now be `${mode}:image:${id}`.

### Minor Changes

- [#5570](https://github.com/keystonejs/keystone/pull/5570) [`2df2fa021`](https://github.com/keystonejs/keystone/commit/2df2fa0213146adab79e5e17c60d43259041093d) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added `maxFileSize` property to keystone config.

### Patch Changes

- [#5547](https://github.com/keystonejs/keystone/pull/5547) [`18ae28bde`](https://github.com/keystonejs/keystone/commit/18ae28bde943c140332ad5e0cd0b5238555fb1b8) Thanks [@timleslie](https://github.com/timleslie)! - Consolidate the code from the `@keystone-next/server-side-graphql-client-legacy` package into the main package.

* [#5518](https://github.com/keystonejs/keystone/pull/5518) [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5) Thanks [@timleslie](https://github.com/timleslie)! - Updated the list item and db item APIs to include an empty default for `.findMany()` and `.count()`.

- [#5522](https://github.com/keystonejs/keystone/pull/5522) [`fbf5f77c5`](https://github.com/keystonejs/keystone/commit/fbf5f77c515b2413c4019b4a521dd4f4aa965276) Thanks [@timleslie](https://github.com/timleslie)! - Moved the call to `createImagesContext` into `makeCreateContext()`.

* [#5514](https://github.com/keystonejs/keystone/pull/5514) [`8577eb3ba`](https://github.com/keystonejs/keystone/commit/8577eb3baafe9cd61c48d89aca9eff252765e5a6) Thanks [@timleslie](https://github.com/timleslie)! - The field hooks API has deprecated the `addFieldValidationError` argument. It has been replaced with the argument `addValidationError`, and will be removed in a future release.

- [#5523](https://github.com/keystonejs/keystone/pull/5523) [`91e603d7a`](https://github.com/keystonejs/keystone/commit/91e603d7a686185c145bcbc445a27939f94aafa8) Thanks [@timleslie](https://github.com/timleslie)! - Moved internal code into subdirectories for easier navigation.

* [#5517](https://github.com/keystonejs/keystone/pull/5517) [`a6cdf3da8`](https://github.com/keystonejs/keystone/commit/a6cdf3da8a9b2ca943048fee6cacd376ea4aae50) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug using the items API to create/update `image` field items.

- [#5552](https://github.com/keystonejs/keystone/pull/5552) [`a0c5aa307`](https://github.com/keystonejs/keystone/commit/a0c5aa30771d187253d0cfe24b4b686e136136cc) Thanks [@timleslie](https://github.com/timleslie)! - Update `context.lists.<list>.count()` to use the GraphQL API rather than directly calling the resolver.

* [#5524](https://github.com/keystonejs/keystone/pull/5524) [`ddf51724a`](https://github.com/keystonejs/keystone/commit/ddf51724ab2043f395d1d197213748c06a5300b7) Thanks [@timleslie](https://github.com/timleslie)! - Removed un-implemented export `singleton` from `schema/`.

- [#5569](https://github.com/keystonejs/keystone/pull/5569) [`d216fd04c`](https://github.com/keystonejs/keystone/commit/d216fd04c92ec594fb9b448025fc3e23fe6dfdad) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Refactored implementation of db lists API

* [#5515](https://github.com/keystonejs/keystone/pull/5515) [`f76938ac2`](https://github.com/keystonejs/keystone/commit/f76938ac223194ce401179fd9fa1226e11077277) Thanks [@timleslie](https://github.com/timleslie)! - Simplified the implementation of the images context API.

* Updated dependencies [[`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`f7d4c9b9f`](https://github.com/keystonejs/keystone/commit/f7d4c9b9f06cc3090b59d4b29e0907e9f3d1faee), [`7e81b52b0`](https://github.com/keystonejs/keystone/commit/7e81b52b0f2240f0c590eb8f6733360cab9fe93a), [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5), [`fdebf79cc`](https://github.com/keystonejs/keystone/commit/fdebf79cc3520ffb65979ddac7d61791f4f37324), [`dbc62ff7c`](https://github.com/keystonejs/keystone/commit/dbc62ff7c71ca4d4db1fab76f3e0ab729af5b80c), [`8577eb3ba`](https://github.com/keystonejs/keystone/commit/8577eb3baafe9cd61c48d89aca9eff252765e5a6), [`05d4883ee`](https://github.com/keystonejs/keystone/commit/05d4883ee19bcfdfcbff7f80693a3fa85cf81aaa), [`a0c5aa307`](https://github.com/keystonejs/keystone/commit/a0c5aa30771d187253d0cfe24b4b686e136136cc), [`9fd7cc62a`](https://github.com/keystonejs/keystone/commit/9fd7cc62a889f8a0f8933040bb16fcc36af7795e), [`3e33cd3ff`](https://github.com/keystonejs/keystone/commit/3e33cd3ff46f824ec3516e5810a7e5027b332a5a), [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1), [`74fed41e2`](https://github.com/keystonejs/keystone/commit/74fed41e23c3d5c6c073574c54ca339df2235351)]:
  - @keystone-next/admin-ui@14.1.0
  - @keystone-next/fields@8.0.0
  - @keystone-next/types@17.0.1
  - @keystone-next/adapter-prisma-legacy@6.0.1
  - @keystone-next/utils-legacy@10.0.0
  - @keystone-next/access-control-legacy@10.0.1

## 16.0.0

### Major Changes

- [#5467](https://github.com/keystonejs/keystone/pull/5467) [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc) Thanks [@timleslie](https://github.com/timleslie)! - Removed the deprecated `context.executeGraphQL`. Identical functionality is available via `context.graphql.raw`.

* [#5478](https://github.com/keystonejs/keystone/pull/5478) [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed) Thanks [@timleslie](https://github.com/timleslie)! - Improved types for `BaseKeystoneList`.

- [#5404](https://github.com/keystonejs/keystone/pull/5404) [`d9e1acb30`](https://github.com/keystonejs/keystone/commit/d9e1acb30e384ce88e6681ba9d299d917dea97d9) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Started formatting GraphQL schema written to `schema.graphql` with Prettier

* [#5397](https://github.com/keystonejs/keystone/pull/5397) [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b) Thanks [@bladey](https://github.com/bladey)! - Updated Node engine version to 12.x due to 10.x reaching EOL on 2021-04-30.

- [#5420](https://github.com/keystonejs/keystone/pull/5420) [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2) Thanks [@timleslie](https://github.com/timleslie)! - Updated core fields implementation to expect an internal option `type.adapter` rather than `type.adapters.prisma`.

* [#5463](https://github.com/keystonejs/keystone/pull/5463) [`309596591`](https://github.com/keystonejs/keystone/commit/3095965915adbb93ff6879d4e9bf3f0dd504708c) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `_listMeta` type from the generated GraphQL API.

### Minor Changes

- [#5451](https://github.com/keystonejs/keystone/pull/5451) [`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624) Thanks [@JedWatson](https://github.com/JedWatson)! - With the goal of making the Lists API (i.e `context.lists.{List}`) more intuitive to use, the `resolveFields` option has been deprecated in favor of two new methods:

  (1) You can specify a string of fields to return with the new `query` option, when you want to query for resolved field values (including querying relationships and virtual fields). This replaces the `resolveFields: false` use case.

  For example, to query a Post you would now write:

  ```js
  const [post] = await context.lists.Post.findMany({
    where: { slug },
    query: `
      title
      content
      image {
        src
        width
        height
      }`,
  });
  ```

  (2) Alternatively, there is a new set of APIs on `context.db.lists.{List}` which will return the unresolved item data from the database (but with read hooks applied), which can then be referenced directly or returned from a custom mutation or query in the GraphQL API to be handled by the Field resolvers. This replaces the `resolveFields: boolean` use case.

  For example, to query for the raw data stored in the database, you would write:

  ```js
  const [post] = await context.db.lists.Post.findMany({
    where: { slug },
  });
  ```

* [#5325](https://github.com/keystonejs/keystone/pull/5325) [`3d3fb860f`](https://github.com/keystonejs/keystone/commit/3d3fb860faa303cbfe75eeb0855a8a575113320c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated to Prisma 2.20

- [#5378](https://github.com/keystonejs/keystone/pull/5378) [`6861ecb40`](https://github.com/keystonejs/keystone/commit/6861ecb40345434f8d070950a3c8fb85f3d59994) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma to 2.21

* [#5396](https://github.com/keystonejs/keystone/pull/5396) [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Added create-image-context, logic for parsing, storing and retrieving image data in keystone core.

### Patch Changes

- [#5452](https://github.com/keystonejs/keystone/pull/5452) [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124) Thanks [@timleslie](https://github.com/timleslie)! - Removed the legacy `defaultAccess` argument from the `Keystone` constructor.

* [#5402](https://github.com/keystonejs/keystone/pull/5402) [`588f31ddc`](https://github.com/keystonejs/keystone/commit/588f31ddce15ab752a987a1dc1429fa1d6f03d7c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Refactored to make testing the cli easier

- [#5444](https://github.com/keystonejs/keystone/pull/5444) [`781b3e5ab`](https://github.com/keystonejs/keystone/commit/781b3e5abcf9a8b6d29c86d6470adfd08b4413c8) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed an error being printed to the console when the Prisma CLI exited with a non-zero exit code when running `keystone-next prisma`

* [#5429](https://github.com/keystonejs/keystone/pull/5429) [`49025d1ad`](https://github.com/keystonejs/keystone/commit/49025d1ad0d85c4f80e5430a365c4fc78db96c92) Thanks [@timleslie](https://github.com/timleslie)! - Removed the internal `_label_` field which is no longer used.

- [#5445](https://github.com/keystonejs/keystone/pull/5445) [`24e62e29c`](https://github.com/keystonejs/keystone/commit/24e62e29c51c04448a272a25292251fc13e06d7a) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused and inaccessible code from the core.

* [#5428](https://github.com/keystonejs/keystone/pull/5428) [`5b2369077`](https://github.com/keystonejs/keystone/commit/5b2369077094dc5470ce8bfc5a7eaf142c04a818) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed printing the incorrect migrations directory to the console

- [#5426](https://github.com/keystonejs/keystone/pull/5426) [`202d362f3`](https://github.com/keystonejs/keystone/commit/202d362f38d0c8827263e6cd2d286d8dcbdd22ad) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated CLI help message to match documentation

* [#5403](https://github.com/keystonejs/keystone/pull/5403) [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Moved core logic in keyToLabel to the @keystone-next/utils-legacy package.

- [#5458](https://github.com/keystonejs/keystone/pull/5458) [`962cde7e3`](https://github.com/keystonejs/keystone/commit/962cde7e32ec7ce23d15180f315549f4f34069ee) Thanks [@timleslie](https://github.com/timleslie)! - Set PRISMA_HIDE_UPDATE_MESSAGE=1 to silence Prisma update messages, since these are out of the hands of the developer.

* [#5443](https://github.com/keystonejs/keystone/pull/5443) [`f67497c1a`](https://github.com/keystonejs/keystone/commit/f67497c1a9dd7462e7d6564250712f5456dc5cb0) Thanks [@timleslie](https://github.com/timleslie)! - Removed legacy support for auxilliary lists.

- [#5460](https://github.com/keystonejs/keystone/pull/5460) [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated the core code from the `@keystone-next/keystone-legacy` package into `@keystone-next/keystone`.

* [#5466](https://github.com/keystonejs/keystone/pull/5466) [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78) Thanks [@timleslie](https://github.com/timleslie)! - Improved the `BaseKeystone` type to be more correct.

- [#5407](https://github.com/keystonejs/keystone/pull/5407) [`76692d266`](https://github.com/keystonejs/keystone/commit/76692d26642eabf23d2ef038dec35d35d4e35d31) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug where `context.prisma` was `undefined` in the `onConnect()` function.

* [#5400](https://github.com/keystonejs/keystone/pull/5400) [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276) Thanks [@timleslie](https://github.com/timleslie)! - Moved the `Implementation` base class from the `fields-legacy` package into the `fields` package.

- [#5390](https://github.com/keystonejs/keystone/pull/5390) [`ad1776b74`](https://github.com/keystonejs/keystone/commit/ad1776b7418b7a0d1c8e5def8d82051752c01aa9) Thanks [@timleslie](https://github.com/timleslie)! - Silenced logging when running CI tests.

* [#5428](https://github.com/keystonejs/keystone/pull/5428) [`5b2369077`](https://github.com/keystonejs/keystone/commit/5b2369077094dc5470ce8bfc5a7eaf142c04a818) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed casing of GraphQL in message logged in `keystone-next dev`

- [#5366](https://github.com/keystonejs/keystone/pull/5366) [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Next.js dependency to `^10.1.3`.

* [#5393](https://github.com/keystonejs/keystone/pull/5393) [`a73aea7d7`](https://github.com/keystonejs/keystone/commit/a73aea7d78d4c520856f06f9d1b79efe4b36993b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed reading config file to be local to the passed directory instead of `process.cwd()`

* Updated dependencies [[`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124), [`b0db0a7a8`](https://github.com/keystonejs/keystone/commit/b0db0a7a8d3aa46a8034022c456ea5100b129dc0), [`f059f6349`](https://github.com/keystonejs/keystone/commit/f059f6349bee3dce8bbf4a0584b235e97872851c), [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`8ab2c9bb6`](https://github.com/keystonejs/keystone/commit/8ab2c9bb6633c2f85844e658f534582c30a39a57), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`5f2673704`](https://github.com/keystonejs/keystone/commit/5f2673704e997710a088c45e9d95d22e1195b2da), [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`ea708559f`](https://github.com/keystonejs/keystone/commit/ea708559fbd19914fe7eb52f519937e5fe50a143), [`49ecca74d`](https://github.com/keystonejs/keystone/commit/49ecca74d2f550df9f7be630c577ad7e6cca573c), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276), [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`89b869e8d`](https://github.com/keystonejs/keystone/commit/89b869e8d492151449f2146108767a7e5e5ecdfa), [`58a793988`](https://github.com/keystonejs/keystone/commit/58a7939888ec84d0f089d77ca1ce9d94ef0d9a85), [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853)]:
  - @keystone-next/admin-ui@14.0.0
  - @keystone-next/types@17.0.0
  - @keystone-next/fields@7.0.0
  - @keystone-next/adapter-prisma-legacy@6.0.0
  - @keystone-next/utils-legacy@9.0.0
  - @keystone-next/access-control-legacy@10.0.0
  - @keystone-next/server-side-graphql-client-legacy@4.0.0

## 15.0.0

### Major Changes

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced `deploy`, `reset` and `generate` commands with `keystone-next prisma`. You can use these commands as replacements for the old commands:

  - `keystone-next deploy` -> `keystone-next prisma migrate deploy`
  - `keystone-next reset` -> `keystone-next prisma migrate reset`
  - `keystone-next generate` -> `keystone-next prisma migrate dev`

* [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `migrationAction` argument to `createSystem` and require that the PrismaClient is passed to `createSystem` to be able to connect to the database.

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next build` command to validate that the GraphQL and Prisma schemas are up to date.

* [#5287](https://github.com/keystonejs/keystone/pull/5287) [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `getDbSchemaName` and `getPrismaPath` database adapter options. To change the database schema that Keystone uses, you can add `?schema=whatever` to the database url.

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved generated `schema.prisma` to the root of the project directory. Note that this also moves the location of migrations from `.keystone/prisma/migrations` to `migrations` at the root of the project.

* [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `dotKeystonePath` argument from `createSystem`

- [#5256](https://github.com/keystonejs/keystone/pull/5256) [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for the `knex` and `mongoose` database adapters. We now only support `prisma_postgresql` and `prisma_sqlite`.

* [#5285](https://github.com/keystonejs/keystone/pull/5285) [`5cd94b2a3`](https://github.com/keystonejs/keystone/commit/5cd94b2a32b3eddaf00ad77229f7e9664899c3b9) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `dropDatabase` method and config option

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved generated GraphQL schema to `schema.graphql` to the root of the project. We recommend that you commit this file to your repo.

### Minor Changes

- [#5344](https://github.com/keystonejs/keystone/pull/5344) [`901817fed`](https://github.com/keystonejs/keystone/commit/901817fedf4bcfb269416c3c68093ae0263f4d00) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added prompt before dropping the database or applying a change to the database that could lose data when `db.useMigrations` is set to false in `keystone-next dev`

* [#5276](https://github.com/keystonejs/keystone/pull/5276) [`1a4db6c87`](https://github.com/keystonejs/keystone/commit/1a4db6c87c17706c8e5db2816e0a6b1b8f79e217) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `artifacts` entrypoint.

- [#5368](https://github.com/keystonejs/keystone/pull/5368) [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8) Thanks [@timleslie](https://github.com/timleslie)! - The config option `db.adapter` is now deprecated. It has been repaced with `db.provider` which can take the values `postgresql` or `sqlite`.

* [#5321](https://github.com/keystonejs/keystone/pull/5321) [`5c4b48636`](https://github.com/keystonejs/keystone/commit/5c4b4863638cffa794dd1b02c445a87655a4178c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `--reset-db` flag to `keystone-next dev` to reset the database before starting Keystone

- [#5283](https://github.com/keystonejs/keystone/pull/5283) [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b) Thanks [@timleslie](https://github.com/timleslie)! - The flag `{ experimental: { prismaSqlite: true } }` is no longer required to use the SQLite adapter.

* [#5341](https://github.com/keystonejs/keystone/pull/5341) [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `generateNextGraphqlAPI` and `generateNodeAPI` experimental options

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `keystone-next postinstall` command which verifies that the Prisma and GraphQL schemas are up to date with a `--fix` flag to automatically update them without a prompt.

* [#5341](https://github.com/keystonejs/keystone/pull/5341) [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `withKeystone` in `next` entrypoint

- [#5302](https://github.com/keystonejs/keystone/pull/5302) [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `migrations` entrypoint with `pushPrismaSchemaToDatabase` export.

### Patch Changes

- [#5280](https://github.com/keystonejs/keystone/pull/5280) [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `adapters-mongoose-legacy` packages dependency.

- Updated dependencies [[`1261c398b`](https://github.com/keystonejs/keystone/commit/1261c398b94ffef2737226cceaebaed1b3c04c72), [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c), [`e702fea44`](https://github.com/keystonejs/keystone/commit/e702fea44c3116db158d97b5ffd24440f09c9d49), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3), [`955787055`](https://github.com/keystonejs/keystone/commit/955787055a54fb33eb45c80dd39fa86a9ff632a0), [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8), [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`8665cfe66`](https://github.com/keystonejs/keystone/commit/8665cfe66016e0356681413e31f80a6d5586d364), [`1e6d12f47`](https://github.com/keystonejs/keystone/commit/1e6d12f47076816d2a2441b42471176c5a7f2f8c), [`fda82869c`](https://github.com/keystonejs/keystone/commit/fda82869c376d05fd007bec22d7bde2604db445b), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b), [`5cd94b2a3`](https://github.com/keystonejs/keystone/commit/5cd94b2a32b3eddaf00ad77229f7e9664899c3b9), [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca), [`4f0abec0b`](https://github.com/keystonejs/keystone/commit/4f0abec0b19c3495c1ae6d7dac49fb46253cf7b3), [`95fefaf81`](https://github.com/keystonejs/keystone/commit/95fefaf815204d6af6e407690f44750f500602e3), [`bc21855a7`](https://github.com/keystonejs/keystone/commit/bc21855a7ff6dd4dbc278b3e15c9157de765e6ba)]:
  - @keystone-next/adapter-prisma-legacy@5.0.0
  - @keystone-next/keystone-legacy@23.0.0
  - @keystone-next/types@16.0.0
  - @keystone-next/admin-ui@13.0.0
  - @keystone-next/fields@6.0.0
  - @keystone-next/server-side-graphql-client-legacy@3.0.1

## 14.0.1

### Patch Changes

- [#5229](https://github.com/keystonejs/keystone/pull/5229) [`fe4b48907`](https://github.com/keystonejs/keystone/commit/fe4b48907fc002711640bfdf4644eb6d2d8643b6) Thanks [@raveling](https://github.com/raveling)! - Updated command line output emojis to be more friendly

* [#5198](https://github.com/keystonejs/keystone/pull/5198) [`b36758a12`](https://github.com/keystonejs/keystone/commit/b36758a121c096e8776420949c77a5304957a969) Thanks [@timleslie](https://github.com/timleslie)! - Removed the legacy `cookieSecret`, `cookie`, and `sessionStore` arguments from the `Keystone` constructor.

* Updated dependencies [[`0e01f471d`](https://github.com/keystonejs/keystone/commit/0e01f471dc669e46c88233cb8ce698749ddcf4fa), [`76e5c7bd3`](https://github.com/keystonejs/keystone/commit/76e5c7bd3d5e4b74b1b3b6b6d6c23d087e81bb21), [`f73cc9377`](https://github.com/keystonejs/keystone/commit/f73cc93779c9fce1f86730e065c02ede92016ad2), [`e944b1ebb`](https://github.com/keystonejs/keystone/commit/e944b1ebbede95500b06028c591ee8947278a479), [`db6cb59dc`](https://github.com/keystonejs/keystone/commit/db6cb59dc0d32e3700c5aa0202428b627c40503d), [`ca1be4156`](https://github.com/keystonejs/keystone/commit/ca1be415663dd822b3adda1e073bd7a1d4a9b97b), [`7ae452ad1`](https://github.com/keystonejs/keystone/commit/7ae452ad144d1186225e94ff39be0eaf9983f585), [`45272d0b1`](https://github.com/keystonejs/keystone/commit/45272d0b1dc68e6ae8dbc4cfda790b3a50cf1b25), [`ade638de0`](https://github.com/keystonejs/keystone/commit/ade638de07142e8ecd0c3bf6c805eed76fd89878), [`2a1fc416e`](https://github.com/keystonejs/keystone/commit/2a1fc416e8f0a83e108a72fcec81b380c601f3ef), [`5510ae33f`](https://github.com/keystonejs/keystone/commit/5510ae33fb18d42e378a00f1f78b803fb01b3fad), [`da900777a`](https://github.com/keystonejs/keystone/commit/da900777a27264595a68fe1ed0e7a689944eb372), [`4d405390c`](https://github.com/keystonejs/keystone/commit/4d405390c0f8dcc37e6fe4da7ce3866c699088f3), [`34dd809ee`](https://github.com/keystonejs/keystone/commit/34dd809eef2368bba1e50ed613b36c5dac7262d1), [`0b679b742`](https://github.com/keystonejs/keystone/commit/0b679b742fb0d5d4c19db4498e327c44dd68b963), [`b36758a12`](https://github.com/keystonejs/keystone/commit/b36758a121c096e8776420949c77a5304957a969), [`fe9fc5e0d`](https://github.com/keystonejs/keystone/commit/fe9fc5e0de8cefb889624e43bc281ac408bcd3b8), [`b8cd13fdf`](https://github.com/keystonejs/keystone/commit/b8cd13fdfcec645140a06b0331b240583eace061), [`32578f01e`](https://github.com/keystonejs/keystone/commit/32578f01e70ea972d438a29fa1e3793c1e02750b)]:
  - @keystone-next/fields@5.4.0
  - @keystone-next/server-side-graphql-client-legacy@3.0.0
  - @keystone-next/keystone-legacy@22.0.0
  - @keystone-next/types@15.0.1
  - @keystone-next/adapter-knex-legacy@13.2.3
  - @keystone-next/adapter-mongoose-legacy@11.1.3
  - @keystone-next/adapter-prisma-legacy@4.0.1

## 14.0.0

### Major Changes

- [#5168](https://github.com/keystonejs/keystone/pull/5168) [`343b74246`](https://github.com/keystonejs/keystone/commit/343b742468e01a6cf9003ee47ee2d2a6d9dbd011) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `withItemData` returning sessions that don't match an item rather than treating them as invalid

### Patch Changes

- Updated dependencies []:
  - @keystone-next/admin-ui@12.0.1

## 13.0.0

### Major Changes

- [#5087](https://github.com/keystonejs/keystone/pull/5087) [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `createKeystone` and `createSystem` to accept a migration mode rather than script

* [#5135](https://github.com/keystonejs/keystone/pull/5135) [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next dev` with the Prisma adapter so that it interactively prompts for creating and applying a migration

- [#5163](https://github.com/keystonejs/keystone/pull/5163) [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `db.useMigrations` option to replace using `keystone-next dev` and `keystone-next prototype` depending on what kind of migration strategy you want to use. If you were previously using `keystone-next dev`, you should set `db.useMigrations` to true in your config and continue using `keystone-next dev`. If you were previously using `keystone-next prototype`, you should now use `keystone-next dev`.

* [#5155](https://github.com/keystonejs/keystone/pull/5155) [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `createOnly` migration mode

- [#5163](https://github.com/keystonejs/keystone/pull/5163) [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced `MigrationMode` type with `MigrationAction` that `createSystem` and `createKeystone` now accept.

### Minor Changes

- [#3946](https://github.com/keystonejs/keystone/pull/3946) [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05) Thanks [@timleslie](https://github.com/timleslie)! - Added experimental support for Prisma + SQLite as a database adapter.

* [#5102](https://github.com/keystonejs/keystone/pull/5102) [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `none-skip-client-generation` migrationMode

- [#5148](https://github.com/keystonejs/keystone/pull/5148) [`e6b16d4e9`](https://github.com/keystonejs/keystone/commit/e6b16d4e9d95be8b3d3134931cf077b92a438806) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next deploy` to use Prisma's programmatic APIs to apply migrations

* [#5155](https://github.com/keystonejs/keystone/pull/5155) [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed `keystone-next generate` so that it uses Prisma's programmatic APIs to generate migrations and it accepts the following options as command line arguments or as prompts:

  - `--name` to set the name of the migration
  - `--accept-data-loss` to allow resetting the database when it is out of sync with the migrations
  - `--allow-empty` to create an empty migration when there are no changes to the schema

- [#5084](https://github.com/keystonejs/keystone/pull/5084) [`40d4fff5d`](https://github.com/keystonejs/keystone/commit/40d4fff5d63850cbd513c80bcb5e551e5782dc4b) Thanks [@timleslie](https://github.com/timleslie)! - Updated `context.sudo()` to provide access to all operations, including those excluded by `{ access: false }` in the public schema.

* [#5152](https://github.com/keystonejs/keystone/pull/5152) [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `keystone-next reset` to use Prisma's programmatic APIs to reset the database.

- [#4912](https://github.com/keystonejs/keystone/pull/4912) [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.graphql.apolloConfig` option to allow developers to configure the `ApolloServer` object provided by Keystone.

### Patch Changes

- [#5099](https://github.com/keystonejs/keystone/pull/5099) [`bfeb927be`](https://github.com/keystonejs/keystone/commit/bfeb927be5c80fac2dadd800295fd4789c53f1ce) Thanks [@timleslie](https://github.com/timleslie)! - Updated `context.graphql.raw` and `context.graphql.run` to use the GraphQL function `graphql` rather than `execute`. This function performs more rigorous query validation before executing the query.

* [#5096](https://github.com/keystonejs/keystone/pull/5096) [`b7ce464a2`](https://github.com/keystonejs/keystone/commit/b7ce464a261321fe3344898fa4f4a91e6fa8dbb1) Thanks [@timleslie](https://github.com/timleslie)! - Updated items API to handle static `false` access control.

- [#5150](https://github.com/keystonejs/keystone/pull/5150) [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed) Thanks [@timleslie](https://github.com/timleslie)! - Applied eslint `import/order` rule.

* [#5152](https://github.com/keystonejs/keystone/pull/5152) [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `keystone-next reset` saying that it is not a command that keystone-next accepts

* Updated dependencies [[`1eeac4722`](https://github.com/keystonejs/keystone/commit/1eeac4722da174307152dad9b5adf5062e4b6403), [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05), [`b3c4a756f`](https://github.com/keystonejs/keystone/commit/b3c4a756fd2028d1e29967392d37098419e54ec3), [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d), [`b84abebb6`](https://github.com/keystonejs/keystone/commit/b84abebb6c817172d04f338befa45b3573af55d6), [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed), [`ec6f9b601`](https://github.com/keystonejs/keystone/commit/ec6f9b601ea6fdbfb2335a5e81b7ec3f1b0e4d4d), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`e6b16d4e9`](https://github.com/keystonejs/keystone/commit/e6b16d4e9d95be8b3d3134931cf077b92a438806), [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`b3c4a756f`](https://github.com/keystonejs/keystone/commit/b3c4a756fd2028d1e29967392d37098419e54ec3), [`2bccf71b1`](https://github.com/keystonejs/keystone/commit/2bccf71b152a9be65a2df6a9751f1d7a382041ae), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`a4002b045`](https://github.com/keystonejs/keystone/commit/a4002b045b3e783971c382f9373159c04845beeb), [`4ac9148a0`](https://github.com/keystonejs/keystone/commit/4ac9148a0fa5b302d50e0ca4293206e2ef3616b7), [`2ff93692a`](https://github.com/keystonejs/keystone/commit/2ff93692aaef70474449f30fb249eae8aa33a64a), [`40d4fff5d`](https://github.com/keystonejs/keystone/commit/40d4fff5d63850cbd513c80bcb5e551e5782dc4b), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`cdd889db1`](https://github.com/keystonejs/keystone/commit/cdd889db10e440c46719bda5fad1d5f7eacbb714), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`00f980cad`](https://github.com/keystonejs/keystone/commit/00f980cadda28c0c30da8b50ff1a033365998e02), [`bafdcb7bd`](https://github.com/keystonejs/keystone/commit/bafdcb7bdcba641bb8a00689a2bcefed10f4d890), [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91), [`543232c3f`](https://github.com/keystonejs/keystone/commit/543232c3f151f2294cf63e0944d1724b7b0ac33e)]:
  - @keystone-next/fields@5.3.0
  - @keystone-next/types@15.0.0
  - @keystone-next/adapter-prisma-legacy@4.0.0
  - @keystone-next/keystone-legacy@21.0.0
  - @keystone-next/admin-ui@12.0.0
  - @keystone-next/adapter-mongoose-legacy@11.1.2
  - @keystone-next/adapter-knex-legacy@13.2.2

## 12.0.0

### Major Changes

- [#5082](https://github.com/keystonejs/keystone/pull/5082) [`a2c52848a`](https://github.com/keystonejs/keystone/commit/a2c52848a3a7b66a1968a430040887194e6138d1) Thanks [@timleslie](https://github.com/timleslie)! - Updated `createApolloServerMicro` to take system arguments rather than a `KeystoneConfig` object.

### Minor Changes

- [#5085](https://github.com/keystonejs/keystone/pull/5085) [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added an option to pass in the prisma client to use instead of attempting to generate one and `require()`ing it to fix the experimental `enableNextJsGraphqlApiEndpoint` option not working on Vercel

* [#5085](https://github.com/keystonejs/keystone/pull/5085) [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed experimental `enableNextJsGraphqlApiEndpoint` option so that it doesn't use the API Route when running through Keystone's CLI

### Patch Changes

- Updated dependencies [[`c45cbb9b1`](https://github.com/keystonejs/keystone/commit/c45cbb9b14010b3ced7ea012f3502998ba2ec393), [`a2c52848a`](https://github.com/keystonejs/keystone/commit/a2c52848a3a7b66a1968a430040887194e6138d1), [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761), [`b4b276cf6`](https://github.com/keystonejs/keystone/commit/b4b276cf66f90dce2d711c144c0d99c4752f1f5e), [`ab14e7043`](https://github.com/keystonejs/keystone/commit/ab14e70435ef89cf702d407c90396eca53bc3f4d), [`7ad7430dc`](https://github.com/keystonejs/keystone/commit/7ad7430dc377f79f7ad4024879ec2966ba0d185f)]:
  - @keystone-next/keystone-legacy@20.0.0
  - @keystone-next/admin-ui@11.0.0
  - @keystone-next/adapter-prisma-legacy@3.3.0
  - @keystone-next/app-graphql-legacy@7.0.0
  - @keystone-next/adapter-knex-legacy@13.2.1
  - @keystone-next/adapter-mongoose-legacy@11.1.1
  - @keystone-next/fields@5.2.1

## 11.0.2

### Patch Changes

- [#5079](https://github.com/keystonejs/keystone/pull/5079) [`57c98c90e`](https://github.com/keystonejs/keystone/commit/57c98c90ee4220bcc59925a154a231989d25de51) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@hapi/iron` to `^6.0.0`.

* [#5068](https://github.com/keystonejs/keystone/pull/5068) [`ed3c98839`](https://github.com/keystonejs/keystone/commit/ed3c988392bce981ef7d81c1eb14a045c6198da8) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Fixed issue where createKeystone would call prisma migrate dev when the build script was run

* Updated dependencies [[`3eabc35e0`](https://github.com/keystonejs/keystone/commit/3eabc35e0d41b60449ff456e9a0ec3eabf360508)]:
  - @keystone-next/adapter-knex-legacy@13.2.0

## 11.0.1

### Patch Changes

- [`9b202b31a`](https://github.com/keystonejs/keystone/commit/9b202b31a7d4944b709fe0ce58d6ca7ec1523a02) [#5033](https://github.com/keystonejs/keystone/pull/5033) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Added `experimental` config namespace and `enableNextJsGraphqlApiEndpoint` property to support the GraphQL API being served from a Next.js API route rather than Express

- Updated dependencies [[`7bb173018`](https://github.com/keystonejs/keystone/commit/7bb173018afc6d8af4c602dc86c5c4b471277b97), [`aba7c45d7`](https://github.com/keystonejs/keystone/commit/aba7c45d7645aa71b50de070d37896b73248751a), [`9b202b31a`](https://github.com/keystonejs/keystone/commit/9b202b31a7d4944b709fe0ce58d6ca7ec1523a02)]:
  - @keystone-next/adapter-prisma-legacy@3.2.0
  - @keystone-next/fields@5.2.0
  - @keystone-next/admin-ui@10.0.1
  - @keystone-next/types@14.0.1

## 11.0.0

### Major Changes

- [`1c5a39972`](https://github.com/keystonejs/keystone/commit/1c5a39972759a0aad49aed2c4b19e2c70a993a8a) [#4923](https://github.com/keystonejs/keystone/pull/4923) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed isAccessAllowed default so that if a session strategy is not used, access is always allowed to the Admin UI rather than never allowing access

* [`562cccbe1`](https://github.com/keystonejs/keystone/commit/562cccbe12f257a4ee13d23ed64b5ef4b325c1b1) [#4935](https://github.com/keystonejs/keystone/pull/4935) Thanks [@timleslie](https://github.com/timleslie)! - Removed `itemId` from `FieldAccessArgs` and no longer pass this value into field level imperative access control rules.

- [`24e0ef5b6`](https://github.com/keystonejs/keystone/commit/24e0ef5b6bd93c105fdef2caea6b862ff1dfd6f3) [#4945](https://github.com/keystonejs/keystone/pull/4945) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `context` argument from `KeystoneContext.graphql.raw` and `KeystoneContext.graphql.run`.

* [`d9c20ba66`](https://github.com/keystonejs/keystone/commit/d9c20ba66931077f6e18d3497282be328cfb629f) [#4832](https://github.com/keystonejs/keystone/pull/4832) Thanks [@timleslie](https://github.com/timleslie)! - Replaced the function `implementSession` with `createSessionContext`.

- [`6469362a1`](https://github.com/keystonejs/keystone/commit/6469362a15bdee579937e17527a6c31e5411312a) [#4936](https://github.com/keystonejs/keystone/pull/4936) Thanks [@timleslie](https://github.com/timleslie)! - Removed `itemIds` from `FieldAccessArgs` and no longer pass this value into field level imperative access control rules.

* [`0f86e99bb`](https://github.com/keystonejs/keystone/commit/0f86e99bb3aa15f691ab7ff79e5a9ae3d1ac464e) [#4839](https://github.com/keystonejs/keystone/pull/4839) Thanks [@timleslie](https://github.com/timleslie)! - Removed `context.graphql.createContext` from `KeystoneContext`.

### Minor Changes

- [`2655c0b1b`](https://github.com/keystonejs/keystone/commit/2655c0b1bf714d80d46e1ff4e414b4bce474c23d) [#4866](https://github.com/keystonejs/keystone/pull/4866) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.ui.isDisabled` option to completely disable the Admin UI.

* [`0cd5acb82`](https://github.com/keystonejs/keystone/commit/0cd5acb82b2e640821c092eb429401eb9d7e8e9a) [#5017](https://github.com/keystonejs/keystone/pull/5017) Thanks [@timleslie](https://github.com/timleslie)! - Added an `isVerbose` flag to `createExpressServer` to allow it to be run silently during tests.

- [`f895a2671`](https://github.com/keystonejs/keystone/commit/f895a2671d410c4faa2f354d080d8ee6cc4761f2) [#4860](https://github.com/keystonejs/keystone/pull/4860) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated the require hook used to compile code in development to use Next's Babel preset when no Babel config is present in the user's config to mirror how Keystone is built for production with Next.

* [`7ae67b857`](https://github.com/keystonejs/keystone/commit/7ae67b857745985061700b0477c3f585b3b8efbf) [#4874](https://github.com/keystonejs/keystone/pull/4874) Thanks [@timleslie](https://github.com/timleslie)! - Exported the `createExpressServer` function to support running isolated unit tests against the GraphQL API.

- [`880fd5f92`](https://github.com/keystonejs/keystone/commit/880fd5f92881796d40e994d5b64dc3cc5c61e5e6) [#4951](https://github.com/keystonejs/keystone/pull/4951) Thanks [@yannick1691](https://github.com/yannick1691)! - Added `domain` option to session options for cookies.

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

* [`687fd5ef0`](https://github.com/keystonejs/keystone/commit/687fd5ef0f798da996f970af1591411f9cfe0985) [#4835](https://github.com/keystonejs/keystone/pull/4835) Thanks [@timleslie](https://github.com/timleslie)! - Removed the unused `connect` and `disconnect` properties of `SessionStrategy`.

- [`370c0ee62`](https://github.com/keystonejs/keystone/commit/370c0ee623b515177c3863e66545465c13d5c914) [#4867](https://github.com/keystonejs/keystone/pull/4867) Thanks [@timleslie](https://github.com/timleslie)! - Removed generation of compiled configuration file from `generateAdminUI`. This is now handled by the `keystone-next build` command directly.

* [`fdb9d9abb`](https://github.com/keystonejs/keystone/commit/fdb9d9abbe1ea24a2dbb9ce6f755c713966601aa) [#4834](https://github.com/keystonejs/keystone/pull/4834) Thanks [@timleslie](https://github.com/timleslie)! - Updated `withItemData` to still return the rest of the `session` object if no item was found.

- [`ceab7dc69`](https://github.com/keystonejs/keystone/commit/ceab7dc6904df20f581d4693657043f156c2e8c9) [#5004](https://github.com/keystonejs/keystone/pull/5004) Thanks [@timleslie](https://github.com/timleslie)! - Moved session handling GraphQL schema code into the sessions module.

* [`c8cf7fb1f`](https://github.com/keystonejs/keystone/commit/c8cf7fb1fb7484d46a7e8b7c6c0b638ceae70d1a) [#4854](https://github.com/keystonejs/keystone/pull/4854) Thanks [@timleslie](https://github.com/timleslie)! - Added more specific types to implementation of access control validators.

* Updated dependencies [[`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7), [`f32316e6d`](https://github.com/keystonejs/keystone/commit/f32316e6deafdb9001874b08e3f4203250728676), [`1c5a39972`](https://github.com/keystonejs/keystone/commit/1c5a39972759a0aad49aed2c4b19e2c70a993a8a), [`687fd5ef0`](https://github.com/keystonejs/keystone/commit/687fd5ef0f798da996f970af1591411f9cfe0985), [`9a9276eb7`](https://github.com/keystonejs/keystone/commit/9a9276eb7acded979b703b4f3ed8bce781e0718a), [`370c0ee62`](https://github.com/keystonejs/keystone/commit/370c0ee623b515177c3863e66545465c13d5c914), [`2655c0b1b`](https://github.com/keystonejs/keystone/commit/2655c0b1bf714d80d46e1ff4e414b4bce474c23d), [`6f985acc7`](https://github.com/keystonejs/keystone/commit/6f985acc775d6037ac69a01215f962285de78c75), [`4eb4753e4`](https://github.com/keystonejs/keystone/commit/4eb4753e45e5a6ca37bdc756aef7adda7f551da4), [`53b8b659f`](https://github.com/keystonejs/keystone/commit/53b8b659ffc7db41e0e0d9ad7393e6a821187340), [`29e787983`](https://github.com/keystonejs/keystone/commit/29e787983bdc26b147d6b5f476e70768bbc5318c), [`d9c20ba66`](https://github.com/keystonejs/keystone/commit/d9c20ba66931077f6e18d3497282be328cfb629f), [`0e265f6c1`](https://github.com/keystonejs/keystone/commit/0e265f6c10eadd37f75e5551b22b50236e830086), [`24e0ef5b6`](https://github.com/keystonejs/keystone/commit/24e0ef5b6bd93c105fdef2caea6b862ff1dfd6f3), [`45ea93421`](https://github.com/keystonejs/keystone/commit/45ea93421f9a6cf9b7ccbd983e0c9cbd687ff6af), [`6c949dbf2`](https://github.com/keystonejs/keystone/commit/6c949dbf262350e280072d82cd48fdd31ff5ba6d), [`891cd490a`](https://github.com/keystonejs/keystone/commit/891cd490a17026f4af29f0ed9b9ca411747d1d63), [`bea9008f8`](https://github.com/keystonejs/keystone/commit/bea9008f82efea7fcf1cb547f3841915cd4689cc), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc), [`00f19daee`](https://github.com/keystonejs/keystone/commit/00f19daee8bbd75fb58fb76caaa9a3de70ebfcac), [`00f19daee`](https://github.com/keystonejs/keystone/commit/00f19daee8bbd75fb58fb76caaa9a3de70ebfcac), [`a16d2cbff`](https://github.com/keystonejs/keystone/commit/a16d2cbffd9aa57d0cbdd783ff5ff0c699ff2d8b), [`c63e5d75c`](https://github.com/keystonejs/keystone/commit/c63e5d75cd77cf26f8762bda8143d1c1db6d0e3e), [`0f86e99bb`](https://github.com/keystonejs/keystone/commit/0f86e99bb3aa15f691ab7ff79e5a9ae3d1ac464e), [`f826f15c6`](https://github.com/keystonejs/keystone/commit/f826f15c6e00fcfcef6d9153b261e8977f5117f1), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc)]:
  - @keystone-next/admin-ui@10.0.0
  - @keystone-next/fields@5.1.0
  - @keystone-next/types@14.0.0
  - @keystone-next/adapter-knex-legacy@13.1.0
  - @keystone-next/adapter-mongoose-legacy@11.1.0
  - @keystone-next/adapter-prisma-legacy@3.1.0
  - @keystone-next/app-graphql-legacy@6.2.2
  - @keystone-next/keystone-legacy@19.3.0
  - @keystone-next/server-side-graphql-client-legacy@2.0.1

## 10.0.0

### Major Changes

- [`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee) [#4783](https://github.com/keystonejs/keystone/pull/4783) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced views hashes with indexes so that if the path to a view is different between the build and the running instance, the Admin UI does not break

* [`e29ae2749`](https://github.com/keystonejs/keystone/commit/e29ae2749321c103dd494eba6778ee4137bb2aa3) [#4818](https://github.com/keystonejs/keystone/pull/4818) Thanks [@timleslie](https://github.com/timleslie)! - Added `context.exitSudo()` and `context.withSession(session)` methods. Removed `context.createContext()`.

### Minor Changes

- [`4035218df`](https://github.com/keystonejs/keystone/commit/4035218df390beff3d42c0d3fc21335230d8a60d) [#4512](https://github.com/keystonejs/keystone/pull/4512) Thanks [@renovate](https://github.com/apps/renovate)! - Upgraded dependency `apollo-server-express` to `^2.21.0`. Apollo Server can now be installed with `graphql@15` without causing peer dependency errors or warnings.

* [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0) [#4815](https://github.com/keystonejs/keystone/pull/4815) Thanks [@timleslie](https://github.com/timleslie)! - Added a `.sudo()` method to `context` objects, which is equivalent to the common operation `context.createContext({ skipAccessControl: true })`.

### Patch Changes

- [`74f428353`](https://github.com/keystonejs/keystone/commit/74f428353b90958f97669cbcb78e18ca44438765) [#4799](https://github.com/keystonejs/keystone/pull/4799) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Improve type-safety of admin meta GraphQL API implementation

* [`a418fd535`](https://github.com/keystonejs/keystone/commit/a418fd5351b0070aab05380b658065be7916fb2a) [#4820](https://github.com/keystonejs/keystone/pull/4820) Thanks [@timleslie](https://github.com/timleslie)! - Updated `storedSessions` to internally manage store connection state.

- [`250daa2a2`](https://github.com/keystonejs/keystone/commit/250daa2a2c2693f415d9499a531095f3caf2a1d5) [#4808](https://github.com/keystonejs/keystone/pull/4808) Thanks [@timleslie](https://github.com/timleslie)! - Updated types of session functions.

- Updated dependencies [[`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf), [`208722a42`](https://github.com/keystonejs/keystone/commit/208722a4234434e116846756bab18f7e11674ec8), [`ad75e3d61`](https://github.com/keystonejs/keystone/commit/ad75e3d61c73ba1239fd21b58f175aac01d9f302), [`a0931858e`](https://github.com/keystonejs/keystone/commit/a0931858e499d9504e4e822b850dcf89c3cdac60), [`d8f64887f`](https://github.com/keystonejs/keystone/commit/d8f64887f2aa428ea8ac35d0efa50ce05534f40b), [`45b047ad0`](https://github.com/keystonejs/keystone/commit/45b047ad015fc9d72cf8c2b85529ffe3abbc189e), [`74f428353`](https://github.com/keystonejs/keystone/commit/74f428353b90958f97669cbcb78e18ca44438765), [`4035218df`](https://github.com/keystonejs/keystone/commit/4035218df390beff3d42c0d3fc21335230d8a60d), [`954350389`](https://github.com/keystonejs/keystone/commit/9543503894c3e78a9b69a75cbfb3ca6b85ae34e8), [`e29ae2749`](https://github.com/keystonejs/keystone/commit/e29ae2749321c103dd494eba6778ee4137bb2aa3), [`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0)]:
  - @keystone-next/admin-ui@9.0.0
  - @keystone-next/fields@5.0.0
  - @keystone-next/types@13.0.0
  - @keystonejs/adapter-mongoose@11.0.1
  - @keystonejs/adapter-prisma@3.0.1
  - @keystonejs/adapter-knex@13.0.1
  - @keystonejs/keystone@19.2.0
  - @keystonejs/server-side-graphql-client@2.0.0

## 9.3.1

### Patch Changes

- [`75d3c521e`](https://github.com/keystonejs/keystone/commit/75d3c521e4f1f0a1eec9bc91319839a2afc000e0) [#4770](https://github.com/keystonejs/keystone/pull/4770) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded Next.js dependency to `10.0.5`.

- Updated dependencies [[`6ecd2a766`](https://github.com/keystonejs/keystone/commit/6ecd2a766c868d46f84291bc1611eadef79e6100), [`777981069`](https://github.com/keystonejs/keystone/commit/7779810691c4154e1344ced4fb94c5bb9524a71f), [`75d3c521e`](https://github.com/keystonejs/keystone/commit/75d3c521e4f1f0a1eec9bc91319839a2afc000e0), [`4d808eaa5`](https://github.com/keystonejs/keystone/commit/4d808eaa5aa1593ad1e54000d80f674f7c4d12bd)]:
  - @keystone-next/types@12.0.1
  - @keystone-next/admin-ui@8.0.2

## 9.3.0

### Minor Changes

- [`fd0dff3fd`](https://github.com/keystonejs/keystone/commit/fd0dff3fdfcbe20b2884357a6e1b20f1b7307652) [#4669](https://github.com/keystonejs/keystone/pull/4669) Thanks [@MurzNN](https://github.com/MurzNN)! - Added the ability to set the server port number via `config.server.port`.

### Patch Changes

- [`26543bd07`](https://github.com/keystonejs/keystone/commit/26543bd0752c470e336d61644c14e6a5333f65c0) [#4758](https://github.com/keystonejs/keystone/pull/4758) Thanks [@timleslie](https://github.com/timleslie)! - Improved help message of the `keystone-next` CLI.

* [`096927a68`](https://github.com/keystonejs/keystone/commit/096927a6813a23030988ba8b64b2e8452f571a33) [#4756](https://github.com/keystonejs/keystone/pull/4756) Thanks [@timleslie](https://github.com/timleslie)! - Added correct types for `config.server.cors`.

* Updated dependencies [[`1744c5f05`](https://github.com/keystonejs/keystone/commit/1744c5f05c9a13e680aaa1ed151f23f1d015ed9c), [`d9675553b`](https://github.com/keystonejs/keystone/commit/d9675553b33f39e2c7ada7eb6555d16e9fccb37e), [`3c1fa3203`](https://github.com/keystonejs/keystone/commit/3c1fa3203a6a9eeb2525c256f858f2e6cebea804), [`fd0dff3fd`](https://github.com/keystonejs/keystone/commit/fd0dff3fdfcbe20b2884357a6e1b20f1b7307652), [`5be53ddc3`](https://github.com/keystonejs/keystone/commit/5be53ddc39be1415d56e2fa5e7898ab9edf468d5), [`fb8bcff91`](https://github.com/keystonejs/keystone/commit/fb8bcff91ef487730164c3330e0742ab13d9b3d7), [`096927a68`](https://github.com/keystonejs/keystone/commit/096927a6813a23030988ba8b64b2e8452f571a33)]:
  - @keystone-next/types@12.0.0
  - @keystonejs/keystone@19.1.0
  - @keystone-next/admin-ui@8.0.1
  - @keystone-next/fields@4.1.1

## 9.2.0

### Minor Changes

- [`94fbb45f1`](https://github.com/keystonejs/keystone/commit/94fbb45f1920781423f6a8e489e812b74a260099) [#4728](https://github.com/keystonejs/keystone/pull/4728) Thanks [@timleslie](https://github.com/timleslie)! - Added new CLI options to support migrations in the Prisma adapter: `prototype`, `reset`, `generate`, and `deploy`.

### Patch Changes

- [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9) [#3222](https://github.com/keystonejs/keystone/pull/3222) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for multiple database adapters in a single `Keystone` system. The `adapters` and `defaultAdapter` config options were removed from the `Keystone()` constructor. If you were accessing the adapter object via `keystone.adapters.KnexAdapter` or `keystone.adapters.MongooseAdapter` you should now simply access `keystone.adapter`.

- Updated dependencies [[`a886039a1`](https://github.com/keystonejs/keystone/commit/a886039a1fc17c9b60b2955f0e58916ab1c3d7bf), [`94fbb45f1`](https://github.com/keystonejs/keystone/commit/94fbb45f1920781423f6a8e489e812b74a260099), [`749d1c86c`](https://github.com/keystonejs/keystone/commit/749d1c86c89690ef10014a4a0a12641eb24bfe1d), [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9)]:
  - @keystonejs/adapter-prisma@3.0.0
  - @keystone-next/types@11.0.2
  - @keystonejs/adapter-knex@13.0.0
  - @keystonejs/adapter-mongoose@11.0.0
  - @keystonejs/keystone@19.0.0

## 9.1.0

### Minor Changes

- [`fe0c228b1`](https://github.com/keystonejs/keystone/commit/fe0c228b12530f6d384fa5eed9d5086768a24782) [#4676](https://github.com/keystonejs/keystone/pull/4676) Thanks [@timleslie](https://github.com/timleslie)! - Prisma artefacts are now generated in the `.keystone/prisma` directory.

### Patch Changes

- [`ac3db9561`](https://github.com/keystonejs/keystone/commit/ac3db95613093de83e2369f624ce9b6c77bb8eda) [#4690](https://github.com/keystonejs/keystone/pull/4690) Thanks [@timleslie](https://github.com/timleslie)! - Factored out `createKeystone` into a separate module.

* [`f162a9d72`](https://github.com/keystonejs/keystone/commit/f162a9d72859ae7f2932bf0859c712861918b9e6) [#4675](https://github.com/keystonejs/keystone/pull/4675) Thanks [@timleslie](https://github.com/timleslie)! - Identified static paths required to locate configuration files.

* Updated dependencies [[`6b95cb6e4`](https://github.com/keystonejs/keystone/commit/6b95cb6e4d5bea3a87e22765d5fcf31db2fc31ae), [`fc2b7101f`](https://github.com/keystonejs/keystone/commit/fc2b7101f35f20e4d729269a005816546bb37464), [`a96c24cca`](https://github.com/keystonejs/keystone/commit/a96c24ccab8dadc9e8f0131fe6509abd64a776f5), [`e7d4d54e5`](https://github.com/keystonejs/keystone/commit/e7d4d54e5b94e6b376d6eab28a0f2b074f2c95ed), [`a62a2d996`](https://github.com/keystonejs/keystone/commit/a62a2d996f1080051f7962b7063ae37d7e8b7e63)]:
  - @keystonejs/adapter-prisma@2.0.0
  - @keystone-next/types@11.0.1

## 9.0.2

### Patch Changes

- [`59027f8a4`](https://github.com/keystonejs/keystone/commit/59027f8a41cb11632f7c1eb5b3a8092193ecc87e) [#4665](https://github.com/keystonejs/keystone/pull/4665) Thanks [@timleslie](https://github.com/timleslie)! - Added a `projectAdminPath` argument to `buildAdminUI`, `createAdminUIServer`, and `generateAdminUI`, which replaces the hard-coded `.keystone/admin`.

* [`e11b111c7`](https://github.com/keystonejs/keystone/commit/e11b111c7e4a87c7a31108b9f5adbc546caaac35) [#4663](https://github.com/keystonejs/keystone/pull/4663) Thanks [@timleslie](https://github.com/timleslie)! - Cleaned up CLI script code.

- [`283a6694a`](https://github.com/keystonejs/keystone/commit/283a6694ac461d0be980d7796f88efadd4fe108e) [#4656](https://github.com/keystonejs/keystone/pull/4656) Thanks [@timleslie](https://github.com/timleslie)! - Updated calls to `keystone.connect()` with a `{ context }` argument to be used by `config.db.onConnect`.

* [`7ffd2ebb4`](https://github.com/keystonejs/keystone/commit/7ffd2ebb42dfaf12e23ba166b44ec4db60d9824b) [#4662](https://github.com/keystonejs/keystone/pull/4662) Thanks [@timleslie](https://github.com/timleslie)! - Remove type `KeystoneSystem`.

- [`0df2fb79c`](https://github.com/keystonejs/keystone/commit/0df2fb79c56094b5cdc0be6a0d6c2812ff0ec7f9) [#4657](https://github.com/keystonejs/keystone/pull/4657) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `system` argument to `createAdminUIServer` with `createContext`.

* [`d090053df`](https://github.com/keystonejs/keystone/commit/d090053df9545380c42ddd18fae6782f3c3e2719) [#4661](https://github.com/keystonejs/keystone/pull/4661) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `system` arg to `generateAdminUI` with `graphQLSchema, keystone`.

* Updated dependencies [[`49eec4dea`](https://github.com/keystonejs/keystone/commit/49eec4dea522c6a043b3eaf93fc8be8256b00aa6), [`3b7a056bb`](https://github.com/keystonejs/keystone/commit/3b7a056bb835482ceb408a70bf97300741552d19), [`4768fbf83`](https://github.com/keystonejs/keystone/commit/4768fbf831ffff648e540c479a1954ae40e05aaa), [`59027f8a4`](https://github.com/keystonejs/keystone/commit/59027f8a41cb11632f7c1eb5b3a8092193ecc87e), [`0d9404768`](https://github.com/keystonejs/keystone/commit/0d94047686d1bb1308fd8c47b769c999390d8f6d), [`b81a11c17`](https://github.com/keystonejs/keystone/commit/b81a11c171f3627f6cecb66bd2faeb89a68a009e), [`7ffd2ebb4`](https://github.com/keystonejs/keystone/commit/7ffd2ebb42dfaf12e23ba166b44ec4db60d9824b), [`0df2fb79c`](https://github.com/keystonejs/keystone/commit/0df2fb79c56094b5cdc0be6a0d6c2812ff0ec7f9), [`d090053df`](https://github.com/keystonejs/keystone/commit/d090053df9545380c42ddd18fae6782f3c3e2719), [`177cbd530`](https://github.com/keystonejs/keystone/commit/177cbd5303b814d1acaa8ded98e3d114c770bdba), [`74a8528ea`](https://github.com/keystonejs/keystone/commit/74a8528ea0dad739f4f16af32fe4f8926a188b61), [`831db7c2b`](https://github.com/keystonejs/keystone/commit/831db7c2b7a9bced87acf76e3f431ca88a8880b0), [`a36bcf847`](https://github.com/keystonejs/keystone/commit/a36bcf847806ca0739f7b44d49a9bf6ac26a38d4), [`6ea4ff3cf`](https://github.com/keystonejs/keystone/commit/6ea4ff3cf77d5d2278bf4f0415d11aa7399a0490)]:
  - @keystonejs/adapter-prisma@1.1.2
  - @keystonejs/keystone@18.1.0
  - @keystone-next/types@11.0.0
  - @keystone-next/admin-ui@8.0.0
  - @keystone-next/fields@4.1.0
  - @keystonejs/adapter-knex@12.0.4
  - @keystonejs/adapter-mongoose@10.1.2
  - @keystonejs/app-graphql@6.2.1

## 9.0.1

### Patch Changes

- Updated dependencies [[`24ecd72e5`](https://github.com/keystonejs/keystone/commit/24ecd72e54eee12442c7c1d0533936a9ad86620a)]:
  - @keystone-next/admin-ui@7.0.1
  - @keystone-next/fields@4.0.3
  - @keystone-next/types@10.0.0

## 9.0.0

### Major Changes

- [`89f7d4599`](https://github.com/keystonejs/keystone/commit/89f7d459906072940da1355c38815d1b3ef49368) [#4586](https://github.com/keystonejs/keystone/pull/4586) Thanks [@timleslie](https://github.com/timleslie)! - Removed `adminMeta` from `KeystoneSystem`. `getAdminMetaSchema` now takes a `BaseKeystone` argument `keystone` rather than `adminMeta`.

* [`abc5440dc`](https://github.com/keystonejs/keystone/commit/abc5440dc5ee8d8cdd6ddddb32cf21bd2c3fc324) [#4573](https://github.com/keystonejs/keystone/pull/4573) Thanks [@timleslie](https://github.com/timleslie)! - Updated `initConfig` to return a copy of the `config` object, rather than modifying the object.

### Minor Changes

- [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95) [#4588](https://github.com/keystonejs/keystone/pull/4588) Thanks [@timleslie](https://github.com/timleslie)! - Updated graphql server to use the `graphql-upload` package directly to support uploads, rather than the built-in support provided by Apollo Server.

### Patch Changes

- [`933c78a1e`](https://github.com/keystonejs/keystone/commit/933c78a1edc070b63f7720f64c15421ba28bdde5) [#4587](https://github.com/keystonejs/keystone/pull/4587) Thanks [@timleslie](https://github.com/timleslie)! - Use `keystone.getTypeDefs` and `keystone.getResolvers` when creating the graphQL schema.

- Updated dependencies [[`1236f5f40`](https://github.com/keystonejs/keystone/commit/1236f5f4024f1698b5a39343b4e5dbfa42c5fc9c), [`933c78a1e`](https://github.com/keystonejs/keystone/commit/933c78a1edc070b63f7720f64c15421ba28bdde5), [`f559e680b`](https://github.com/keystonejs/keystone/commit/f559e680bad7a7c948a317adfb91a3b024b486c4), [`89f7d4599`](https://github.com/keystonejs/keystone/commit/89f7d459906072940da1355c38815d1b3ef49368), [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95), [`cf2819544`](https://github.com/keystonejs/keystone/commit/cf2819544426def260ada5eb18fdc9b8a01e9438), [`1200c3562`](https://github.com/keystonejs/keystone/commit/1200c356272ae8deea9da4267ce62c1449498e95), [`17519bf64`](https://github.com/keystonejs/keystone/commit/17519bf64f277ad154fad1b0d5a423048e1336e0)]:
  - @keystone-next/admin-ui@7.0.0
  - @keystone-next/types@9.0.0
  - @keystonejs/keystone@18.0.0
  - @keystonejs/app-graphql@6.2.0
  - @keystonejs/adapter-mongoose@10.1.1
  - @keystone-next/fields@4.0.2
  - @keystonejs/adapter-knex@12.0.3
  - @keystonejs/adapter-prisma@1.1.1

## 8.0.0

### Major Changes

- [`075ef1628`](https://github.com/keystonejs/keystone/commit/075ef16281a89c8291f90275adca98f042cc54da) [#4547](https://github.com/keystonejs/keystone/pull/4547) Thanks [@timleslie](https://github.com/timleslie)! - Removed `allViews` from `KeystoneSystem` type. `createAdminMeta` no longer returns `allViews`.

### Patch Changes

- Updated dependencies [[`075ef1628`](https://github.com/keystonejs/keystone/commit/075ef16281a89c8291f90275adca98f042cc54da)]:
  - @keystone-next/admin-ui@6.0.0
  - @keystone-next/types@8.0.0
  - @keystone-next/fields@4.0.1

## 7.0.0

### Major Changes

- [`481e456ac`](https://github.com/keystonejs/keystone/commit/481e456ac4158207436ddd9be18fdca0f27b6409) [#4533](https://github.com/keystonejs/keystone/pull/4533) Thanks [@timleslie](https://github.com/timleslie)! - Renamed to `SessionImplementation.createContext` to `createSessionContext`.

### Minor Changes

- [`44c78319e`](https://github.com/keystonejs/keystone/commit/44c78319ed8cfb1000eb4b1aca5eb361376584b4) [#4535](https://github.com/keystonejs/keystone/pull/4535) Thanks [@timleslie](https://github.com/timleslie)! - Exported the `initConfig` function.

* [`6d09df338`](https://github.com/keystonejs/keystone/commit/6d09df3381d1682b8002d52ed1696b661fdff035) [#4523](https://github.com/keystonejs/keystone/pull/4523) Thanks [@timleslie](https://github.com/timleslie)! - Added support for all database adapter configuration options.

- [`4d3cb8e32`](https://github.com/keystonejs/keystone/commit/4d3cb8e32b22250fdbe04af758b0aad727ba63e4) [#4548](https://github.com/keystonejs/keystone/pull/4548) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `build` and `start` command

* [`2308e5efc`](https://github.com/keystonejs/keystone/commit/2308e5efc7c6893c87652411496b15a8124f6e05) [#4527](https://github.com/keystonejs/keystone/pull/4527) Thanks [@timleslie](https://github.com/timleslie)! - Added an optional `req` property to the `KeystoneContext` type.

### Patch Changes

- [`2d3668c49`](https://github.com/keystonejs/keystone/commit/2d3668c49d1913afecbacf2b5ef164e553210956) [#4495](https://github.com/keystonejs/keystone/pull/4495) Thanks [@timleslie](https://github.com/timleslie)! - Removed `cwd` argument from `generateAdminUI`. Refactored and simplified implementation of `generateAdminUI`.

* [`e33cf0c1e`](https://github.com/keystonejs/keystone/commit/e33cf0c1e78ae69cffaf45009e47ca1198464cf2) [#4532](https://github.com/keystonejs/keystone/pull/4532) Thanks [@timleslie](https://github.com/timleslie)! - Moved `templates/adminMetaSchemaExtension.ts` to `system/getAdminMetaSchema.ts`.

- [`fd5daefb4`](https://github.com/keystonejs/keystone/commit/fd5daefb4966b10cf8047386d19db14d325ef8c5) [#4530](https://github.com/keystonejs/keystone/pull/4530) Thanks [@timleslie](https://github.com/timleslie)! - Updated `printGeneratedTypes` to accept explicit `keystone` and `graphQLSchema` arguments.

* [`a3908a675`](https://github.com/keystonejs/keystone/commit/a3908a675614fa8690ea641a124cc57c9f963618) [#4524](https://github.com/keystonejs/keystone/pull/4524) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed an issue where invalid items would crash session initialisation

- [`c1e8def9a`](https://github.com/keystonejs/keystone/commit/c1e8def9a4204d685a796e267edc50f6ef2e8c51) [#4531](https://github.com/keystonejs/keystone/pull/4531) Thanks [@timleslie](https://github.com/timleslie)! - Updated `addApolloServer` to accept explicit `createContext` and `graphQLSchema` arguments.

* [`08398473b`](https://github.com/keystonejs/keystone/commit/08398473bb81dfd43a3c134ed8de61e45aa770f0) [#4545](https://github.com/keystonejs/keystone/pull/4545) Thanks [@timleslie](https://github.com/timleslie)! - Moved `createAdminMeta` into the `@keystone-next/admin-ui` package.

* Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0), [`2d3668c49`](https://github.com/keystonejs/keystone/commit/2d3668c49d1913afecbacf2b5ef164e553210956), [`6912c7b9d`](https://github.com/keystonejs/keystone/commit/6912c7b9dc3d786e61e6f657b0886b258d942c30), [`e33cf0c1e`](https://github.com/keystonejs/keystone/commit/e33cf0c1e78ae69cffaf45009e47ca1198464cf2), [`defd05365`](https://github.com/keystonejs/keystone/commit/defd05365f31d0d6d4b6fd9ffe0a0c3928f97e79), [`5c75534f6`](https://github.com/keystonejs/keystone/commit/5c75534f6e9e0f10a6556a1f1dc87b5fdd986dd4), [`6d09df338`](https://github.com/keystonejs/keystone/commit/6d09df3381d1682b8002d52ed1696b661fdff035), [`d329f07a5`](https://github.com/keystonejs/keystone/commit/d329f07a5ce7ebf5d658a7f90334ba4372a2a72d), [`39639b203`](https://github.com/keystonejs/keystone/commit/39639b2031bb749067ef537ea47e5d93a8bb89da), [`661104764`](https://github.com/keystonejs/keystone/commit/66110476491953af2134cd3cd4e3ef7c361ac5da), [`dab8121a6`](https://github.com/keystonejs/keystone/commit/dab8121a6a8eae4c42a5a9ecbdb72a3e8b1eeda4), [`481e456ac`](https://github.com/keystonejs/keystone/commit/481e456ac4158207436ddd9be18fdca0f27b6409), [`08398473b`](https://github.com/keystonejs/keystone/commit/08398473bb81dfd43a3c134ed8de61e45aa770f0), [`2308e5efc`](https://github.com/keystonejs/keystone/commit/2308e5efc7c6893c87652411496b15a8124f6e05), [`4d3cb8e32`](https://github.com/keystonejs/keystone/commit/4d3cb8e32b22250fdbe04af758b0aad727ba63e4), [`f2c7675fb`](https://github.com/keystonejs/keystone/commit/f2c7675fb51ed41e6df8248c76b9322d6de5ee0d)]:
  - @keystonejs/adapter-mongoose@10.1.0
  - @keystone-next/fields@4.0.0
  - @keystone-next/admin-ui@5.0.0
  - @keystonejs/adapter-prisma@1.1.0
  - @keystone-next/types@7.0.0

## 6.0.0

### Major Changes

- [`dc58df5c8`](https://github.com/keystonejs/keystone/commit/dc58df5c87d694ce94b7d1c2b20d4976176dbd13) [#4493](https://github.com/keystonejs/keystone/pull/4493) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `SerializedFieldMeta.views` to `SerializedFieldMeta.viewsIndex` to makes it clear that this is the index, not the views object itself.

* [`c89b43d07`](https://github.com/keystonejs/keystone/commit/c89b43d076f157041c154473221785e41589936f) [#4453](https://github.com/keystonejs/keystone/pull/4453) Thanks [@timleslie](https://github.com/timleslie)! - `context.createContext()` now inherits the argument values for `sessionContext` and `skipAccessControl` from `context` as defaults.

  This means, for example, that

  ```js
  context.createContext({ skipAccessControl: true });
  ```

  will create a new context with the same `sessionContext` that the original `context` object had.

- [`a5d7b264a`](https://github.com/keystonejs/keystone/commit/a5d7b264ad3e5590e335758881d22f7f296203c9) [#4473](https://github.com/keystonejs/keystone/pull/4473) Thanks [@timleslie](https://github.com/timleslie)! - Added a `resolveFields: false | string` argument to the items API methods.

  This function controls the return type of the methods on the items API.
  If a `string` value is provided, it will be interpreted as a graphQL field specification fragment.
  The method will construct and run a graphQL operation and return the values specified by `resolveFields`.
  The default value for `resolveFields` is `id`.

  For example, to find the title and author name for all posts in our system we would run:

  ```js
  const posts = await context.lists.Post.findMany({ resolveFields: 'id title author { id name }' });
  ```

  If `resolveFields: false` is provided, this indicates to the method that no field-resolving is desired.
  Instead, the method will return the result of the item-level resolver for the corresponding operation.
  These objects are the internal data representation of the items in the system which would normally be passed to the field resolvers.

  This flag is most useful in two specific scenarios. Firstly, if you need to inspect data which isn't generally available as a graphQL field, such as password hash values.

  Secondly, if you are writing a custom mutation which returns a list item type, such as `Post`. For example

  ```js
  export const extendGraphqlSchema = graphQLSchemaExtension({
    typeDefs: `
      type Mutation {
        topPost(userId: ID): Post
      }
    `,
    resolvers: {
      Mutation: {
        topPost: (root, { userId }: { userId: string }, context) => {
          return context.lists.Post.findMany({
            where: { user: { id: userId } },
            first: 1,
            sortBy: ['stars_DESC'],
            resolveFields: false,
          });
        },
      },
    },
  });
  ```

* [`b7a4b997b`](https://github.com/keystonejs/keystone/commit/b7a4b997bae5b2269bea0ad94ca771e63c26ab95) [#4501](https://github.com/keystonejs/keystone/pull/4501) Thanks [@timleslie](https://github.com/timleslie)! - Removed `sessionImplementation` from `KeystoneSystem` and instead pass it explicitly where needed.

- [`ca34424d5`](https://github.com/keystonejs/keystone/commit/ca34424d58e58cc4a657828b1362978be8ee4f62) [#4494](https://github.com/keystonejs/keystone/pull/4494) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `KeystoneSystem.views` to `KeystoneSystem.allViews`.

* [`b21b62ed5`](https://github.com/keystonejs/keystone/commit/b21b62ed59fcd83ef2fc89587544b9d64522ba27) [#4477](https://github.com/keystonejs/keystone/pull/4477) Thanks [@timleslie](https://github.com/timleslie)! - Changed the type `SessionContext` to have parameters `startSession` and `endSession` as required. This type also takes a type parameter `T` which corresponds to the data type of the `data` argument to `startSession`.

- [`2da044a0c`](https://github.com/keystonejs/keystone/commit/2da044a0cb22dc16a54b7b5555c2b2678e8d4cab) [#4482](https://github.com/keystonejs/keystone/pull/4482) Thanks [@timleslie](https://github.com/timleslie)! - Removed `config` from type `KeystoneSystem`. The config object is now explicitly passed around where needed to make it clear which code is consuming it.
  Type `KeystoneAdminUIConfig.getAdditionalFiles` now takes a `config` parameter.

* [`3f3c65ab2`](https://github.com/keystonejs/keystone/commit/3f3c65ab2d206ef1c72f17259e73fb24a79f0a9b) [#4458](https://github.com/keystonejs/keystone/pull/4458) Thanks [@timleslie](https://github.com/timleslie)! - Removed `createContextFromRequest` and `createSessionContext` from `KeystoneSystem` and replaced them with `sessionImplementation`, which provides the same core functionality.

- [`fe52e25e0`](https://github.com/keystonejs/keystone/commit/fe52e25e04db121adbc6a0ce3bd0dbe1c7270180) [#4492](https://github.com/keystonejs/keystone/pull/4492) Thanks [@timleslie](https://github.com/timleslie)! - Replaced the `system` argument on `SessionStrategy.start`, '.end`, and`.get`with`createContext`.

* [`c9c96cf71`](https://github.com/keystonejs/keystone/commit/c9c96cf718fce657ed15a75ae8e836dcedcf5326) [#4452](https://github.com/keystonejs/keystone/pull/4452) Thanks [@timleslie](https://github.com/timleslie)! - The items API (`context.lists.Post.findOne()`, etc) now use the `context` object they are bound to, rather than creating a new context object with `{ skipAccessControl: true }` when executing the operation.

  If you were relying on this behaviour you should change your code from:

  ```js
  context.lists.Post.findOne(...)
  ```

  to

  ```js
  context.createContext({ skipAccessControl: true }).lists.Post.findOne(...)
  ```

### Minor Changes

- [`68d361d25`](https://github.com/keystonejs/keystone/commit/68d361d2596e8811caf00390c60341ef0c233c7b) [#4467](https://github.com/keystonejs/keystone/pull/4467) Thanks [@timleslie](https://github.com/timleslie)! - Added type for `BaseKeystone.createApolloServer()`.

### Patch Changes

- [`cffa011f7`](https://github.com/keystonejs/keystone/commit/cffa011f79a49e2f5c9165f82e6dff09a88a5b6d) [#4456](https://github.com/keystonejs/keystone/pull/4456) Thanks [@timleslie](https://github.com/timleslie)! - Refactored code to use the original `config` object, rather than `system.config`.

* [`192cbed74`](https://github.com/keystonejs/keystone/commit/192cbed74267b68be7de632667261ab943be1e2a) [#4499](https://github.com/keystonejs/keystone/pull/4499) Thanks [@timleslie](https://github.com/timleslie)! - Updated and renamed `adminMetaSchemaExtension` to no longer perform the schema merge operation. It now simply returns `{ typeDefs, resolvers }` and allows the calling function to merge them as required, and is renamed to `getAdminMetaSchema`.

- [`e78d837b1`](https://github.com/keystonejs/keystone/commit/e78d837b18fba820d3e42cb163420426e2cd3c38) [#4460](https://github.com/keystonejs/keystone/pull/4460) Thanks [@timleslie](https://github.com/timleslie)! - Renamed helper function `sessionStrategy` to `asSessionStrategy` to avoid naming clashes.

* [`914beac0e`](https://github.com/keystonejs/keystone/commit/914beac0ed8e702b1dcd606e2f67c940b053310b) [#4471](https://github.com/keystonejs/keystone/pull/4471) Thanks [@timleslie](https://github.com/timleslie)! - Simplified session and system creation code now that `SessionStrategy.end` and `.start` are required fields.

- [`554917760`](https://github.com/keystonejs/keystone/commit/554917760cc76209c034b96452781c61c60d94d0) [#4454](https://github.com/keystonejs/keystone/pull/4454) Thanks [@timleslie](https://github.com/timleslie)! - Decoupled DB connection from Admin UI server setup.

* [`341ee2b4b`](https://github.com/keystonejs/keystone/commit/341ee2b4b7eab89f296146ff9e14ce53233235f6) [#4475](https://github.com/keystonejs/keystone/pull/4475) Thanks [@timleslie](https://github.com/timleslie)! - Use `SerializedAdminMeta` in `createGraphQLSchema` and `FieldType<...>.getAdminMeta?`.

- [`340253f14`](https://github.com/keystonejs/keystone/commit/340253f14235084265c6a02fe5958e476f8554ef) [#4455](https://github.com/keystonejs/keystone/pull/4455) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `createAdminUIServer` to `createExpressServer` to better capture what this module is doing.

* [`224aeb859`](https://github.com/keystonejs/keystone/commit/224aeb859ef30dbea57587efbc54d03074175fba) [#4451](https://github.com/keystonejs/keystone/pull/4451) Thanks [@timleslie](https://github.com/timleslie)! - Factored out item API argument processing functions.

- [`ebc9ad096`](https://github.com/keystonejs/keystone/commit/ebc9ad0962cb15ac9863268cf857216e51d51b98) [#4500](https://github.com/keystonejs/keystone/pull/4500) Thanks [@timleslie](https://github.com/timleslie)! - Removed dependency on `adminMeta` object for generating schema types.

* [`7f571dc7d`](https://github.com/keystonejs/keystone/commit/7f571dc7d7c481942ee9d390736e4ea2c083c81c) [#4459](https://github.com/keystonejs/keystone/pull/4459) Thanks [@timleslie](https://github.com/timleslie)! - Refactored dev script to apply `applyIdFieldDefaults` before sending `config` object to `createSystem`.

- [`bf22d9f2a`](https://github.com/keystonejs/keystone/commit/bf22d9f2afe537111b95571b86d4fd2759eb6a98) [#4498](https://github.com/keystonejs/keystone/pull/4498) Thanks [@timleslie](https://github.com/timleslie)! - Removed usage of `keystone as any`.

* [`3be854440`](https://github.com/keystonejs/keystone/commit/3be85444064b8e62e97670594a1d2599ec2fd11c) [#4487](https://github.com/keystonejs/keystone/pull/4487) Thanks [@timleslie](https://github.com/timleslie)! - Remove argument `isAccessAllowed` from `adminMetaSchemaExtension`. This value is now calculated internally.

- [`3a0e59832`](https://github.com/keystonejs/keystone/commit/3a0e59832b8d910b9cd24c62aab36d2dfa600737) [#4461](https://github.com/keystonejs/keystone/pull/4461) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `SessionStrategy<unknown>` with `SessionStrategy<T>` in `implementSession`.

* [`5de960512`](https://github.com/keystonejs/keystone/commit/5de960512241e421f72eca496252a9091b9e50c8) [#4468](https://github.com/keystonejs/keystone/pull/4468) Thanks [@timleslie](https://github.com/timleslie)! - Optimised `createContext` by precomputing arg-parsing functions at system initialisation.

- [`0be537426`](https://github.com/keystonejs/keystone/commit/0be537426bf11b182b1c4387f26357e2ba3e08a5) [#4466](https://github.com/keystonejs/keystone/pull/4466) Thanks [@timleslie](https://github.com/timleslie)! - Added an explicit return type for `statelessSessions`.

* [`79ae6462a`](https://github.com/keystonejs/keystone/commit/79ae6462aac5ba9e27f9e95eacb2d94e76ce6a77) [#4484](https://github.com/keystonejs/keystone/pull/4484) Thanks [@timleslie](https://github.com/timleslie)! - Moved `generateAdminUI` and `createAdminUIServer` into the `@keystone-next/admin-ui` package.

- [`202767d72`](https://github.com/keystonejs/keystone/commit/202767d721719f1ed4455db5a3b5824e9cd8de70) [#4476](https://github.com/keystonejs/keystone/pull/4476) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `any` with more specific types in internal code.

- Updated dependencies [[`dc58df5c8`](https://github.com/keystonejs/keystone/commit/dc58df5c87d694ce94b7d1c2b20d4976176dbd13), [`a5d7b264a`](https://github.com/keystonejs/keystone/commit/a5d7b264ad3e5590e335758881d22f7f296203c9), [`b7a4b997b`](https://github.com/keystonejs/keystone/commit/b7a4b997bae5b2269bea0ad94ca771e63c26ab95), [`ca34424d5`](https://github.com/keystonejs/keystone/commit/ca34424d58e58cc4a657828b1362978be8ee4f62), [`cffa011f7`](https://github.com/keystonejs/keystone/commit/cffa011f79a49e2f5c9165f82e6dff09a88a5b6d), [`192cbed74`](https://github.com/keystonejs/keystone/commit/192cbed74267b68be7de632667261ab943be1e2a), [`2338ed731`](https://github.com/keystonejs/keystone/commit/2338ed73185cd3d33c62fac69064c8a4950dc3fd), [`57092b7c1`](https://github.com/keystonejs/keystone/commit/57092b7c13845fffd1f3767bb609d203afbc2776), [`dbfef6256`](https://github.com/keystonejs/keystone/commit/dbfef6256b11d94250885f5f3a11d0ba81ad3b08), [`b21b62ed5`](https://github.com/keystonejs/keystone/commit/b21b62ed59fcd83ef2fc89587544b9d64522ba27), [`2da044a0c`](https://github.com/keystonejs/keystone/commit/2da044a0cb22dc16a54b7b5555c2b2678e8d4cab), [`341ee2b4b`](https://github.com/keystonejs/keystone/commit/341ee2b4b7eab89f296146ff9e14ce53233235f6), [`4b019b8cf`](https://github.com/keystonejs/keystone/commit/4b019b8cfcb7bea6f800609da5d07e8c8abfc80a), [`68d361d25`](https://github.com/keystonejs/keystone/commit/68d361d2596e8811caf00390c60341ef0c233c7b), [`3f3c65ab2`](https://github.com/keystonejs/keystone/commit/3f3c65ab2d206ef1c72f17259e73fb24a79f0a9b), [`bf22d9f2a`](https://github.com/keystonejs/keystone/commit/bf22d9f2afe537111b95571b86d4fd2759eb6a98), [`3be854440`](https://github.com/keystonejs/keystone/commit/3be85444064b8e62e97670594a1d2599ec2fd11c), [`fe52e25e0`](https://github.com/keystonejs/keystone/commit/fe52e25e04db121adbc6a0ce3bd0dbe1c7270180), [`1c12b8204`](https://github.com/keystonejs/keystone/commit/1c12b8204f8238997ddaf7337c44cf26ebea9ba4), [`6a364a664`](https://github.com/keystonejs/keystone/commit/6a364a664ce16f741408111054f0f3437a63a194), [`79ae6462a`](https://github.com/keystonejs/keystone/commit/79ae6462aac5ba9e27f9e95eacb2d94e76ce6a77)]:
  - @keystone-next/admin-ui@4.0.0
  - @keystone-next/types@6.0.0
  - @keystone-next/fields@3.2.2

## 5.0.0

### Major Changes

- [`803626e88`](https://github.com/keystonejs/keystone/commit/803626e8854f9b7d293bd1829398d25a6692154a) [#4440](https://github.com/keystonejs/keystone/pull/4440) Thanks [@JedWatson](https://github.com/JedWatson)! - Changed the `config.db.onConnect` argument to accept a `KeystoneContext` instance, created with `{ skipAccessControl: true }`, rather than a `BaseKeystone` instance.

  Added database APIs `{ knex?, mongoose?, prisma? }" to`KeystoneContext`.

### Patch Changes

- [`b6498d9f1`](https://github.com/keystonejs/keystone/commit/b6498d9f1341648742f2db78fec53b851b36dddd) [#4427](https://github.com/keystonejs/keystone/pull/4427) Thanks [@timleslie](https://github.com/timleslie)! - Added a `BaseKeystone` type to replace usage of `any` in all instances.

* [`d36e580cc`](https://github.com/keystonejs/keystone/commit/d36e580cc21e4b77a1bd0615c96c0793b9c5dac5) [#4426](https://github.com/keystonejs/keystone/pull/4426) Thanks [@timleslie](https://github.com/timleslie)! - Used the `KeystoneContext` type rather than `any` where appropriate.

* Updated dependencies [[`b6498d9f1`](https://github.com/keystonejs/keystone/commit/b6498d9f1341648742f2db78fec53b851b36dddd), [`d36e580cc`](https://github.com/keystonejs/keystone/commit/d36e580cc21e4b77a1bd0615c96c0793b9c5dac5), [`803626e88`](https://github.com/keystonejs/keystone/commit/803626e8854f9b7d293bd1829398d25a6692154a)]:
  - @keystone-next/types@5.0.0
  - @keystone-next/admin-ui@3.1.2
  - @keystone-next/fields@3.2.1

## 4.1.1

### Patch Changes

- [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567) [#4414](https://github.com/keystonejs/keystone/pull/4414) Thanks [@JedWatson](https://github.com/JedWatson)! - Typed keystone context

* [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a) [#4378](https://github.com/keystonejs/keystone/pull/4378) Thanks [@timleslie](https://github.com/timleslie)! - Updated code to consistently use `context` rather than `ctx` for graphQL context variables.

* Updated dependencies [[`8b12f795d`](https://github.com/keystonejs/keystone/commit/8b12f795d64dc085ca663921aa6826350d234cd0), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567), [`a3a58bcca`](https://github.com/keystonejs/keystone/commit/a3a58bcca56943f2240104dae3c816188eead6f1), [`eddd7e795`](https://github.com/keystonejs/keystone/commit/eddd7e79599e20f5bef61f240d874b37d0a084c4), [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a), [`b8c2c48ec`](https://github.com/keystonejs/keystone/commit/b8c2c48ec3746809894af7347c205f6a95329e8d)]:
  - @keystone-next/fields@3.2.0
  - @keystone-next/admin-ui@3.1.1
  - @keystone-next/types@4.1.1
  - @keystonejs/keystone@17.1.2

## 4.1.0

### Minor Changes

- [`add3f67e3`](https://github.com/keystonejs/keystone/commit/add3f67e379caebbcf0880b4ce82cf6a1e89020b) [#4316](https://github.com/keystonejs/keystone/pull/4316) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.server.cors` option to allow configuration of the cors middleware. Updated the Apollo server middleware to not override cors options.

### Patch Changes

- [`ad10994d2`](https://github.com/keystonejs/keystone/commit/ad10994d271cff6f95e9e412a7e6830742a6d949) [#4317](https://github.com/keystonejs/keystone/pull/4317) Thanks [@timleslie](https://github.com/timleslie)! - Added a function `createGraphQLSchema` to `createSystem` to isolate schema generation code.

* [`d2ebd1c39`](https://github.com/keystonejs/keystone/commit/d2ebd1c3922f1090bcc8e89c9c70ae880f6a24d9) [#4308](https://github.com/keystonejs/keystone/pull/4308) Thanks [@timleslie](https://github.com/timleslie)! - Fixed `itemAPI` `count()` function.

* Updated dependencies [[`add3f67e3`](https://github.com/keystonejs/keystone/commit/add3f67e379caebbcf0880b4ce82cf6a1e89020b), [`2d5f78207`](https://github.com/keystonejs/keystone/commit/2d5f78207103caaf8f86a4dd05b7e4b0a4795213), [`2d5f78207`](https://github.com/keystonejs/keystone/commit/2d5f78207103caaf8f86a4dd05b7e4b0a4795213)]:
  - @keystone-next/types@4.1.0
  - @keystone-next/fields@3.1.0
  - @keystone-next/admin-ui@3.1.0

## 4.0.0

### Major Changes

- [`c60b229ec`](https://github.com/keystonejs/keystone/commit/c60b229ec38b4845ac606ee83b9787a97834baf3) [#4299](https://github.com/keystonejs/keystone/pull/4299) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `createKeystone` to `createSystem` to make it consistent with the type names.

* [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882) [#4269](https://github.com/keystonejs/keystone/pull/4269) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `keystone` argument of `KeystoneAdminUIConfig.getAdditionalFiles()` and `KeystoneAdminUIConfig.pageMiddleware()` to `system`.
  Renamed `keystone` argument of `SessionStrategy.start`, `SessionStrategy.end` and `SessionStrategy.get` to `system`.

### Minor Changes

- [`c858a05fe`](https://github.com/keystonejs/keystone/commit/c858a05fee6dc3ed3d80db9fdf50944217bee072) [#4246](https://github.com/keystonejs/keystone/pull/4246) Thanks [@timleslie](https://github.com/timleslie)! - Added `executeGraphQL` and `gqlNames` to the `context` object. This provides the compatibility required to use `@keystonejs/server-side-graphql-client` in projects using the new interfaces.

### Patch Changes

- [`96a1d5226`](https://github.com/keystonejs/keystone/commit/96a1d52263db625cd117ab85cb6a4a5c3888fdca) [#4286](https://github.com/keystonejs/keystone/pull/4286) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed behaviour in withItemData when session listKey and itemId aren't valid

* [`11777cddb`](https://github.com/keystonejs/keystone/commit/11777cddba45b28a9e17a3149b792db121322b46) [#4263](https://github.com/keystonejs/keystone/pull/4263) Thanks [@timleslie](https://github.com/timleslie)! - Renamed the type `Keystone` to `KeystoneSystem` to avoid confusion with the core `Keystone` class.

- [`5866cb81f`](https://github.com/keystonejs/keystone/commit/5866cb81fd462b86851deb0a88e5034f1934ac84) [#4268](https://github.com/keystonejs/keystone/pull/4268) Thanks [@timleslie](https://github.com/timleslie)! - Refactored `createKeystone` to isolate admin UI related setup.

* [`d1ea5e667`](https://github.com/keystonejs/keystone/commit/d1ea5e66750175e907f41a58c15fce86a4b4ea77) [#4264](https://github.com/keystonejs/keystone/pull/4264) Thanks [@timleslie](https://github.com/timleslie)! - Factored out a `_createKeystone` function to allow for backwards compatibility.

- [`9fddeee41`](https://github.com/keystonejs/keystone/commit/9fddeee41b7e0dbb3854e5ce6abea4cdeeaa81d0) [#4300](https://github.com/keystonejs/keystone/pull/4300) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused `connect()` and `disconnect()` functions from the object returned by `implementSession()`.

* [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882) [#4269](https://github.com/keystonejs/keystone/pull/4269) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `keystone` argument of `writeAdminFiles()` to `system`.

* Updated dependencies [[`11777cddb`](https://github.com/keystonejs/keystone/commit/11777cddba45b28a9e17a3149b792db121322b46), [`cbf11a69b`](https://github.com/keystonejs/keystone/commit/cbf11a69b8f2c428e2c0a08dd568b3bc0e0d80f4), [`81a140ee3`](https://github.com/keystonejs/keystone/commit/81a140ee3badc9c032ab02a233a21d011278e173), [`b2de22941`](https://github.com/keystonejs/keystone/commit/b2de229419cc93b69ee4027c387cab9c8d701488), [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882), [`60e061246`](https://github.com/keystonejs/keystone/commit/60e061246bc35b76031f43ff6c07446fe6ad3c6b), [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882)]:
  - @keystone-next/admin-ui@3.0.0
  - @keystone-next/types@4.0.0
  - @keystone-next/fields@3.0.1

## 3.0.0

### Major Changes

- [`98dd7dcff`](https://github.com/keystonejs/keystone/commit/98dd7dcffa797eb40eb1713ba1ac2697dfef95e3) [#4200](https://github.com/keystonejs/keystone/pull/4200) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Renamed CRUD API to Items API and changed property on context from `crud` to `lists`

* [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c) [#4238](https://github.com/keystonejs/keystone/pull/4238) Thanks [@timleslie](https://github.com/timleslie)! - Uses the new `field.getBackingTypes()` method on core field objects to generate types.

### Minor Changes

- [`d2cfd6106`](https://github.com/keystonejs/keystone/commit/d2cfd6106b44b13254ff1e18601ef943c4211faf) [#4183](https://github.com/keystonejs/keystone/pull/4183) Thanks [@JedWatson](https://github.com/JedWatson)! - Always load the session item in withItemData. The second argument to `withItemData` is now optional.

* [`d02957453`](https://github.com/keystonejs/keystone/commit/d029574533c179fa53f65c0e0ba3812dab2ba4ad) [#4239](https://github.com/keystonejs/keystone/pull/4239) Thanks [@timleslie](https://github.com/timleslie)! - Added support for `config.db.onConnect` in the new APIs. This is passed through as `Keystone{ onConnect }` to the core object.

- [`8f4ebd5f7`](https://github.com/keystonejs/keystone/commit/8f4ebd5f70251ccdfb6b5ce14efb9fb59f5d2b3d) [#4201](https://github.com/keystonejs/keystone/pull/4201) Thanks [@JedWatson](https://github.com/JedWatson)! - New internal graphql api

* [`b89377c9c`](https://github.com/keystonejs/keystone/commit/b89377c9c668c6a4b1be742a177cfb50568d48bf) [#4230](https://github.com/keystonejs/keystone/pull/4230) Thanks [@JedWatson](https://github.com/JedWatson)! - Add Cross-Origin Resource Support to the dev server

### Patch Changes

- [`98e8fd4bc`](https://github.com/keystonejs/keystone/commit/98e8fd4bc586c732d629328ef643014ce42442ed) [#4212](https://github.com/keystonejs/keystone/pull/4212) Thanks [@JedWatson](https://github.com/JedWatson)! - Rename KeystoneItemAPI to KeystoneListsAPI

* [`bc198775e`](https://github.com/keystonejs/keystone/commit/bc198775ed27d356017b4a0c6aadeba47e37ce2e) [#4241](https://github.com/keystonejs/keystone/pull/4241) Thanks [@JedWatson](https://github.com/JedWatson)! - Expanded the defaults for labelField to include "label" and "title"

- [`b9e93cb66`](https://github.com/keystonejs/keystone/commit/b9e93cb66e8559858ecfbfee3244a761f821b9ec) [#4236](https://github.com/keystonejs/keystone/pull/4236) Thanks [@timleslie](https://github.com/timleslie)! - Removed unnecessary intermediate functions from initialisation step.

* [`9928da13e`](https://github.com/keystonejs/keystone/commit/9928da13ecca03fed560a42e1071afc59c0feb3b) [#4242](https://github.com/keystonejs/keystone/pull/4242) Thanks [@timleslie](https://github.com/timleslie)! - Removed `name` field from `KeystoneConfig` type, as it doesn't actually do anything.

- [`dce39ca1b`](https://github.com/keystonejs/keystone/commit/dce39ca1be682647b05a2b59710f05e421b140a1) [#4235](https://github.com/keystonejs/keystone/pull/4235) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused utils code and applied internal cosmetic changes.

- Updated dependencies [[`fd4b0d04c`](https://github.com/keystonejs/keystone/commit/fd4b0d04cd9ab8ba12653f1e64fdf08d8cb0c4db), [`c103cde7d`](https://github.com/keystonejs/keystone/commit/c103cde7da198cd7e9adefa763c51e433680e800), [`84e651c3f`](https://github.com/keystonejs/keystone/commit/84e651c3f08fdfc11628490c9d55229dc360f52a), [`98e8fd4bc`](https://github.com/keystonejs/keystone/commit/98e8fd4bc586c732d629328ef643014ce42442ed), [`d02957453`](https://github.com/keystonejs/keystone/commit/d029574533c179fa53f65c0e0ba3812dab2ba4ad), [`549a9a06d`](https://github.com/keystonejs/keystone/commit/549a9a06d9dbeb514aad724ece603a3fa7fc8cb6), [`400a6e50c`](https://github.com/keystonejs/keystone/commit/400a6e50cba643f4b142858bb1cac83a50ab020d), [`302afe226`](https://github.com/keystonejs/keystone/commit/302afe226162452c91d9e2f11f5c29552df70c6a), [`98dd7dcff`](https://github.com/keystonejs/keystone/commit/98dd7dcffa797eb40eb1713ba1ac2697dfef95e3), [`7afde2fb5`](https://github.com/keystonejs/keystone/commit/7afde2fb516e1d3824d73a96308abb4a6b022400), [`8291187de`](https://github.com/keystonejs/keystone/commit/8291187de347784f21e4d856ed1eefbc5b8a103b), [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c), [`36cf9b0a9`](https://github.com/keystonejs/keystone/commit/36cf9b0a9f6c9c2cd3c823146135f86d4152718b), [`6eb4def9a`](https://github.com/keystonejs/keystone/commit/6eb4def9a1be293872e59bcf6472866c0981b45f), [`8f4ebd5f7`](https://github.com/keystonejs/keystone/commit/8f4ebd5f70251ccdfb6b5ce14efb9fb59f5d2b3d), [`2a2a7c00b`](https://github.com/keystonejs/keystone/commit/2a2a7c00b74028b758006219781cbbd22909be85), [`8e77254a2`](https://github.com/keystonejs/keystone/commit/8e77254a262a4c892263e30044803b463750c3e9), [`28e2b43d4`](https://github.com/keystonejs/keystone/commit/28e2b43d4a5a4624b3ad6683e5f4f0116a5971f4), [`b9e643dc6`](https://github.com/keystonejs/keystone/commit/b9e643dc6c66f75bc6d5b6ced74d91ba3ee7533d), [`cfa0d8275`](https://github.com/keystonejs/keystone/commit/cfa0d8275c89f09b89643c801b208161348b4f65), [`9928da13e`](https://github.com/keystonejs/keystone/commit/9928da13ecca03fed560a42e1071afc59c0feb3b), [`0e65409c7`](https://github.com/keystonejs/keystone/commit/0e65409c7416d285fdc4f9da4a7dfb0f652c6cb2)]:
  - @keystone-next/fields@3.0.0
  - @keystone-next/admin-ui@2.0.2
  - @keystone-next/types@3.0.0

## 2.0.0

### Major Changes

- [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797) [#4132](https://github.com/keystonejs/keystone/pull/4132) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add CardValue export from field views

### Patch Changes

- [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec) [#4138](https://github.com/keystonejs/keystone/pull/4138) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Handle non-builtin GraphQL scalar types when generating types

- Updated dependencies [[`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`71b74161d`](https://github.com/keystonejs/keystone/commit/71b74161dfc9d7f0b918a3451cf545935afce94d), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`f3c0f79e3`](https://github.com/keystonejs/keystone/commit/f3c0f79e3005aa6a8e867efef4431b83bbdf9898), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797)]:
  - @keystone-next/types@2.0.0
  - @keystone-next/fields@2.0.0
  - @keystone-next/admin-ui@2.0.0

## 1.0.0

### Major Changes

- [`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c) [#4106](https://github.com/keystonejs/keystone/pull/4106) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release

### Patch Changes

- Updated dependencies [[`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c), [`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da), [`3dd5c570a`](https://github.com/keystonejs/keystone/commit/3dd5c570a27d0795a689407d96fc9623c90a66df)]:
  - @keystone-next/admin-ui@1.0.0
  - @keystone-next/fields@1.0.0
  - @keystone-next/types@1.0.0
  - @keystonejs/adapter-mongoose@10.0.1
  - @keystonejs/keystone@17.1.1
