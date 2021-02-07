# @keystone-next/keystone

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
