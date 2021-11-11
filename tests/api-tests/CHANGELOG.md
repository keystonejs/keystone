# @keystonejs/api-tests

## 11.1.5

### Patch Changes

- [#6904](https://github.com/keystonejs/keystone/pull/6904) [`859ccb974`](https://github.com/keystonejs/keystone/commit/859ccb97489370443bc8d78b0bd7543d83f5b381) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Update prisma monorepo to [v3.4.0 (minor)](https://github.com/prisma/prisma/releases/tag/3.4.0)

## 11.1.4

### Patch Changes

- [#6804](https://github.com/keystonejs/keystone/pull/6804) [`023bc7a0b`](https://github.com/keystonejs/keystone/commit/023bc7a0b1e6fb0ebdc5055f0243d9dad255a667) Thanks [@renovate](https://github.com/apps/renovate)! - Update prisma monorepo to [v3.3.0 (minor)](https://github.com/prisma/prisma/releases/tag/3.3.0)

## 11.1.3

### Patch Changes

- [#6744](https://github.com/keystonejs/keystone/pull/6744) [`0ef1ee3cc`](https://github.com/keystonejs/keystone/commit/0ef1ee3ccd99f0f3e1f955f03d00b1a0f238c7cd) Thanks [@bladey](https://github.com/bladey)! - Renamed branch `master` to `main`.

* [#6719](https://github.com/keystonejs/keystone/pull/6719) [`704f68b38`](https://github.com/keystonejs/keystone/commit/704f68b38f970860137380e21c36e04d2c51a7a4) Thanks [@renovate](https://github.com/apps/renovate)! - Upgraded Prisma monorepo packages to [3.2.0](https://github.com/prisma/prisma/releases/tag/3.2.0).

## 11.1.2

### Patch Changes

- [#6409](https://github.com/keystonejs/keystone/pull/6409) [`3ece149e5`](https://github.com/keystonejs/keystone/commit/3ece149e53066661c57c56fdd1467003c5b11c06) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded Apollo Server to [Version 3](https://www.apollographql.com/docs/apollo-server/migration/).

  The Apollo documentation contains a full list of breaking changes introduced by this update.
  You can configure the Apollo Server provided by Keystone using the [`graphql.apolloConfig`](https://keystonejs.com/docs/apis/config#graphql) configuration option.

  The most prominant change for most users will be that the GraphQL Playground has been replaced by the Apollo Sandbox.
  If you prefer to keep the GraphQL Playground, you can configure your server by [following these instructions](https://www.apollographql.com/docs/apollo-server/migration/#graphql-playground).

* [#6505](https://github.com/keystonejs/keystone/pull/6505) [`398c08529`](https://github.com/keystonejs/keystone/commit/398c085295d992658a9e7e22aae037f55528c258) Thanks [@timleslie](https://github.com/timleslie)! - Improved error message for bad relationship filter inputs.

## 11.1.1

### Patch Changes

- [#6429](https://github.com/keystonejs/keystone/pull/6429) [`cbc5a68aa`](https://github.com/keystonejs/keystone/commit/cbc5a68aa7547ea55d1254ee5c3b1e543cdc78e2) Thanks [@timleslie](https://github.com/timleslie)! - Update adminMeta `fieldMode` resolvers to respect `graphql.omit` configuration.

* [#6432](https://github.com/keystonejs/keystone/pull/6432) [`0a189d5d0`](https://github.com/keystonejs/keystone/commit/0a189d5d0e618ee5598e9beaccea0290d2a3f8d9) Thanks [@renovate](https://github.com/apps/renovate)! - Updated `typescript` dependency to `^4.4.2`.

- [#6433](https://github.com/keystonejs/keystone/pull/6433) [`bb0c6c626`](https://github.com/keystonejs/keystone/commit/bb0c6c62610eda20ae93a6b67185276bdbba3248) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependencies to `2.30.2`.

## 11.1.0

### Minor Changes

- [#6276](https://github.com/keystonejs/keystone/pull/6276) [`3a7a06b2c`](https://github.com/keystonejs/keystone/commit/3a7a06b2cc6b5ea157d34d925b15494b471899eb) Thanks [@gautamsi](https://github.com/gautamsi)! - Added option for `Bearer` token auth when using session.

### Patch Changes

- Updated dependencies [[`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`b696a9579`](https://github.com/keystonejs/keystone/commit/b696a9579b503db86f42776381e247c4e1a7409f), [`092df6678`](https://github.com/keystonejs/keystone/commit/092df6678cea18d639be16ad250ec4ecc9250f5a), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`272b97b3a`](https://github.com/keystonejs/keystone/commit/272b97b3a10c0dfada782171d55ef7ac6f47c98f), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`56044e2a4`](https://github.com/keystonejs/keystone/commit/56044e2a425f4256b66475fd3b1a6342cd6c3bf9), [`874f2c405`](https://github.com/keystonejs/keystone/commit/874f2c4058c9cf006213e84b9ffcf39c5bf144e8), [`1030296d1`](https://github.com/keystonejs/keystone/commit/1030296d1f304dc44246e895089ac1f992e80590), [`3564b342d`](https://github.com/keystonejs/keystone/commit/3564b342d6dc2127ae591d7ac055af9eae90543c), [`4d9f89f88`](https://github.com/keystonejs/keystone/commit/4d9f89f884e2bf984fdd74ca2cbb7874b25b9cda), [`8187ea019`](https://github.com/keystonejs/keystone/commit/8187ea019a212874f3c602573af3382c6f3bd3b2), [`d214e2f72`](https://github.com/keystonejs/keystone/commit/d214e2f72bae1c798e2415a38410d6063c333e2e), [`f5e64af37`](https://github.com/keystonejs/keystone/commit/f5e64af37df2eb460c89d89fa3c8924fb34970ed)]:
  - @keystone-next/types@24.0.0
  - @keystone-next/testing@1.1.1
  - @keystone-next/utils@1.0.4

## 11.0.6

### Patch Changes

- [#6096](https://github.com/keystonejs/keystone/pull/6096) [`fbe698461`](https://github.com/keystonejs/keystone/commit/fbe6984616de7a302db7c2b0082851db89c2e314) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependencies to `2.27.0`.

- Updated dependencies [[`93f1e5d30`](https://github.com/keystonejs/keystone/commit/93f1e5d302701c610b6cba74e0c5c86a3ac8aacc), [`9e2deac5f`](https://github.com/keystonejs/keystone/commit/9e2deac5f340b4baeb03b01ae065f2bec5977523), [`14cb7c5c4`](https://github.com/keystonejs/keystone/commit/14cb7c5c40456cd0d2c8408ed46823d2695614cc), [`e4e6cf9b5`](https://github.com/keystonejs/keystone/commit/e4e6cf9b59eec461d2b53acfa3b350e4f5a06fc4)]:
  - @keystone-next/types@23.0.0
  - @keystone-next/testing@1.1.0
  - @keystone-next/utils@1.0.3

## 11.0.5

### Patch Changes

- [#6087](https://github.com/keystonejs/keystone/pull/6087) [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951) Thanks [@JedWatson](https://github.com/JedWatson)! - Move source code from the `packages-next` to the `packages` directory.

* [#6040](https://github.com/keystonejs/keystone/pull/6040) [`890e3d0a5`](https://github.com/keystonejs/keystone/commit/890e3d0a500ecc30cc88946ba53438812b11b2a4) Thanks [@timleslie](https://github.com/timleslie)! - Fixed the behaviour of `document(hydrateRelationships: true)` when a related item no longer exists or read access is denied.
  The resolver will now set the relationship data to be `{ id }`, leaving the `label` and `data` properties undefined.
* Updated dependencies [[`38b78f2ae`](https://github.com/keystonejs/keystone/commit/38b78f2aeaf4c5d8176a1751ad8cb5a7acce2790), [`5f3d407d7`](https://github.com/keystonejs/keystone/commit/5f3d407d79171f04ae877e8eaed9a7f9d5671705), [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951)]:
  - @keystone-next/types@22.0.0
  - @keystone-next/testing@1.0.2
  - @keystone-next/utils@1.0.2

## 11.0.4

### Patch Changes

- Updated dependencies [[`03f535ba6`](https://github.com/keystonejs/keystone/commit/03f535ba6fa1a5e5f3027bcad761feb3fd94587b)]:
  - @keystone-next/types@21.0.0
  - @keystone-next/testing@1.0.1
  - @keystone-next/utils@1.0.1

## 11.0.3

### Patch Changes

- [#5932](https://github.com/keystonejs/keystone/pull/5932) [`7a25925c3`](https://github.com/keystonejs/keystone/commit/7a25925c3dc5b2af2cf1209ee949563fb71a4a8c) Thanks [@timleslie](https://github.com/timleslie)! - Initial release of `@keystone-next/utils` package.

* [#5926](https://github.com/keystonejs/keystone/pull/5926) [`3b9cdc2c0`](https://github.com/keystonejs/keystone/commit/3b9cdc2c0cc19be109d7d5e0d7ccd43946f35ffe) Thanks [@timleslie](https://github.com/timleslie)! - Updated tests to use the `@keystone-next/testing` package.

* Updated dependencies [[`7a25925c3`](https://github.com/keystonejs/keystone/commit/7a25925c3dc5b2af2cf1209ee949563fb71a4a8c), [`50ad1ce6b`](https://github.com/keystonejs/keystone/commit/50ad1ce6be90f5fb2481840dbd01328b6f629432), [`0df3734d5`](https://github.com/keystonejs/keystone/commit/0df3734d52a89df30f1d555d003002cb79ad9e9a), [`543154bc0`](https://github.com/keystonejs/keystone/commit/543154bc081dde33ea29b8a2bff1d3033d538077), [`3b9cdc2c0`](https://github.com/keystonejs/keystone/commit/3b9cdc2c0cc19be109d7d5e0d7ccd43946f35ffe)]:
  - @keystone-next/utils@1.0.0
  - @keystone-next/types@20.0.1
  - @keystone-next/testing@1.0.0

## 11.0.2

### Patch Changes

- Updated dependencies [[`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4), [`4995c682d`](https://github.com/keystonejs/keystone/commit/4995c682dbdcfac2100de9fab98ba1e0e08cbcc2), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`4c90c0d3c`](https://github.com/keystonejs/keystone/commit/4c90c0d3c8e75c6a58910c4bd563b3b80e61e801), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`84a5e7f3b`](https://github.com/keystonejs/keystone/commit/84a5e7f3bc3a29ff31d642831e7aaadfc8534ba1), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`cf8825bf4`](https://github.com/keystonejs/keystone/commit/cf8825bf4ce1bab19f1dbd4344c63611f78d832a), [`97fd5e05d`](https://github.com/keystonejs/keystone/commit/97fd5e05d8681bae86001e6b7e8e3f36ebd639b7)]:
  - @keystone-next/types@20.0.0
  - @keystone-next/utils-legacy@12.0.0
  - @keystone-next/test-utils-legacy@21.0.0

## 11.0.1

### Patch Changes

- [#5806](https://github.com/keystonejs/keystone/pull/5806) [`0eadba2ba`](https://github.com/keystonejs/keystone/commit/0eadba2badb13fc6a17f7e525d429494ca953481) Thanks [@list({](https://github.com/list({), [@list({](https://github.com/list({)! - Removed `withItemData` in favour of a `sessionData` option to the `createAuth()` function.

  Previously, `withItemData` would be used to wrap the `config.session` argument:

  ```typescript
  import { config, createSchema, list } from '@keystone-next/keystone/schema';
  import { statelessSessions, withAuthData } from '@keystone-next/keystone/session';
  import { text, password, checkbox } from '@keystone-next/fields';
  import { createAuth } from '@keystone-next/auth';

  const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
  });

  const session = statelessSessions({ secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --' });

  export default withAuth(
    config({
      lists: createSchema({

          fields: {
            email: text({ isUnique: true }),
            password: password(),
            isAdmin: checkbox(),
          },
        }),
        session: withItemData(session, { User: 'id isAdmin' }),
      }),
    })
  );
  ```

  Now, the fields to populate are configured on `sessionData` in `createAuth`, and `withItemData` is completely removed.

  ```typescript
  import { config, createSchema, list } from '@keystone-next/keystone/schema';
  import { statelessSessions } from '@keystone-next/keystone/session';
  import { text, password, checkbox } from '@keystone-next/fields';
  import { createAuth } from '@keystone-next/auth';

  const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    sessionData: 'id isAdmin',
  });

  const session = statelessSessions({ secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --' });

  export default withAuth(
    config({
      lists: createSchema({

          fields: {
            email: text({ isUnique: true }),
            password: password(),
            isAdmin: checkbox(),
          },
        }),
        session,
      }),
    })
  );
  ```

* [#5767](https://github.com/keystonejs/keystone/pull/5767) [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a) Thanks [@timleslie](https://github.com/timleslie)! - Deprecated the `sortBy` GraphQL filter. Updated the `orderBy` GraphQL filter with an improved API.

  Previously a `User` list's `allUsers` query would have the argument:

  ```graphql
  orderBy: String
  ```

  The new API gives it the argument:

  ```graphql
  orderBy: [UserOrderByInput!]! = []
  ```

  where

  ```graphql
  input UserOrderByInput {
    id: OrderDirection
    name: OrderDirection
    score: OrderDirection
  }

  enum OrderDirection {
    asc
    desc
  }
  ```

  Rather than writing `allUsers(orderBy: "name_ASC")` you now write `allUsers(orderBy: { name: asc })`. You can also now order by multiple fields, e.g. `allUsers(orderBy: [{ score: asc }, { name: asc }])`. Each `UserOrderByInput` must have exactly one key, or else an error will be returned.

- [#5791](https://github.com/keystonejs/keystone/pull/5791) [`9de71a9fb`](https://github.com/keystonejs/keystone/commit/9de71a9fb0d3b7f5f05c0d908bebdb818723fd4b) Thanks [@timleslie](https://github.com/timleslie)! - Changed the return type of `allItems(...)` from `[User]` to `[User!]`, as this API can never have `null` items in the return array.

* [#5769](https://github.com/keystonejs/keystone/pull/5769) [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394) Thanks [@timleslie](https://github.com/timleslie)! - The GraphQL query `_all<Items>Meta { count }` generated for each list has been deprecated in favour of a new query `<items>Count`, which directy returns the count.

  A `User` list would have the following query added to the API:

  ```graphql
  usersCount(where: UserWhereInput! = {}): Int
  ```

* Updated dependencies [[`b9c828fb0`](https://github.com/keystonejs/keystone/commit/b9c828fb0d6e587976dbd0dc4e87004bce3b2ef7), [`5cc35170f`](https://github.com/keystonejs/keystone/commit/5cc35170fd46118089a2a6f863d782aff989bbf0), [`195d4fb12`](https://github.com/keystonejs/keystone/commit/195d4fb1218517d7b9a40d3bba1a087d40e6d1d6), [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a), [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394), [`7bda87ea7`](https://github.com/keystonejs/keystone/commit/7bda87ea7f11e0faceccc6ab3f715c72b07c129b), [`4b11c5ea8`](https://github.com/keystonejs/keystone/commit/4b11c5ea87b759c24bdbff9d18443bbc972757c0), [`bb4f4ac91`](https://github.com/keystonejs/keystone/commit/bb4f4ac91c3ed70393774f744075971453a12aba)]:
  - @keystone-next/types@19.0.0
  - @keystone-next/test-utils-legacy@20.0.0
  - @keystone-next/utils-legacy@11.0.1

## 11.0.0

### Major Changes

- [#5746](https://github.com/keystonejs/keystone/pull/5746) [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d) Thanks [@timleslie](https://github.com/timleslie)! - Update Node.js dependency to `^12.20 || >= 14.13`.

### Patch Changes

- Updated dependencies [[`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d)]:
  - @keystone-next/types@18.0.0
  - @keystone-next/test-utils-legacy@19.0.0
  - @keystone-next/utils-legacy@11.0.0

## 10.1.1

### Patch Changes

- Updated dependencies [[`b1baeaba1`](https://github.com/keystonejs/keystone/commit/b1baeaba11f52a968fc547c408c3ff670ef91646), [`62e68c8e5`](https://github.com/keystonejs/keystone/commit/62e68c8e5b4964785a173ab05ff89cba9cc685f2), [`deb7f9504`](https://github.com/keystonejs/keystone/commit/deb7f9504573da67b0cd76d3f53dc0fcceaf1021), [`1ef9986dd`](https://github.com/keystonejs/keystone/commit/1ef9986ddc5a4a881a3fc6fae3d1420447174fdb)]:
  - @keystone-next/test-utils-legacy@18.0.0
  - @keystone-next/types@17.1.0

## 10.1.0

### Minor Changes

- [#5529](https://github.com/keystonejs/keystone/pull/5529) [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added beforeEach and afterEach hooks to test suite, added file config defaults.

### Patch Changes

- [#5530](https://github.com/keystonejs/keystone/pull/5530) [`74fed41e2`](https://github.com/keystonejs/keystone/commit/74fed41e23c3d5c6c073574c54ca339df2235351) Thanks [@timleslie](https://github.com/timleslie)! - Updated code to use the new DB items API.

- Updated dependencies [[`7e81b52b0`](https://github.com/keystonejs/keystone/commit/7e81b52b0f2240f0c590eb8f6733360cab9fe93a), [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5), [`fdebf79cc`](https://github.com/keystonejs/keystone/commit/fdebf79cc3520ffb65979ddac7d61791f4f37324), [`9fd7cc62a`](https://github.com/keystonejs/keystone/commit/9fd7cc62a889f8a0f8933040bb16fcc36af7795e), [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1)]:
  - @keystone-next/types@17.0.1
  - @keystone-next/utils-legacy@10.0.0
  - @keystone-next/test-utils-legacy@17.0.1

## 10.0.0

### Major Changes

- [#5397](https://github.com/keystonejs/keystone/pull/5397) [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b) Thanks [@bladey](https://github.com/bladey)! - Updated Node engine version to 12.x due to 10.x reaching EOL on 2021-04-30.

### Patch Changes

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

* [#5400](https://github.com/keystonejs/keystone/pull/5400) [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276) Thanks [@timleslie](https://github.com/timleslie)! - Moved the `Implementation` base class from the `fields-legacy` package into the `fields` package.

* Updated dependencies [[`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624), [`b0db0a7a8`](https://github.com/keystonejs/keystone/commit/b0db0a7a8d3aa46a8034022c456ea5100b129dc0), [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`5f2673704`](https://github.com/keystonejs/keystone/commit/5f2673704e997710a088c45e9d95d22e1195b2da), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`ea708559f`](https://github.com/keystonejs/keystone/commit/ea708559fbd19914fe7eb52f519937e5fe50a143), [`406acca51`](https://github.com/keystonejs/keystone/commit/406acca5117804800abb01d5109b1edda530a073), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`5106e4bbe`](https://github.com/keystonejs/keystone/commit/5106e4bbe494c0d2a4605ce2ce960e286e572338), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7)]:
  - @keystone-next/types@17.0.0
  - @keystone-next/utils-legacy@9.0.0
  - @keystone-next/test-utils-legacy@17.0.0

## 9.2.2

### Patch Changes

- [#5280](https://github.com/keystonejs/keystone/pull/5280) [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `adapters-mongoose-legacy` packages dependency.

- Updated dependencies [[`1a4db6c87`](https://github.com/keystonejs/keystone/commit/1a4db6c87c17706c8e5db2816e0a6b1b8f79e217), [`e702fea44`](https://github.com/keystonejs/keystone/commit/e702fea44c3116db158d97b5ffd24440f09c9d49), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8), [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc), [`8665cfe66`](https://github.com/keystonejs/keystone/commit/8665cfe66016e0356681413e31f80a6d5586d364), [`4fa66ac1f`](https://github.com/keystonejs/keystone/commit/4fa66ac1fc6fd0a43da17dd90797733e8c958785), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca)]:
  - @keystone-next/test-utils-legacy@16.0.0
  - @keystone-next/fields-legacy@25.0.0
  - @keystone-next/types@16.0.0

## 9.2.1

### Patch Changes

- [#5212](https://github.com/keystonejs/keystone/pull/5212) [`76e5c7bd3`](https://github.com/keystonejs/keystone/commit/76e5c7bd3d5e4b74b1b3b6b6d6c23d087e81bb21) Thanks [@timleslie](https://github.com/timleslie)! - Moved test fixtures into the new packages.

* [#5184](https://github.com/keystonejs/keystone/pull/5184) [`5510ae33f`](https://github.com/keystonejs/keystone/commit/5510ae33fb18d42e378a00f1f78b803fb01b3fad) Thanks [@timleslie](https://github.com/timleslie)! - Fixed bug with updateMany on lists with declarative access control.

* Updated dependencies [[`ca1be4156`](https://github.com/keystonejs/keystone/commit/ca1be415663dd822b3adda1e073bd7a1d4a9b97b), [`97609a623`](https://github.com/keystonejs/keystone/commit/97609a623334fd8d7b9e24dd099abda2e2a37853), [`4d405390c`](https://github.com/keystonejs/keystone/commit/4d405390c0f8dcc37e6fe4da7ce3866c699088f3), [`34dd809ee`](https://github.com/keystonejs/keystone/commit/34dd809eef2368bba1e50ed613b36c5dac7262d1), [`a8be4c860`](https://github.com/keystonejs/keystone/commit/a8be4c8602bcda63d96fc956ead8568d8c989ffc), [`b36758a12`](https://github.com/keystonejs/keystone/commit/b36758a121c096e8776420949c77a5304957a969), [`0e1487385`](https://github.com/keystonejs/keystone/commit/0e1487385c42556c027a6f7bfbc9aa806b3cbd66), [`d8e32c50e`](https://github.com/keystonejs/keystone/commit/d8e32c50e540c9b4aa9fe0e20d3de9228cca402a), [`33bc4de6c`](https://github.com/keystonejs/keystone/commit/33bc4de6c76cfe264a015f46830f55604f4c18c1), [`aa76102c1`](https://github.com/keystonejs/keystone/commit/aa76102c11bdfea02059df66f406a8b1d387c879), [`f448a8b3a`](https://github.com/keystonejs/keystone/commit/f448a8b3a36b295d4ce5ff9ef2fd7aabcdb5dacc)]:
  - @keystone-next/fields-legacy@24.0.0
  - @keystone-next/utils-legacy@8.0.0
  - @keystone-next/types@15.0.1
  - @keystone-next/test-utils-legacy@15.0.0

## 9.2.0

### Minor Changes

- [#3946](https://github.com/keystonejs/keystone/pull/3946) [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05) Thanks [@timleslie](https://github.com/timleslie)! - Added experimental support for Prisma + SQLite as a database adapter.

### Patch Changes

- [#5150](https://github.com/keystonejs/keystone/pull/5150) [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed) Thanks [@timleslie](https://github.com/timleslie)! - Applied eslint `import/order` rule.

- Updated dependencies [[`fbc6d6d68`](https://github.com/keystonejs/keystone/commit/fbc6d6d6842c498b984b2dc77b0aa2c16a4babf0), [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05), [`17c86e0c3`](https://github.com/keystonejs/keystone/commit/17c86e0c3eda7ba08d1bb8edf5eb8ddc9a819e5a), [`2d39de79d`](https://github.com/keystonejs/keystone/commit/2d39de79d6848ced51e6be97d40568c725433e11), [`e2edaaff8`](https://github.com/keystonejs/keystone/commit/e2edaaff8e5f71800e9f00fa18082a6752407e2d), [`ff9292184`](https://github.com/keystonejs/keystone/commit/ff9292184a87ba5554c105a91523451c382371bb), [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d), [`b84abebb6`](https://github.com/keystonejs/keystone/commit/b84abebb6c817172d04f338befa45b3573af55d6), [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`40d4fff5d`](https://github.com/keystonejs/keystone/commit/40d4fff5d63850cbd513c80bcb5e551e5782dc4b), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91)]:
  - @keystone-next/test-utils-legacy@14.0.0
  - @keystone-next/types@15.0.0
  - @keystone-next/fields-legacy@23.1.0

## 9.1.2

### Patch Changes

- Updated dependencies [[`b44f07b6a`](https://github.com/keystonejs/keystone/commit/b44f07b6a7ce1eef6d41513096eadea5aa2be5f7), [`c45cbb9b1`](https://github.com/keystonejs/keystone/commit/c45cbb9b14010b3ced7ea012f3502998ba2ec393), [`b4b276cf6`](https://github.com/keystonejs/keystone/commit/b4b276cf66f90dce2d711c144c0d99c4752f1f5e)]:
  - @keystone-next/utils-legacy@7.0.0
  - @keystone-next/fields-legacy@23.0.0
  - @keystone-next/test-utils-legacy@13.0.3
  - @keystone-next/auth-password-legacy@6.0.3
  - @keystone-next/fields-authed-relationship-legacy@1.0.19
  - @keystone-next/list-plugins-legacy@8.0.2

## 9.1.1

### Patch Changes

- [#5079](https://github.com/keystonejs/keystone/pull/5079) [`57c98c90e`](https://github.com/keystonejs/keystone/commit/57c98c90ee4220bcc59925a154a231989d25de51) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@hapi/iron` to `^6.0.0`.

- Updated dependencies []:
  - @keystone-next/test-utils-legacy@13.0.2

## 9.1.0

### Minor Changes

- [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc) [#4892](https://github.com/keystonejs/keystone/pull/4892) Thanks [@timleslie](https://github.com/timleslie)! - Added support for configuring the field to use for `search` filtering via the `db: { searchField }` list config option.

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

* [`a16d2cbff`](https://github.com/keystonejs/keystone/commit/a16d2cbffd9aa57d0cbdd783ff5ff0c699ff2d8b) [#5016](https://github.com/keystonejs/keystone/pull/5016) Thanks [@timleslie](https://github.com/timleslie)! - Added explicit handling of `null` values for relationship fields in `create` and `update` mutations.

* Updated dependencies [[`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7), [`6dcd01c5d`](https://github.com/keystonejs/keystone/commit/6dcd01c5d55e809e62ce72c4ba5fbdbf8bd87515), [`7ae67b857`](https://github.com/keystonejs/keystone/commit/7ae67b857745985061700b0477c3f585b3b8efbf), [`7b84c4066`](https://github.com/keystonejs/keystone/commit/7b84c40661a086b5468cc4d4542dfb696bfc2f93), [`0cd5acb82`](https://github.com/keystonejs/keystone/commit/0cd5acb82b2e640821c092eb429401eb9d7e8e9a)]:
  - @keystone-next/auth-password-legacy@6.0.2
  - @keystone-next/fields-legacy@22.0.1
  - @keystone-next/fields-authed-relationship-legacy@1.0.18
  - @keystone-next/list-plugins-legacy@8.0.1
  - @keystone-next/test-utils-legacy@13.0.0
  - @keystone-next/utils-legacy@6.0.2

## 9.0.0

### Major Changes

- [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0) [#4815](https://github.com/keystonejs/keystone/pull/4815) Thanks [@timleslie](https://github.com/timleslie)! - Added a `.sudo()` method to `context` objects, which is equivalent to the common operation `context.createContext({ skipAccessControl: true })`.

### Patch Changes

- Updated dependencies [[`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf), [`4035218df`](https://github.com/keystonejs/keystone/commit/4035218df390beff3d42c0d3fc21335230d8a60d), [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0)]:
  - @keystonejs/fields@22.0.0
  - @keystonejs/list-plugins@8.0.0
  - @keystonejs/test-utils@12.0.0
  - @keystonejs/auth-password@6.0.1
  - @keystonejs/fields-authed-relationship@1.0.17

## 8.1.0

### Minor Changes

- [`564879779`](https://github.com/keystonejs/keystone/commit/564879779209aa828ecb2fbc8c9688a2d770da76) [#4701](https://github.com/keystonejs/keystone/pull/4701) Thanks [@timleslie](https://github.com/timleslie)! - Ported field-level access-control tests from cypress to the API test framework.

### Patch Changes

- [`e7d4d54e5`](https://github.com/keystonejs/keystone/commit/e7d4d54e5b94e6b376d6eab28a0f2b074f2c95ed) [#4697](https://github.com/keystonejs/keystone/pull/4697) Thanks [@timleslie](https://github.com/timleslie)! - Fixed cases sensitivity and partial string search for the Prisma adapter.

- Updated dependencies [[`fe0c228b1`](https://github.com/keystonejs/keystone/commit/fe0c228b12530f6d384fa5eed9d5086768a24782), [`fc2b7101f`](https://github.com/keystonejs/keystone/commit/fc2b7101f35f20e4d729269a005816546bb37464)]:
  - @keystonejs/test-utils@11.1.0
  - @keystonejs/fields@21.0.2

## 8.0.6

### Patch Changes

- Updated dependencies [[`b76241695`](https://github.com/keystonejs/keystone/commit/b7624169554b01dba2185ef43856a223d32f12be), [`6ea4ff3cf`](https://github.com/keystonejs/keystone/commit/6ea4ff3cf77d5d2278bf4f0415d11aa7399a0490), [`81e86cbaa`](https://github.com/keystonejs/keystone/commit/81e86cbaa5c73633d6cb0ca2f84e834201e8bf9a)]:
  - @keystonejs/utils@6.0.0
  - @keystonejs/test-utils@11.0.0
  - @keystonejs/fields@21.0.1

## 8.0.5

### Patch Changes

- Updated dependencies [[`0dfb63414`](https://github.com/keystonejs/keystone/commit/0dfb6341412c3c7ae60f069d37fa96e0c9adc900)]:
  - @keystonejs/auth-password@6.0.0
  - @keystonejs/test-utils@10.1.2

## 8.0.4

### Patch Changes

- [`32aee8503`](https://github.com/keystonejs/keystone/commit/32aee85035b4ff123b0270d142ee0f3cf27a6ac8) [#4510](https://github.com/keystonejs/keystone/pull/4510) Thanks [@timleslie](https://github.com/timleslie)! - Added a function `setupFromConfig` to support running tests against systems defined with the new config API.

- Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`32aee8503`](https://github.com/keystonejs/keystone/commit/32aee85035b4ff123b0270d142ee0f3cf27a6ac8), [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0), [`efe97de24`](https://github.com/keystonejs/keystone/commit/efe97de24bd1de7a0f50bcbee6b445f4eef7311b)]:
  - @keystonejs/fields@21.0.0
  - @keystonejs/test-utils@10.1.0
  - @keystonejs/auth-password@5.1.18
  - @keystonejs/fields-authed-relationship@1.0.16
  - @keystonejs/list-plugins@7.1.5

## 8.0.3

### Patch Changes

- Updated dependencies [[`a5e40e6c4`](https://github.com/keystonejs/keystone/commit/a5e40e6c4af1ab38cc2079a0f6e27d39d6b7d546), [`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da), [`31ad142ea`](https://github.com/keystonejs/keystone/commit/31ad142ea058b178e2eda34e7ca4a29d1e99299c)]:
  - @keystonejs/fields@20.0.0
  - @keystonejs/test-utils@10.0.0
  - @keystonejs/auth-password@5.1.17
  - @keystonejs/fields-authed-relationship@1.0.15
  - @keystonejs/list-plugins@7.1.4

## 8.0.2

### Patch Changes

- Updated dependencies [[`28354a02f`](https://github.com/keystonejs/keystone/commit/28354a02f7bc3ee79e2cb4c299ece6126433c909), [`e5efd0ef3`](https://github.com/keystonejs/keystone/commit/e5efd0ef3d6943534cb6c728afe5dbf0caf43e74)]:
  - @keystonejs/test-utils@9.0.1
  - @keystonejs/fields@19.0.0
  - @keystonejs/auth-password@5.1.16
  - @keystonejs/list-plugins@7.1.3

## 8.0.1

### Patch Changes

- [`4072ee2b2`](https://github.com/keystonejs/keystone/commit/4072ee2b2746938fc7d41dbecedaaaf0e0b3ff68) [#3821](https://github.com/keystonejs/keystone/pull/3821) Thanks [@timleslie](https://github.com/timleslie)! - Fixed queries with `{search: ""}`, which should return all items in the list.

## 8.0.0

### Major Changes

- [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4) [#3298](https://github.com/keystonejs/keystone/pull/3298) Thanks [@timleslie](https://github.com/timleslie)! - Added support for a Prisma adapter to Keystone.

### Patch Changes

- Updated dependencies [[`a02e69987`](https://github.com/keystonejs/keystone/commit/a02e69987902cfde38d820e68cb24b7a20ca1f6f), [`966b5bc70`](https://github.com/keystonejs/keystone/commit/966b5bc7003e0f580528c4dcd46647cc4124b592), [`f70c9f1ba`](https://github.com/keystonejs/keystone/commit/f70c9f1ba7452b54a15ab71943a3777d5b6dade4)]:
  - @keystonejs/fields@18.0.0
  - @keystonejs/test-utils@9.0.0
  - @keystonejs/auth-password@5.1.15
  - @keystonejs/list-plugins@7.1.2

## 7.0.7

### Patch Changes

- [`27783bbca`](https://github.com/keystonejs/keystone/commit/27783bbca3b1c5ff05402738c14ffa8db73e542b) [#3673](https://github.com/keystonejs/keystone/pull/3673) Thanks [@timleslie](https://github.com/timleslie)! - Updated `Slug` field type to use common tests where possible.

- Updated dependencies [[`b32f006ad`](https://github.com/keystonejs/keystone/commit/b32f006ad283f8aa1911f55bbecac9942f3f9f25), [`6f42b0a9d`](https://github.com/keystonejs/keystone/commit/6f42b0a9d231049f9e7523eb78ec621d9c9d6df9), [`06dffc42b`](https://github.com/keystonejs/keystone/commit/06dffc42b08062e3166880146c8fb606493ead12), [`27783bbca`](https://github.com/keystonejs/keystone/commit/27783bbca3b1c5ff05402738c14ffa8db73e542b), [`304701d7c`](https://github.com/keystonejs/keystone/commit/304701d7c23e98c8dc40c0f3f5512a0370107c06), [`b6e160678`](https://github.com/keystonejs/keystone/commit/b6e160678b449707261a54a9d565b91663784831), [`7956d5da0`](https://github.com/keystonejs/keystone/commit/7956d5da00197dc11f5d54f7870b8fa72c05a3c0)]:
  - @keystonejs/fields@17.1.3
  - @keystonejs/test-utils@8.0.4

## 7.0.6

### Patch Changes

- [`8bd44758a`](https://github.com/keystonejs/keystone/commit/8bd44758ac742c95f42151c9fbc16700b698e8e4) [#3625](https://github.com/keystonejs/keystone/pull/3625) Thanks [@singhArmani](https://github.com/singhArmani)! - Updated ID field tests.

* [`9dae7a5d0`](https://github.com/keystonejs/keystone/commit/9dae7a5d00a62cd0b7a4470695adc5e1678db3dc) [#3616](https://github.com/keystonejs/keystone/pull/3616) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a query generation bug when performing `count` operations on `1:1` relationships with a filter.

- [`bbd6d328f`](https://github.com/keystonejs/keystone/commit/bbd6d328fdc4299acd3f2d2f58b12b4ceca9c8e6) [#3418](https://github.com/keystonejs/keystone/pull/3418) Thanks [@singhArmani](https://github.com/singhArmani)! - - Added filter and CRUD tests for `Content` field type.
  - Updated Content field to throw error when `isUnique` config is set to true.
- Updated dependencies [[`4f6883dc3`](https://github.com/keystonejs/keystone/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a), [`dd49d2c04`](https://github.com/keystonejs/keystone/commit/dd49d2c040ea8fb8dfc36d2e556be88ca1b74b15), [`8bd44758a`](https://github.com/keystonejs/keystone/commit/8bd44758ac742c95f42151c9fbc16700b698e8e4), [`74ad0cf7a`](https://github.com/keystonejs/keystone/commit/74ad0cf7a1a08d7665575c13da9cfb0e5a692f22), [`fe054e53e`](https://github.com/keystonejs/keystone/commit/fe054e53e71f13a69af1d6dd2a1cd8c68bb31059)]:
  - @keystonejs/fields@17.1.2
  - @keystonejs/test-utils@8.0.3

## 7.0.5

### Patch Changes

- [`a363a0f3c`](https://github.com/keystonejs/keystone/commit/a363a0f3c3bb5f95c65e381b08460bb6d1f9b7aa) [#3565](https://github.com/keystonejs/keystone/pull/3565) Thanks [@timleslie](https://github.com/timleslie)! - Added more tests for 1:1 create operations.

* [`2d0099733`](https://github.com/keystonejs/keystone/commit/2d0099733648c056fb64d79d7f07727bfb30762a) [#3509](https://github.com/keystonejs/keystone/pull/3509) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused dependencies.

- [`6c97a5534`](https://github.com/keystonejs/keystone/commit/6c97a5534e8a18d15aeac8b0471810fdd4d04f80) [#3577](https://github.com/keystonejs/keystone/pull/3577) Thanks [@timleslie](https://github.com/timleslie)! - Updated test framework to support more detailed field tests.

* [`2e6a06202`](https://github.com/keystonejs/keystone/commit/2e6a06202299b36c36fd3efd895f2280479eac31) [#3532](https://github.com/keystonejs/keystone/pull/3532) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated filter tests across all field types.
  Fixed errors with filtering by `null` in the `Decimal`, `MongoId` and `Uuid` field types.

- [`5e5ba0b86`](https://github.com/keystonejs/keystone/commit/5e5ba0b869924826adf640e6b1eb1608101e8a8e) [#3553](https://github.com/keystonejs/keystone/pull/3553) Thanks [@singhArmani](https://github.com/singhArmani)! - Added `filter`, `isRequired` and CRUD tests for `CloudinaryImage` field type.

- Updated dependencies [[`cd15192cd`](https://github.com/keystonejs/keystone/commit/cd15192cdae5e476f64a257c196ca569a9440d5a), [`d500613d8`](https://github.com/keystonejs/keystone/commit/d500613d8917e3cbcea2817501d607eddd3b1a8d), [`6c97a5534`](https://github.com/keystonejs/keystone/commit/6c97a5534e8a18d15aeac8b0471810fdd4d04f80), [`34fcc7052`](https://github.com/keystonejs/keystone/commit/34fcc7052a24db61f1f2f12c46110c060934f4ca), [`c3488c5e8`](https://github.com/keystonejs/keystone/commit/c3488c5e88628b15eb9fe804551c3c5c44c07e0f), [`e62b3308b`](https://github.com/keystonejs/keystone/commit/e62b3308bd841b5f58ac9fa1f84707f9187fda6b), [`7036585f2`](https://github.com/keystonejs/keystone/commit/7036585f25c3b690b7a6fd04c39b5b781ff5bcd9), [`2e6a06202`](https://github.com/keystonejs/keystone/commit/2e6a06202299b36c36fd3efd895f2280479eac31), [`3b619327b`](https://github.com/keystonejs/keystone/commit/3b619327b3801501b96b9af04ec6ca90e9ad9469), [`a42ee3a30`](https://github.com/keystonejs/keystone/commit/a42ee3a306c899a7ae46909fe132522cbeff7812), [`438051442`](https://github.com/keystonejs/keystone/commit/4380514421020f4418a9f966c9fec60e014478b9), [`b3aa85031`](https://github.com/keystonejs/keystone/commit/b3aa850311cbc1622568f69f9cb4b9f46ab9db22), [`518718e19`](https://github.com/keystonejs/keystone/commit/518718e197d0a2d723c8e184552ddd5d8e165f12), [`a34341387`](https://github.com/keystonejs/keystone/commit/a343413874f9611ad17ec39ff6175664f8a14bb6), [`28b88abd3`](https://github.com/keystonejs/keystone/commit/28b88abd369f0df12eae72107db7c24323eda4b5)]:
  - @keystonejs/fields@17.1.1
  - @keystonejs/test-utils@8.0.2
  - @keystonejs/list-plugins@7.1.1

## 7.0.4

### Patch Changes

- [`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6) [#3481](https://github.com/keystonejs/keystone/pull/3481) Thanks [@Noviny](https://github.com/Noviny)! - Updated dependencies through a major version - this shouldn't require change by consumers.

* [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e) [#3477](https://github.com/keystonejs/keystone/pull/3477) Thanks [@Noviny](https://github.com/Noviny)! - Updating dependencies:

  These changes bring the keystone dev experience inline with installing keystone from npm :D

- [`db0797f7f`](https://github.com/keystonejs/keystone/commit/db0797f7f442c2c42cc941633930de527c722f48) [#3465](https://github.com/keystonejs/keystone/pull/3465) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused body-parser dependency.

* [`bbeb0f7d3`](https://github.com/keystonejs/keystone/commit/bbeb0f7d3511a8d8defe9bc2d86ea4a0ae0131fe) [#3415](https://github.com/keystonejs/keystone/pull/3415) Thanks [@singhArmani](https://github.com/singhArmani)! - Added filter and CRUD tests for `AutoIncrement` field type.

- [`ac44568f9`](https://github.com/keystonejs/keystone/commit/ac44568f91fd54ccbc39accf83bcfb3276ce1a72) [#3500](https://github.com/keystonejs/keystone/pull/3500) Thanks [@timleslie](https://github.com/timleslie)! - Updated test scripts to be more consistent.

* [`483b20ec5`](https://github.com/keystonejs/keystone/commit/483b20ec53ff89f1d026c0495fdae5df60a7cf59) [#3487](https://github.com/keystonejs/keystone/pull/3487) Thanks [@singhArmani](https://github.com/singhArmani)! - Updated CRUD API tests for field types.

- [`ea367f759`](https://github.com/keystonejs/keystone/commit/ea367f7594f47efc3528d9917cce010b3a16bf4d) [#3435](https://github.com/keystonejs/keystone/pull/3435) Thanks [@singhArmani](https://github.com/singhArmani)! - Updated `required` and `uniqueness` tests for field API.

* [`096d13fc2`](https://github.com/keystonejs/keystone/commit/096d13fc25696ed1769cf817b705dfd80da601b2) [#3463](https://github.com/keystonejs/keystone/pull/3463) Thanks [@timleslie](https://github.com/timleslie)! - Fixed bug when querying through a many-to-one-to-one relationship chain.

- [`43646b6b3`](https://github.com/keystonejs/keystone/commit/43646b6b39da07690422431fb96747a8dba345c2) [#3462](https://github.com/keystonejs/keystone/pull/3462) Thanks [@singhArmani](https://github.com/singhArmani)! - Added filter and CRUD tests for `OEmbed` field type.

- Updated dependencies [[`6cb4476ff`](https://github.com/keystonejs/keystone/commit/6cb4476ff15923933862c1cd7d4b1ade794106c6), [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e), [`ac44568f9`](https://github.com/keystonejs/keystone/commit/ac44568f91fd54ccbc39accf83bcfb3276ce1a72), [`877a5a90d`](https://github.com/keystonejs/keystone/commit/877a5a90d608f0a13b6c0ea103cb96e3ac2caacc), [`483b20ec5`](https://github.com/keystonejs/keystone/commit/483b20ec53ff89f1d026c0495fdae5df60a7cf59), [`0fc878fa9`](https://github.com/keystonejs/keystone/commit/0fc878fa918c3196196f943f195ffaa62fce504b), [`ea367f759`](https://github.com/keystonejs/keystone/commit/ea367f7594f47efc3528d9917cce010b3a16bf4d), [`69d627813`](https://github.com/keystonejs/keystone/commit/69d627813adfc10d29707f5c882ca15621de12a5), [`0153168d7`](https://github.com/keystonejs/keystone/commit/0153168d73ce8cd7ede4eb9c8518e5e2bf859709)]:
  - @keystonejs/fields@17.1.0
  - @keystonejs/utils@5.4.3

## 7.0.3

### Patch Changes

- [`d492986dc`](https://github.com/keystonejs/keystone/commit/d492986dc90bbdac6961c7fc1e8ae1ea6664466d) [#3412](https://github.com/keystonejs/keystone/pull/3412) Thanks [@timleslie](https://github.com/timleslie)! - Updated tests to compared sorted results.

* [`c906858bb`](https://github.com/keystonejs/keystone/commit/c906858bb76630f284332b9532a17de75c0c0f33) [#3404](https://github.com/keystonejs/keystone/pull/3404) Thanks [@singhArmani](https://github.com/singhArmani)! - Updated filter and CRUD tests for `Color` field type.

* Updated dependencies [[`25f50dadc`](https://github.com/keystonejs/keystone/commit/25f50dadc07d888de18d485244c84d17462dce2e), [`d38c9174f`](https://github.com/keystonejs/keystone/commit/d38c9174f8146ad6e268be87cf5d54d5074bc593), [`e8b2e4772`](https://github.com/keystonejs/keystone/commit/e8b2e477206acffb143f19fb14be1e3b4cd0eb91), [`84116f7c7`](https://github.com/keystonejs/keystone/commit/84116f7c75637a60936a130f104ac748c445acb5), [`f714ac1e2`](https://github.com/keystonejs/keystone/commit/f714ac1e2c49ef44d756e35042bdb7da6db589a7), [`c243839c1`](https://github.com/keystonejs/keystone/commit/c243839c12abc8cffe8ff788fe57dcb880dc3a41)]:
  - @keystonejs/keystone@14.0.0
  - @keystonejs/fields@17.0.0
  - @keystonejs/list-plugins@7.1.0
  - @keystonejs/adapter-knex@11.0.2
  - @keystonejs/adapter-mongoose@9.0.3
  - @keystonejs/test-utils@8.0.1
  - @keystonejs/auth-password@5.1.14

## 7.0.2

### Patch Changes

- [`eeba6c7a8`](https://github.com/keystonejs/keystone/commit/eeba6c7a88a550c94c22f6e05d72c573fb0b8bdc) [#3379](https://github.com/keystonejs/keystone/pull/3379) Thanks [@timleslie](https://github.com/timleslie)! - Update default value testing.

- Updated dependencies [[`9338f3739`](https://github.com/keystonejs/keystone/commit/9338f3739ecff5f626a713a06ce65c1e29888d25), [`3db2f3956`](https://github.com/keystonejs/keystone/commit/3db2f395688342fe9a1dda14be5ce8308c9c39a6), [`7e78ffdaa`](https://github.com/keystonejs/keystone/commit/7e78ffdaa96050e49e8e2678a3c4f1897fedae4f), [`72cd47b35`](https://github.com/keystonejs/keystone/commit/72cd47b357052b69e1d525758ff8a1a0cf44c5c2), [`7b0875723`](https://github.com/keystonejs/keystone/commit/7b0875723783780988f2dee4e5ee406a3b44ca98), [`0369985e3`](https://github.com/keystonejs/keystone/commit/0369985e320afd6112f2664f8a8edc1ed7167130), [`714316718`](https://github.com/keystonejs/keystone/commit/7143167187e3e3519b0b58e2b04ff0fee8fc75dc), [`7422922f5`](https://github.com/keystonejs/keystone/commit/7422922f5649a2b52699f67a77645e9c91800688), [`df8f92a37`](https://github.com/keystonejs/keystone/commit/df8f92a378d2d787f5bee774f013767c09ec35cf), [`cc5bb8915`](https://github.com/keystonejs/keystone/commit/cc5bb891579281338ad7fad0873531be81d877d4), [`1b3943e4f`](https://github.com/keystonejs/keystone/commit/1b3943e4f66c61c446085736949c6b83e9087afb), [`b300720eb`](https://github.com/keystonejs/keystone/commit/b300720eb4e079bc30efb17ed3b48ab71cadc160)]:
  - @keystonejs/fields@16.1.0
  - @keystonejs/adapter-mongoose@9.0.2
  - @keystonejs/server-side-graphql-client@1.1.1
  - @keystonejs/test-utils@8.0.0
  - @keystonejs/keystone@13.1.1

## 7.0.1

### Patch Changes

- [`845b6a21b`](https://github.com/keystonejs/keystone/commit/845b6a21b62e615135eb738ad332fc035b93191b) [#2039](https://github.com/keystonejs/keystone/pull/2039) Thanks [@molomby](https://github.com/molomby)! - Added [authentication hooks](https://www.keystonejs.com/api/hooks).

  You can now customise the behaviour of authentication mutations as follows:

  ```js
  keystone.creatAuthStrategy({
    type: PasswordAuthStrategy,
    list: 'User',
    hooks: {
      resolveAuthInput: async (...) => {...},
      validateAuthInput: async (...) => {...},
      beforeAuth: async (...) => {...},
      afterAuth: async (...) => {...},

      beforeUnauth: async (...) => {...},
      afterUnauth: async (...) => {...},
    },
  })
  ```

* [`d4f28f123`](https://github.com/keystonejs/keystone/commit/d4f28f123ce85f3cb3334f53695aca3db03218f9) [#3326](https://github.com/keystonejs/keystone/pull/3326) Thanks [@timleslie](https://github.com/timleslie)! - Replaced calls to `graphqlRequest` with calls to `keystone.executeGraphQL`.

- [`4cadbb2a9`](https://github.com/keystonejs/keystone/commit/4cadbb2a95ce275c22fe7248fd44a5cbc6df6904) [#3313](https://github.com/keystonejs/keystone/pull/3313) Thanks [@timleslie](https://github.com/timleslie)! - Updated tests to make use of `createItem` and `createItems`.

* [`f69db4fdc`](https://github.com/keystonejs/keystone/commit/f69db4fdcda05328020d876f3987730cbe95a31f) [#3328](https://github.com/keystonejs/keystone/pull/3328) Thanks [@timleslie](https://github.com/timleslie)! - Uses `deleteItem` to delete items in tests.

- [`eb8bd6679`](https://github.com/keystonejs/keystone/commit/eb8bd66799c454bdbd0933ff7a91f592ccf22da9) [#3329](https://github.com/keystonejs/keystone/pull/3329) Thanks [@timleslie](https://github.com/timleslie)! - Uses `updateItems` to update items in tests.

- Updated dependencies [[`d38a41f25`](https://github.com/keystonejs/keystone/commit/d38a41f25a1b4c90c05d2fb85116dc385d4ee77a), [`845b6a21b`](https://github.com/keystonejs/keystone/commit/845b6a21b62e615135eb738ad332fc035b93191b), [`5ede731fc`](https://github.com/keystonejs/keystone/commit/5ede731fc58a79e7322b852bdd2d971ece45281e), [`1a89bbdc6`](https://github.com/keystonejs/keystone/commit/1a89bbdc6b2122a5c8217e6f6c750f7cfb69dc2c), [`f8d4b175b`](https://github.com/keystonejs/keystone/commit/f8d4b175bbc29962569acb24b34c29c44b61791f), [`1d9068770`](https://github.com/keystonejs/keystone/commit/1d9068770d03658954044c530e56e66169667e25), [`694f3acfb`](https://github.com/keystonejs/keystone/commit/694f3acfb9faa78aebfcf48cf711165560f16ff7), [`149d6fd6f`](https://github.com/keystonejs/keystone/commit/149d6fd6ff057c17570346063c173376769dcc79), [`e44102e9f`](https://github.com/keystonejs/keystone/commit/e44102e9f7f770b1528d642d763ccf9f88f3cbb1), [`7650ecd3e`](https://github.com/keystonejs/keystone/commit/7650ecd3e60b52983015ac0058b8b0066b074e1e), [`ed2f8c31b`](https://github.com/keystonejs/keystone/commit/ed2f8c31b13eadb39a045cc351777add81621ede)]:
  - @keystonejs/fields@16.0.0
  - @keystonejs/keystone@13.1.0
  - @keystonejs/server-side-graphql-client@1.1.0
  - @keystonejs/session@8.1.0
  - @keystonejs/auth-password@5.1.13

## 7.0.0

### Major Changes

- [`2e10b1083`](https://github.com/keystonejs/keystone/commit/2e10b1083c0ab3925b877f16543c3d302f618313) [#3309](https://github.com/keystonejs/keystone/pull/3309) Thanks [@timleslie](https://github.com/timleslie)! - Changed the default `schemaName` in `setupServer()` from `"testing"` to `"public"`.

### Patch Changes

- [`acaf19cd9`](https://github.com/keystonejs/keystone/commit/acaf19cd9679861234e67f9e130aea83d052f01e) [#3301](https://github.com/keystonejs/keystone/pull/3301) Thanks [@MadeByMike](https://github.com/MadeByMike)! - No functional changes. Update all internal usages of `keystone.createItems` to the new `createItems` function.

* [`afe661e60`](https://github.com/keystonejs/keystone/commit/afe661e607539df13584d460e1016ba0fa883cb8) [#3274](https://github.com/keystonejs/keystone/pull/3274) Thanks [@jordanoverbye](https://github.com/jordanoverbye)! - Added the ability for static cache hints to be added to custom queries generated using `keystone.extendGraphQLSchema()`

- [`04f9be03d`](https://github.com/keystonejs/keystone/commit/04f9be03de7fe82035205379208511c6e49890b3) [#3319](https://github.com/keystonejs/keystone/pull/3319) Thanks [@timleslie](https://github.com/timleslie)! - Fixed invalid GraphQL schema when using `access: { update: false, auth: true }` on a list configured with an `AuthStrategy`.

* [`50d33ddf9`](https://github.com/keystonejs/keystone/commit/50d33ddf937ae68b4a9ca7f0c0892637c5622b3d) [#3281](https://github.com/keystonejs/keystone/pull/3281) Thanks [@timleslie](https://github.com/timleslie)! - Updated tests to not depend on resolver order.

- [`cefbca4f8`](https://github.com/keystonejs/keystone/commit/cefbca4f899ddd58c7f69180f453d5d9587e2df4) [#3310](https://github.com/keystonejs/keystone/pull/3310) Thanks [@timleslie](https://github.com/timleslie)! - Use `authedGraphqlRequest` rather than `networkedGraphqlRequest` where appropriate.

* [`70fbbac0b`](https://github.com/keystonejs/keystone/commit/70fbbac0b4c20f151fba3030a6958a2c19615daa) [#3312](https://github.com/keystonejs/keystone/pull/3312) Thanks [@timleslie](https://github.com/timleslie)! - Use `keystone.executeGraphQL` in place of `authedGraphqlRequest`, as they are equivalent.

- [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2) [#3299](https://github.com/keystonejs/keystone/pull/3299) Thanks [@timleslie](https://github.com/timleslie)! - Added more robust checks for support of the `isUnique` flag config. Added tests for this flag.

* [`eb70800f7`](https://github.com/keystonejs/keystone/commit/eb70800f74d7238e4378a00a4fb628fa767ce5e7) [#3311](https://github.com/keystonejs/keystone/pull/3311) Thanks [@timleslie](https://github.com/timleslie)! - Use `server-side-graphql-client` functions rather than `findById` and `findOne`.

* Updated dependencies [[`af5171563`](https://github.com/keystonejs/keystone/commit/af51715637433bcdd2538835c98ac71a8eb86122), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2), [`271f1a40b`](https://github.com/keystonejs/keystone/commit/271f1a40b97e03aaa00ce920a6515b8f18669428), [`acaf19cd9`](https://github.com/keystonejs/keystone/commit/acaf19cd9679861234e67f9e130aea83d052f01e), [`22b4a5c1a`](https://github.com/keystonejs/keystone/commit/22b4a5c1a13c3cca47190467be9d56e836f180f1), [`7da9d67d7`](https://github.com/keystonejs/keystone/commit/7da9d67d7d481c44a81406c6b34540a3f0a8340d), [`afe661e60`](https://github.com/keystonejs/keystone/commit/afe661e607539df13584d460e1016ba0fa883cb8), [`04f9be03d`](https://github.com/keystonejs/keystone/commit/04f9be03de7fe82035205379208511c6e49890b3), [`ef7074977`](https://github.com/keystonejs/keystone/commit/ef70749775ce1565eafd7f94c3d7438c8ebd474e), [`e07c42d4e`](https://github.com/keystonejs/keystone/commit/e07c42d4ec75d5703bec4a2e419a42d18bed90ca), [`5a3849806`](https://github.com/keystonejs/keystone/commit/5a3849806d00e62b722461d02f6e4639bc45c1eb), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2), [`24af20b38`](https://github.com/keystonejs/keystone/commit/24af20b38ab89a452edc7a060c9bc936cda55a4a), [`5332988e3`](https://github.com/keystonejs/keystone/commit/5332988e3fafe6a3594f7dcecd79a9402df28015), [`c3883e01c`](https://github.com/keystonejs/keystone/commit/c3883e01c01b83cf5938de9bebf2dd68f4861364), [`fd2b8d1cf`](https://github.com/keystonejs/keystone/commit/fd2b8d1cf0b23b177951d65006a0d0faf666a5d6), [`2e10b1083`](https://github.com/keystonejs/keystone/commit/2e10b1083c0ab3925b877f16543c3d302f618313)]:
  - @keystonejs/fields@15.0.0
  - @keystonejs/keystone@13.0.0
  - @keystonejs/server-side-graphql-client@1.0.0
  - @keystonejs/app-graphql@6.1.0
  - @keystonejs/test-utils@7.1.1
  - @keystonejs/auth-password@5.1.12
  - @keystonejs/adapter-knex@11.0.1
  - @keystonejs/adapter-mongoose@9.0.1

## 6.0.1

### Patch Changes

- [`ea111e454`](https://github.com/keystonejs/keystone/commit/ea111e4543ff15961f7351c18216502013647d64) [#3267](https://github.com/keystonejs/keystone/pull/3267) Thanks [@timleslie](https://github.com/timleslie)! - Used a common pattern for setting up keystone instance in relationship tests.

* [`0f645ddca`](https://github.com/keystonejs/keystone/commit/0f645ddcad8f5b65e41fc731b8f10a7d406b3cda) [#3266](https://github.com/keystonejs/keystone/pull/3266) Thanks [@timleslie](https://github.com/timleslie)! - Updated the layout of queries for consistency.

- [`587507495`](https://github.com/keystonejs/keystone/commit/587507495aeaa70c2f0566e1b573ca4b02d1e977) [#3263](https://github.com/keystonejs/keystone/pull/3263) Thanks [@timleslie](https://github.com/timleslie)! - Removed left/right relationship variations as these are now assured by `_consolidateRelationships()`.

* [`5fc97cbf4`](https://github.com/keystonejs/keystone/commit/5fc97cbf4489587a3a8cb38c04ba81fc2cb1fc5a) [#3171](https://github.com/keystonejs/keystone/pull/3171) Thanks [@timleslie](https://github.com/timleslie)! - Hooks no longer receive a `{ query }` argument. This functionality has been superseded by `context.executeGraphQL()`.

  ```
  {
    ...
    hooks: {
      resolveInput: async ({ actions: { query } } ) => {
        ...
        const { data, errors } = await query(`{ ... }`);
        ...
      }
    }
  }
  ```

  should be changed to

  ```
  {
    ...
    hooks: {
      resolveInput: async ({ context } ) => {
        ...
        const { data, errors } = await context.executeGraphQL({ query: `{ ... }` });
        ...
      }
    }
  }
  ```

  See [the docs](/docs/discussions/server-side-graphql.md) for more details on how to use `context.executeGraphQL()`.

- [`7d4469f93`](https://github.com/keystonejs/keystone/commit/7d4469f9366c8dc2984df55313e1bcf253d112ac) [#3253](https://github.com/keystonejs/keystone/pull/3253) Thanks [@timleslie](https://github.com/timleslie)! - Added more checks for errors being undefined when returned from a graphQL request.

* [`283839cfb`](https://github.com/keystonejs/keystone/commit/283839cfb84f80818dd85699e011eee4775e550d) [#3265](https://github.com/keystonejs/keystone/pull/3265) Thanks [@timleslie](https://github.com/timleslie)! - Updated tests to consistently use `jest.setTimeout()`.

- [`88aee0530`](https://github.com/keystonejs/keystone/commit/88aee0530829217c03bd233cf57c5476cf0e9a15) [#3250](https://github.com/keystonejs/keystone/pull/3250) Thanks [@timleslie](https://github.com/timleslie)! - Split search test into indivudual tests.

* [`7bdec6446`](https://github.com/keystonejs/keystone/commit/7bdec6446ed97fa962bb96abe07975bb23c6ec7a) [#3264](https://github.com/keystonejs/keystone/pull/3264) Thanks [@timleslie](https://github.com/timleslie)! - Fixed bug where `_is_null` queries on relationship fields could generate invalid SQL in `one-to-one` relationships.

* Updated dependencies [[`5ad84ccd8`](https://github.com/keystonejs/keystone/commit/5ad84ccd8d008188e293629e90a4d7e7fde55333), [`753fa13ab`](https://github.com/keystonejs/keystone/commit/753fa13ab976cebdd145f4da948e13244612eedb), [`51c898537`](https://github.com/keystonejs/keystone/commit/51c898537c7fdc8578fa47eade6a499594b0d154), [`61cdafe20`](https://github.com/keystonejs/keystone/commit/61cdafe20e0a22b5a1f9b6a2dcc4aefa45a26902), [`8480f889a`](https://github.com/keystonejs/keystone/commit/8480f889a492d83ee805f19877d49fd112117939), [`e710cd445`](https://github.com/keystonejs/keystone/commit/e710cd445bfb71317ca38622cc3795da61d13dff), [`49984caae`](https://github.com/keystonejs/keystone/commit/49984caaec803ed86b027c9634ac6b3f671e9ba7), [`136cb505c`](https://github.com/keystonejs/keystone/commit/136cb505ce11931de7fc470debe438e335588781), [`02f069f0b`](https://github.com/keystonejs/keystone/commit/02f069f0b6e28ccfe6d5cdeb59ab01bde27a655e), [`4b95d8a46`](https://github.com/keystonejs/keystone/commit/4b95d8a46d53d32b2873e350716311441cd37262), [`e114894d1`](https://github.com/keystonejs/keystone/commit/e114894d1bbcea8940cf14486fc336aa8d112da7), [`e63b9f25a`](https://github.com/keystonejs/keystone/commit/e63b9f25adb64cecf0f65c6f97fe30c95e483996), [`5fc97cbf4`](https://github.com/keystonejs/keystone/commit/5fc97cbf4489587a3a8cb38c04ba81fc2cb1fc5a), [`56e1798d6`](https://github.com/keystonejs/keystone/commit/56e1798d6815723cfba01e6d7dc6b4fe73d4447b), [`06f86c6f5`](https://github.com/keystonejs/keystone/commit/06f86c6f5c573411f0efda565a269d1d7ccb3c66), [`0cbb7e7b0`](https://github.com/keystonejs/keystone/commit/0cbb7e7b096c2a99685631a601fce7273d03cc70), [`81b4df318`](https://github.com/keystonejs/keystone/commit/81b4df3182fc63c583e3fae5c05c528b678cab95), [`79d4c0d92`](https://github.com/keystonejs/keystone/commit/79d4c0d9250c1d1c1c46bcb2eaddae313eb7ac5f), [`e6909b003`](https://github.com/keystonejs/keystone/commit/e6909b0037c9d3dc4fc6131da7968a424ce02be9), [`c9ca62876`](https://github.com/keystonejs/keystone/commit/c9ca628765f1ecb599c8556de2d31567ddf12504), [`3ce644d5f`](https://github.com/keystonejs/keystone/commit/3ce644d5f2b6e674adb2f155c0e729536079347a), [`622cc7d69`](https://github.com/keystonejs/keystone/commit/622cc7d6976ecb71f5b135c931ac0fcb4afdb1c7), [`7bdec6446`](https://github.com/keystonejs/keystone/commit/7bdec6446ed97fa962bb96abe07975bb23c6ec7a), [`51aef1ef0`](https://github.com/keystonejs/keystone/commit/51aef1ef06a89422e89a6118b7820848d5970669)]:
  - @keystonejs/keystone@12.0.0
  - @keystonejs/test-utils@7.1.0
  - @keystonejs/adapter-knex@11.0.0
  - @keystonejs/session@8.0.0
  - @keystonejs/fields@14.0.0
  - @keystonejs/adapter-mongoose@9.0.0
  - @keystonejs/app-graphql@6.0.0
  - @keystonejs/auth-password@5.1.11

## 6.0.0

### Major Changes

- [`4ddc3dc6f`](https://github.com/keystonejs/keystone/commit/4ddc3dc6f87c192627d00db85a1080411400eeb5) [#3212](https://github.com/keystonejs/keystone/pull/3212) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `name` argument to `setupServer`. This value will now be autogenerated by the test system. If you would like to use a specific name you can still pass through `{ keystoneOptions: { name: '...' } }` to retain the original behaviour.

  ```
  setupServer({ name: 'foo', adapterName, createLists, ... });
  ```

  can now be written as

  ```
  setupServer({ adapterName, createLists, ... })
  ```

  or, if you would like the `Keystone` instance to have a specific name,

  ```
  setupServer({ adapterName, createLists, keystoneOptions: { name: 'foo' }, ... })
  ```

### Patch Changes

- Updated dependencies [[`4ddc3dc6f`](https://github.com/keystonejs/keystone/commit/4ddc3dc6f87c192627d00db85a1080411400eeb5), [`69d7f2e50`](https://github.com/keystonejs/keystone/commit/69d7f2e50ef2325c0d3b02b8bb5c310590796fed), [`f296866df`](https://github.com/keystonejs/keystone/commit/f296866dfab3af54381fd527473e3dc98425b3b9), [`2806a0bdf`](https://github.com/keystonejs/keystone/commit/2806a0bdfd65429e7c44ed070983f121d6934955), [`3adb2ac2a`](https://github.com/keystonejs/keystone/commit/3adb2ac2ac4ab65636ffea1b2b1f7044410c2b8b), [`9ab6961e0`](https://github.com/keystonejs/keystone/commit/9ab6961e0202277a980bd60a323a1c599f1dd085)]:
  - @keystonejs/fields@13.0.2
  - @keystonejs/test-utils@7.0.1
  - @keystonejs/utils@5.4.2
  - @keystonejs/keystone@11.2.0
  - @keystonejs/session@7.0.1
  - @keystonejs/app-graphql@5.1.9

## 5.4.9

### Patch Changes

- Updated dependencies [[`3ecf74462`](https://github.com/keystonejs/keystone/commit/3ecf74462524f4940474eaf75eea958acbda9ee4), [`c6eac2dc2`](https://github.com/keystonejs/keystone/commit/c6eac2dc2dec857c668a5794fd84829d164563f3), [`4884ce609`](https://github.com/keystonejs/keystone/commit/4884ce6094b3c9ec203c702a5de97b983bd14176)]:
  - @keystonejs/keystone@11.1.1
  - @keystonejs/test-utils@7.0.0
  - @keystonejs/fields@13.0.1

## 5.4.8

### Patch Changes

- [`b693b2fa8`](https://github.com/keystonejs/keystone/commit/b693b2fa8a391d7f5bcfbea11061679bd4b559d8) [#3002](https://github.com/keystonejs/keystone/pull/3002) Thanks [@timleslie](https://github.com/timleslie)! - The `CalendarDay` field type options `yearRangeFrom` and `yearRangeTo` have been removed, and replaced with `dateFrom` and `dateTo`. These options take an ISO8601 formatted date string in the form `YYYY-MM-DD`, e.g. `2020-06-30`. These values are now validated on the server-side, rather than just on the client-side within the Admin UI.

  If you are currently using `yearRangeFrom` or `yearRangeTo` you will need to make the following change:

  ```
  birthday: { type: CalendarDay, yearRangeFrom: 1900, yearRangeTo: 2100 }
  ```

  becomes

  ```
  birthday: { type: CalendarDay, dateFrom: '1900-01-01', dateTo: '2100-12-31' }
  ```

- Updated dependencies [[`c235e34c7`](https://github.com/keystonejs/keystone/commit/c235e34c7a72cd05b05b3d1af08c93c1e98a8e91), [`dec3d336a`](https://github.com/keystonejs/keystone/commit/dec3d336adbe8156722fbe65f315a57b2f5c08e7), [`78a5d5a45`](https://github.com/keystonejs/keystone/commit/78a5d5a457f80bba592e5a81056125b11469a5a8), [`1c69f4dc8`](https://github.com/keystonejs/keystone/commit/1c69f4dc8ab1eb23bc0a34850f48a51f2e9f1dce), [`b693b2fa8`](https://github.com/keystonejs/keystone/commit/b693b2fa8a391d7f5bcfbea11061679bd4b559d8), [`950f23443`](https://github.com/keystonejs/keystone/commit/950f23443ef8f1a176a3cf6b039f93a29d954f5e), [`3c3c67abb`](https://github.com/keystonejs/keystone/commit/3c3c67abb5ec82155fec893d389eac3bbeb12bbd)]:
  - @keystonejs/fields@13.0.0
  - @keystonejs/keystone@11.1.0
  - @keystonejs/test-utils@6.2.0
  - @keystonejs/auth-password@5.1.10

## 5.4.7

### Patch Changes

- [`835866e1a`](https://github.com/keystonejs/keystone/commit/835866e1a2954113d809c9f0bac186485ac6212b) [#3133](https://github.com/keystonejs/keystone/pull/3133) Thanks [@timleslie](https://github.com/timleslie)! - Fixed bug with deleting items in lists with a one-to-many one-sided relationship.

- Updated dependencies [[`8df24d2ab`](https://github.com/keystonejs/keystone/commit/8df24d2ab4bed8a7fc1a856c20a571781dd7c04e), [`33046a66f`](https://github.com/keystonejs/keystone/commit/33046a66f33a82cf099880303b44d9736344667d), [`7c38e2671`](https://github.com/keystonejs/keystone/commit/7c38e267143491f38699326f02764f40f337d416), [`835866e1a`](https://github.com/keystonejs/keystone/commit/835866e1a2954113d809c9f0bac186485ac6212b)]:
  - @keystonejs/keystone@11.0.0
  - @keystonejs/adapter-knex@10.1.0
  - @keystonejs/adapter-mongoose@8.1.3
  - @keystonejs/test-utils@6.1.4

## 5.4.6

### Patch Changes

- [`541dfa4ff`](https://github.com/keystonejs/keystone/commit/541dfa4ff01c704f28e5c6edc021b4ed2d4139e4) [#3015](https://github.com/keystonejs/keystone/pull/3015) Thanks [@timleslie](https://github.com/timleslie)! - Refactored internals to allow for future extension of nested-mutation tests.

* [`ccb237278`](https://github.com/keystonejs/keystone/commit/ccb237278ad6e8b54d6ce597faf055fbb0cdbb65) [#3018](https://github.com/keystonejs/keystone/pull/3018) Thanks [@timleslie](https://github.com/timleslie)! - Internal refactor, no functional changes.

- [`170faf568`](https://github.com/keystonejs/keystone/commit/170faf568fef5b74147791476b466dc7a25c7d6f) [#3041](https://github.com/keystonejs/keystone/pull/3041) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug when the `ref` list of a `Relationship` field had access control of `{ create: false }`. Keystone no longer throws an error on startup. Fixes #1677.

- Updated dependencies [[`4104e1f15`](https://github.com/keystonejs/keystone/commit/4104e1f15c545c05f680e8d16413862e875ca57a), [`c2ebb51c7`](https://github.com/keystonejs/keystone/commit/c2ebb51c786297879fe9fac2007804055631e9e2), [`c3faeeff4`](https://github.com/keystonejs/keystone/commit/c3faeeff41f9b29a9fc31ca4e7778b596fcb20b9), [`397982096`](https://github.com/keystonejs/keystone/commit/39798209642571d3ba698e11410f5161cd1943bb), [`538378e4e`](https://github.com/keystonejs/keystone/commit/538378e4eb143dbe6e7a943408e0af302eb86b85), [`b5f89b305`](https://github.com/keystonejs/keystone/commit/b5f89b305eb8aaf63c3afc9f45f7aa7e4ce3f7b7), [`9f67e0e91`](https://github.com/keystonejs/keystone/commit/9f67e0e912b4f7dcb90fcb07c4b30bd6c45de464), [`ea9608342`](https://github.com/keystonejs/keystone/commit/ea960834262cec66f52fa39c1b3b07b702b3cd4d), [`8fddd97b2`](https://github.com/keystonejs/keystone/commit/8fddd97b20f1928ff7306d5d0dcc96e58ffe55fb), [`c1e6e6ff3`](https://github.com/keystonejs/keystone/commit/c1e6e6ff374fbac71535da0cc2badde0c13569e2), [`fdfb01417`](https://github.com/keystonejs/keystone/commit/fdfb01417b6d330342f4b6c326767c9567e35ca5), [`83548d43d`](https://github.com/keystonejs/keystone/commit/83548d43d661959a34a6de475994430ee1de3a1d), [`5ea313461`](https://github.com/keystonejs/keystone/commit/5ea313461aa2cba310b2634cc87780092c84b5be), [`cbfc67470`](https://github.com/keystonejs/keystone/commit/cbfc6747011329f7210e79ebe228f44ed8607321), [`aacc4a7f8`](https://github.com/keystonejs/keystone/commit/aacc4a7f8f88c242ae4bd784330d25056842d3fb), [`3204ae785`](https://github.com/keystonejs/keystone/commit/3204ae78576b0ab5649d5f5ae9cfbb1def347af1), [`04c57fa78`](https://github.com/keystonejs/keystone/commit/04c57fa7840714d3413e093d468b78d740c95c9a), [`f33388b50`](https://github.com/keystonejs/keystone/commit/f33388b5061d59747ab46e238f43e9b08f52bd1e), [`4b06157be`](https://github.com/keystonejs/keystone/commit/4b06157be6cffde2d88969823f7c410fefd82317), [`649017fbd`](https://github.com/keystonejs/keystone/commit/649017fbd5ea17c36e8c49d44836e1f2bcae2692), [`839666e25`](https://github.com/keystonejs/keystone/commit/839666e25d8bffefd034e6344e11d72dd43b925b), [`64c0d68ac`](https://github.com/keystonejs/keystone/commit/64c0d68acb1ee969097a8fe59b5c296473790c5c), [`170faf568`](https://github.com/keystonejs/keystone/commit/170faf568fef5b74147791476b466dc7a25c7d6f), [`b696b2acb`](https://github.com/keystonejs/keystone/commit/b696b2acbf7def8dba41f46ccef5ff852703b95a), [`d970580e1`](https://github.com/keystonejs/keystone/commit/d970580e14904ba2f2ac5e969257e71f77ab67d7), [`de27d2c16`](https://github.com/keystonejs/keystone/commit/de27d2c16b520ae5126a74efb85c70ae88ae6b60)]:
  - @keystonejs/keystone@10.0.0
  - @keystonejs/fields@12.0.0
  - @keystonejs/auth-password@5.1.9
  - @keystonejs/app-graphql@5.1.8
  - @keystonejs/adapter-knex@10.0.2
  - @keystonejs/adapter-mongoose@8.1.2
  - @keystonejs/test-utils@6.1.3

## 5.4.5

### Patch Changes

- [`63e00d80`](https://github.com/keystonejs/keystone/commit/63e00d805f3653863002befdaeda74c711f36f6b) [#2973](https://github.com/keystonejs/keystone/pull/2973) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug which could lead to data loss (knex adapter only) when deleting items from a list which was the `1` side of a `1:N` relationship.

- Updated dependencies [[`63e00d80`](https://github.com/keystonejs/keystone/commit/63e00d805f3653863002befdaeda74c711f36f6b)]:
  - @keystonejs/adapter-knex@10.0.1
  - @keystonejs/adapter-mongoose@8.1.1

## 5.4.4

### Patch Changes

- Updated dependencies [[`a124417f`](https://github.com/keystonejs/keystone/commit/a124417fddc75889db5e4e8e0d5625fb4af12590), [`54931d75`](https://github.com/keystonejs/keystone/commit/54931d75d3f26f4f300c2c4c3ee65ed3183b4a6a), [`e9a0de2c`](https://github.com/keystonejs/keystone/commit/e9a0de2cc03c211beca01ec206244105bdca6afc), [`59ed6310`](https://github.com/keystonejs/keystone/commit/59ed6310bacc76f571639de048689becbedbeac5)]:
  - @keystonejs/fields@11.0.0
  - @keystonejs/auth-password@5.1.8
  - @keystonejs/keystone@9.0.1

## 5.4.3

### Patch Changes

- Updated dependencies [[`72e0a4e1`](https://github.com/keystonejs/keystone/commit/72e0a4e19942df11c72d11c2cf6ee9bc94300d87), [`12126788`](https://github.com/keystonejs/keystone/commit/121267885eb3e279eb5b6d035568f547323dd245), [`e0e3e30a`](https://github.com/keystonejs/keystone/commit/e0e3e30a9051741de3f5a0c12ba00f2238d54800), [`5ec4e5d5`](https://github.com/keystonejs/keystone/commit/5ec4e5d547503baeae2ac2f6317b66c2ebae93b7), [`6e507838`](https://github.com/keystonejs/keystone/commit/6e5078380e1d17eb2884554eef114fdd521a15f4), [`c8e52f3b`](https://github.com/keystonejs/keystone/commit/c8e52f3ba892269922c1ed3af0c2114f07387704), [`2a1e4f49`](https://github.com/keystonejs/keystone/commit/2a1e4f49d7f234c49e5b04440ff786ddf3e9e7ed), [`9e2e0071`](https://github.com/keystonejs/keystone/commit/9e2e00715aff50f2ddfedf3dbc14f390275ff23b), [`b5c44934`](https://github.com/keystonejs/keystone/commit/b5c4493442c5e4cfeba23c058a9a6819c628aab9), [`0fbc5b98`](https://github.com/keystonejs/keystone/commit/0fbc5b989a9f96248d1bd7f2f589fe77cb1d8f7d), [`e3d46ce4`](https://github.com/keystonejs/keystone/commit/e3d46ce4bd9f9ec8808ab3194672c6849e624e27), [`d8584765`](https://github.com/keystonejs/keystone/commit/d85847652e224e5000e036be2df0b8a45ab96385), [`ddd6b435`](https://github.com/keystonejs/keystone/commit/ddd6b435cc1301cd5ea1ff2e24fa827d9b46aea3), [`da1359df`](https://github.com/keystonejs/keystone/commit/da1359dfc1bff7e27505eff876efe3a0865bae2d), [`285026a0`](https://github.com/keystonejs/keystone/commit/285026a04ffce23ab72d7defc18ced2e980b0de4), [`babed628`](https://github.com/keystonejs/keystone/commit/babed628a408d7da39990a4c89a19828468555a8), [`d4811b02`](https://github.com/keystonejs/keystone/commit/d4811b0231c5d64e95dbbce57531df0931d4defa), [`e2800875`](https://github.com/keystonejs/keystone/commit/e28008756cbcc1e07e012a9fdb0cfa0ad94f3673), [`60e2c7eb`](https://github.com/keystonejs/keystone/commit/60e2c7eb2298a016c68a19a056040a3b45beab2a), [`99da34a8`](https://github.com/keystonejs/keystone/commit/99da34a8db26b8861b08cee330407605e787a80c), [`9bad0e5f`](https://github.com/keystonejs/keystone/commit/9bad0e5fe67d2379537f4cb145058c6c809b3533), [`bcf03a7f`](https://github.com/keystonejs/keystone/commit/bcf03a7f8067a3f29f22dde397b957bf5cee1a07), [`e765ad20`](https://github.com/keystonejs/keystone/commit/e765ad20abae9838f64b72b7d43767ec87db336a), [`d7eb2601`](https://github.com/keystonejs/keystone/commit/d7eb260144d2aa31e7ef4e636e7a23f91dc37285)]:
  - @keystonejs/fields@10.0.0
  - @keystonejs/keystone@9.0.0
  - @keystonejs/utils@5.4.1
  - @keystonejs/auth-password@5.1.7
  - @keystonejs/session@7.0.0
  - @keystonejs/test-utils@6.1.2
  - @keystonejs/adapter-knex@10.0.0
  - @keystonejs/adapter-mongoose@8.1.0
  - @keystonejs/app-graphql@5.1.7

## 5.4.2

### Patch Changes

- [`f266a692`](https://github.com/keystonejs/keystone/commit/f266a6923a24c84936d66e00ec7de0ea0956445b) [#2854](https://github.com/keystonejs/keystone/pull/2854) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded dependencies.

* [`96f0c6e9`](https://github.com/keystonejs/keystone/commit/96f0c6e917ecdd02af8da52829608b003219d3ca) [#2845](https://github.com/keystonejs/keystone/pull/2845) Thanks [@timleslie](https://github.com/timleslie)! - Updated patch versions of dependencies.

* Updated dependencies [[`b897ba14`](https://github.com/keystonejs/keystone/commit/b897ba14e34aa441b2d658c30b3dda9d1ebd48e2), [`f266a692`](https://github.com/keystonejs/keystone/commit/f266a6923a24c84936d66e00ec7de0ea0956445b), [`4e56eed6`](https://github.com/keystonejs/keystone/commit/4e56eed68c643fd436c371e2635d3024c51968b0), [`8a135a88`](https://github.com/keystonejs/keystone/commit/8a135a88ae6f3a4434db0ba7033cad2e5f18651e), [`3d40bd7d`](https://github.com/keystonejs/keystone/commit/3d40bd7dd39f2b5589012356dd2b1698eda4f0b2), [`96f0c6e9`](https://github.com/keystonejs/keystone/commit/96f0c6e917ecdd02af8da52829608b003219d3ca)]:
  - @keystonejs/fields@9.0.5
  - @keystonejs/app-graphql@5.1.6
  - @keystonejs/keystone@8.1.4
  - @keystonejs/test-utils@6.1.1

## 5.4.1

### Patch Changes

- [`3af6cc21`](https://github.com/keystonejs/keystone/commit/3af6cc214110c318fd674f2e47a5ab36bdfb215d) [#2807](https://github.com/keystonejs/keystone/pull/2807) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug when querying one-to-one relationships.

* [`d3d8d7f2`](https://github.com/keystonejs/keystone/commit/d3d8d7f20d906577c3b5a534a027766c4025f085) [#2806](https://github.com/keystonejs/keystone/pull/2806) Thanks [@timleslie](https://github.com/timleslie)! - Fixed bugs in one to one tests.

* Updated dependencies [[`577b5e69`](https://github.com/keystonejs/keystone/commit/577b5e69ac4f949d1be2a80d8f391cb0a4b1333a)]:
  - @keystonejs/fields@9.0.4

## 5.4.0

### Minor Changes

- [`7badaa0b`](https://github.com/keystonejs/keystone/commit/7badaa0b974fafd61ac7a4d51ab25522ee075d9c) [#2784](https://github.com/keystonejs/keystone/pull/2784) Thanks [@timleslie](https://github.com/timleslie)! - Added tests for access control cases where access is allowed.

### Patch Changes

- [`875aa0ed`](https://github.com/keystonejs/keystone/commit/875aa0ed787d901061aa0409160a360546014df3) [#2796](https://github.com/keystonejs/keystone/pull/2796) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug with updating one-to-one relationship values.

- Updated dependencies [[`732128fb`](https://github.com/keystonejs/keystone/commit/732128fb3598039cbb13b08c237fcd3c612b6621), [`fecf9179`](https://github.com/keystonejs/keystone/commit/fecf9179718f4527f6951a88307d9792cf32d08c), [`667bed43`](https://github.com/keystonejs/keystone/commit/667bed43ed0a075565c959dc0d5699cc911c7d64), [`875aa0ed`](https://github.com/keystonejs/keystone/commit/875aa0ed787d901061aa0409160a360546014df3), [`e5fac4db`](https://github.com/keystonejs/keystone/commit/e5fac4db00e1d38c2271d8ca55e7e2bd86a07dfa)]:
  - @keystonejs/fields@9.0.3
  - @keystonejs/adapter-knex@9.0.3
  - @keystonejs/adapter-mongoose@8.0.2

## 5.3.0

### Minor Changes

- [`62f09391`](https://github.com/keystonejs/keystone/commit/62f093911879ca6b57ec0a06ce646e2296593c9a) [#2781](https://github.com/keystonejs/keystone/pull/2781) Thanks [@timleslie](https://github.com/timleslie)! - Added tests to ensure access control configures the GraphQL schema correctly.

* [`ace1c518`](https://github.com/keystonejs/keystone/commit/ace1c5181a2191577151f9bf264f389d9aa7d7c9) [#2782](https://github.com/keystonejs/keystone/pull/2782) Thanks [@timleslie](https://github.com/timleslie)! - Added tests for access control cases where access is not allowed.

### Patch Changes

- [`98be4b48`](https://github.com/keystonejs/keystone/commit/98be4b4858f0f2cd672910acc5e6cc0c079ce21f) [#2785](https://github.com/keystonejs/keystone/pull/2785) Thanks [@timleslie](https://github.com/timleslie)! - Added tests for `where` queries against one-to-one relationships.

- Updated dependencies [[`62f09391`](https://github.com/keystonejs/keystone/commit/62f093911879ca6b57ec0a06ce646e2296593c9a), [`9d862edc`](https://github.com/keystonejs/keystone/commit/9d862edc506460d4a0456e48ec418b9042b582ad), [`98be4b48`](https://github.com/keystonejs/keystone/commit/98be4b4858f0f2cd672910acc5e6cc0c079ce21f), [`6a27fcf1`](https://github.com/keystonejs/keystone/commit/6a27fcf1896c5a745308346e5b0e66dd8bdd57a3), [`98e9f6d1`](https://github.com/keystonejs/keystone/commit/98e9f6d16e16ee13d2a8a22eb25be9cd2afc6fc0)]:
  - @keystonejs/test-utils@6.1.0
  - @keystonejs/fields@9.0.2
  - @keystonejs/adapter-knex@9.0.2
  - @keystonejs/keystone@8.1.2

## 5.2.0

### Minor Changes

- [`515b4ff6`](https://github.com/keystonejs/keystone/commit/515b4ff697e4df40ece8e5ab30def93f9df866d1) [#2664](https://github.com/keystonejs/keystone/pull/2664) Thanks [@Vultraz](https://github.com/Vultraz)! - Added a `where: { key }` argument to List meta queries.

* [`f9fe301f`](https://github.com/keystonejs/keystone/commit/f9fe301f525f3591e20d069083276d296543d54a) [#2673](https://github.com/keystonejs/keystone/pull/2673) Thanks [@Vultraz](https://github.com/Vultraz)! - Added `fields` list to ListSchema. This optionally takes a `where: { type }` argument and returns all matching field names on a list along with their types.

### Patch Changes

- Updated dependencies [[`515b4ff6`](https://github.com/keystonejs/keystone/commit/515b4ff697e4df40ece8e5ab30def93f9df866d1), [`f9fe301f`](https://github.com/keystonejs/keystone/commit/f9fe301f525f3591e20d069083276d296543d54a)]:
  - @keystonejs/keystone@8.1.0

## 5.1.3

### Patch Changes

- [`c1345884`](https://github.com/keystonejs/keystone/commit/c134588491c73fabbd5186df1787bce5aec5c7c7) [#2666](https://github.com/keystonejs/keystone/pull/2666) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug with `_allItemsMeta { count }` queries on one-to-one relationships.

- Updated dependencies [[`c1345884`](https://github.com/keystonejs/keystone/commit/c134588491c73fabbd5186df1787bce5aec5c7c7), [`c1345884`](https://github.com/keystonejs/keystone/commit/c134588491c73fabbd5186df1787bce5aec5c7c7)]:
  - @keystonejs/adapter-knex@9.0.1
  - @keystonejs/adapter-mongoose@8.0.1

## 5.1.2

### Patch Changes

- [`d748156b`](https://github.com/keystonejs/keystone/commit/d748156ba5ebe33f4271fae0df781e0c63f2b7e6) [#2537](https://github.com/keystonejs/keystone/pull/2537) Thanks [@jesstelford](https://github.com/jesstelford)! - Introduce a framework for testing CRUD operations on fields. This surfaced a bug in the Decimal field where updating _other_ fields would result in a Decimal field being reset to null.

* [`fb510d67`](https://github.com/keystonejs/keystone/commit/fb510d67ab124d8c1bda1884fa2a0d48262b5e4d) [#2527](https://github.com/keystonejs/keystone/pull/2527) Thanks [@jesstelford](https://github.com/jesstelford)! - Updated to latest version of globby for discovering test files to run.

* Updated dependencies [[`51546e41`](https://github.com/keystonejs/keystone/commit/51546e4142fb8c66cfc413479c671a59618f885b), [`29ad8a17`](https://github.com/keystonejs/keystone/commit/29ad8a175cc4324fe722eefd22c09f7fb6c5be5e), [`83bdf743`](https://github.com/keystonejs/keystone/commit/83bdf743748e39d1ea73eff2c8e3576cc713c624), [`d748156b`](https://github.com/keystonejs/keystone/commit/d748156ba5ebe33f4271fae0df781e0c63f2b7e6), [`d30b7498`](https://github.com/keystonejs/keystone/commit/d30b74984b21ae9fc2a3b39850f674639fbac074), [`1d9c6762`](https://github.com/keystonejs/keystone/commit/1d9c6762d32409c71da6a68a083a81197c35aac3), [`8f22ab5e`](https://github.com/keystonejs/keystone/commit/8f22ab5eefc034f9fef4fd0f9ec2c2583fc5514f), [`599c0929`](https://github.com/keystonejs/keystone/commit/599c0929b213ebd4beb79e3ccaa685b92348ca81), [`fb510d67`](https://github.com/keystonejs/keystone/commit/fb510d67ab124d8c1bda1884fa2a0d48262b5e4d)]:
  - @keystonejs/keystone@6.0.2
  - @keystonejs/app-graphql@5.1.3
  - @keystonejs/adapter-mongoose@5.2.2
  - @keystonejs/fields@7.0.1
  - @keystonejs/test-utils@6.0.0

## 5.1.1

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

- Updated dependencies [[`10e88dc3`](https://github.com/keystonejs/keystone/commit/10e88dc3d81f5e021db0bfb31f7547852c602c14), [`e46f0adf`](https://github.com/keystonejs/keystone/commit/e46f0adf97141e1f1205787453173a0585df5bc3), [`6975f169`](https://github.com/keystonejs/keystone/commit/6975f16959bde3fe0e861977471c94a8c9f2c0b0), [`42497b8e`](https://github.com/keystonejs/keystone/commit/42497b8ebbaeaf0f4d7881dbb76c6abafde4cace), [`fe42a997`](https://github.com/keystonejs/keystone/commit/fe42a997c81825a819ac28f05e02d1ed61099542), [`97fb01fe`](https://github.com/keystonejs/keystone/commit/97fb01fe5a32f5003a084c1fd357852fc28f74e4), [`6111e065`](https://github.com/keystonejs/keystone/commit/6111e06554a6aa6db0f7df1a6c16f9da8e81fce4), [`2d1069f1`](https://github.com/keystonejs/keystone/commit/2d1069f11f5f8941b0a18e482541043c853ebb4f), [`949f2f6a`](https://github.com/keystonejs/keystone/commit/949f2f6a3889492015281ffba45a8b3d37e6d888), [`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722), [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20)]:
  - @keystonejs/keystone@6.0.0
  - @keystonejs/app-graphql@5.1.2
  - @keystonejs/fields@6.3.2
  - @keystonejs/adapter-knex@6.3.2
  - @keystonejs/adapter-mongoose@5.2.1
  - @keystonejs/auth-password@5.1.1
  - @keystonejs/session@5.1.1
  - @keystonejs/test-utils@5.1.2

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/adapter-knex@6.3.0
  - @keystonejs/adapter-mongoose@5.2.0
  - @keystonejs/app-graphql@5.1.0
  - @keystonejs/auth-password@5.1.0
  - @keystonejs/fields@6.3.0
  - @keystonejs/keystone@5.5.0
  - @keystonejs/session@5.1.0
  - @keystonejs/test-utils@5.1.0

## 5.0.3

### Patch Changes

- [`0da2ce99`](https://github.com/keystonejs/keystone/commit/0da2ce99b93a171b64c1877399fb173aa03e646c) [#2295](https://github.com/keystonejs/keystone/pull/2295) - Silenced knex adapter output during testing.
- Updated dependencies [[`6bc87d43`](https://github.com/keystonejs/keystone/commit/6bc87d43de4861068de257735c1a6cf886cd3c17), [`eb36cf37`](https://github.com/keystonejs/keystone/commit/eb36cf3731984cc7cf60b60cb1c043962252610f), [`ec81468c`](https://github.com/keystonejs/keystone/commit/ec81468cb3cd046426ca8101294e635486128ef5), [`6eb23086`](https://github.com/keystonejs/keystone/commit/6eb23086485d9bcbb93e35ec716d846790d611f2), [`8f54a4eb`](https://github.com/keystonejs/keystone/commit/8f54a4eb2d63ed042d736fd20ab622f326e111b8), [`5b058a63`](https://github.com/keystonejs/keystone/commit/5b058a633c84465c9dff7cf940c8cb12bddcf215), [`8f54a4eb`](https://github.com/keystonejs/keystone/commit/8f54a4eb2d63ed042d736fd20ab622f326e111b8)]:
  - @keystonejs/fields@6.2.0
  - @keystonejs/keystone@5.4.3
  - @keystonejs/app-graphql@5.0.3
  - @keystonejs/adapter-knex@6.2.0

## 5.0.2

### Patch Changes

- [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29) [#2189](https://github.com/keystonejs/keystone/pull/2189) - Upgraded prettier to 1.19.1 and formatted code accordingly.
- Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a), [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29), [`3d7222cd`](https://github.com/keystonejs/keystone/commit/3d7222cd589ce8accbf3a9de141976c38e2c7e23), [`4cd4499d`](https://github.com/keystonejs/keystone/commit/4cd4499d9d19a5b379b2ae6ab1028c008248629a), [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104), [`05d07adf`](https://github.com/keystonejs/keystone/commit/05d07adf84059ff565cd2394f68d71d92e657485), [`78193f9c`](https://github.com/keystonejs/keystone/commit/78193f9c9d93655fb0d4b8dc494fbe4c622a4d64)]:
  - @keystonejs/fields@6.0.5
  - @keystonejs/adapter-knex@6.1.3
  - @keystonejs/keystone@5.4.1
  - @keystonejs/test-utils@5.0.3
  - @keystonejs/adapter-mongoose@5.1.4

## 5.0.1

### Patch Changes

- [`d4d89836`](https://github.com/keystonejs/keystone/commit/d4d89836700413c1da2b76e9b82b649c2cac859d) [#2067](https://github.com/keystonejs/keystone/pull/2067) - Fixed handling of cache headers with mutations.

* [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f) [#2006](https://github.com/keystonejs/keystone/pull/2006) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated implementation of all `listAdapter.find\*()` methods to use the `itemsQuery()` API for internal consistency.

- [`35ee7ca0`](https://github.com/keystonejs/keystone/commit/35ee7ca027d3daca502494476db1222e659c76dc) [#2048](https://github.com/keystonejs/keystone/pull/2048) - Fixed an intermittant test failure.
- Updated dependencies [[`77056ebd`](https://github.com/keystonejs/keystone/commit/77056ebdb31e58d27372925e8e24311a8c7d9e33), [`267dab2f`](https://github.com/keystonejs/keystone/commit/267dab2fee5bbea711c417c13366862e8e0ab3be), [`8188d76c`](https://github.com/keystonejs/keystone/commit/8188d76cb3f5d3e112ef95fd4e1887db9a520d9d), [`af1e9e4d`](https://github.com/keystonejs/keystone/commit/af1e9e4d3b74753b903b20641b51df99184793df), [`0acdae17`](https://github.com/keystonejs/keystone/commit/0acdae17c4b2bcb234a314ad1aba311981affc8f), [`733ac847`](https://github.com/keystonejs/keystone/commit/733ac847cab488dc92a30e7b458191d750fd5a3d), [`44b2bc93`](https://github.com/keystonejs/keystone/commit/44b2bc938fd508ac75f6a9cbb364006b9f122711), [`e68fc43b`](https://github.com/keystonejs/keystone/commit/e68fc43ba006f9c958f9c81ae20b230d05c2cab6), [`d4d89836`](https://github.com/keystonejs/keystone/commit/d4d89836700413c1da2b76e9b82b649c2cac859d), [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866), [`5540771e`](https://github.com/keystonejs/keystone/commit/5540771e52b5cb1aa33c0486dede7f2f9bc0944f), [`860dabec`](https://github.com/keystonejs/keystone/commit/860dabecacdf81aa1563cea9a5d50add8623dac1), [`1f4dc33d`](https://github.com/keystonejs/keystone/commit/1f4dc33d8a5ac4e38427eb215a7a8bc3504ae153), [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071), [`0145f7e2`](https://github.com/keystonejs/keystone/commit/0145f7e21d9297e3037c709587eb3b4220ba3f01), [`a3fdc50e`](https://github.com/keystonejs/keystone/commit/a3fdc50ebb61b38814816804b04d7cb4bc0fc70a), [`2cc83b12`](https://github.com/keystonejs/keystone/commit/2cc83b12be757019ba25658139478e8f5b2b19c6), [`721472e1`](https://github.com/keystonejs/keystone/commit/721472e1801584be5807d6637c646b1755366d3e), [`a1dcbd7b`](https://github.com/keystonejs/keystone/commit/a1dcbd7bd7448fdcacbfe9fb0196bfee3c4a5326), [`da62aa4a`](https://github.com/keystonejs/keystone/commit/da62aa4a0af9cf27fd59fdcfb6b960e24999254d), [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64)]:
  - @keystonejs/keystone@5.3.0
  - @keystonejs/fields@6.0.0
  - @keystonejs/adapter-knex@6.0.0
  - @keystonejs/adapter-mongoose@5.1.3
  - @keystonejs/app-graphql@5.0.1
  - @keystonejs/auth-password@5.0.1
  - @keystonejs/test-utils@5.0.2

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/adapter-knex@5.0.0
  - @keystonejs/adapter-mongoose@5.0.0
  - @keystonejs/app-graphql@5.0.0
  - @keystonejs/auth-password@5.0.0
  - @keystonejs/fields@5.0.0
  - @keystonejs/keystone@5.0.0
  - @keystonejs/session@5.0.0
  - @keystonejs/test-utils@5.0.0

# @keystone-alpha/api-tests

## 1.8.2

### Patch Changes

- Updated dependencies [[`0a36b0f4`](https://github.com/keystonejs/keystone/commit/0a36b0f403da73a76106b5e14940a789466b4f94), [`7129c887`](https://github.com/keystonejs/keystone/commit/7129c8878a825d961f2772be497dcd5bd6b2b697), [`3bc02545`](https://github.com/keystonejs/keystone/commit/3bc025452fb8e6e69790bdbee032ddfdeeb7dabb), [`768420f5`](https://github.com/keystonejs/keystone/commit/768420f567c244d57a4e2a3aaafe628ea9813d9d), [`a48281ba`](https://github.com/keystonejs/keystone/commit/a48281ba605bf5bebc89fcbb36d3e69c17182eec), [`effc1f63`](https://github.com/keystonejs/keystone/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/keystone@16.1.0
  - @keystone-alpha/app-graphql@8.2.1
  - @keystone-alpha/adapter-knex@6.0.2
  - @keystone-alpha/adapter-mongoose@6.0.1
  - @keystone-alpha/fields@15.0.0
  - @keystone-alpha/auth-password@1.0.6

## 1.8.1

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/adapter-knex@6.0.0
  - @keystone-alpha/adapter-mongoose@6.0.0
  - @keystone-alpha/fields@14.0.0
  - @keystone-alpha/keystone@16.0.0
  - @keystone-alpha/test-utils@2.6.3
  - @keystone-alpha/auth-password@1.0.5

## 1.8.0

### Minor Changes

- [588c50cd](https://github.com/keystonejs/keystone/commit/588c50cd): Support protection against Billion Laughs DoS attacks
- [b12e4ccb](https://github.com/keystonejs/keystone/commit/b12e4ccb): Add a global maxTotalResults limit to Keystone object

- Updated dependencies [6c4df466](https://github.com/keystonejs/keystone/commit/6c4df466):
  - @keystone-alpha/fields@13.1.0
  - @keystone-alpha/test-utils@2.6.2
  - @keystone-alpha/adapter-knex@5.0.0

## 1.7.1

- Updated dependencies [4e6a574d](https://github.com/keystonejs/keystone/commit/4e6a574d):
- Updated dependencies [b96a3a58](https://github.com/keystonejs/keystone/commit/b96a3a58):
  - @keystone-alpha/auth-password@1.0.4
  - @keystone-alpha/keystone@15.3.1
  - @keystone-alpha/fields@13.0.0
  - @keystone-alpha/test-utils@2.6.1
  - @keystone-alpha/adapter-mongoose@5.0.0

## 1.7.0

### Minor Changes

- [552e6fb6](https://github.com/keystonejs/keystone/commit/552e6fb6): Add support for schema cache hints

## 1.6.0

### Minor Changes

- [b9e2c45b](https://github.com/keystonejs/keystone/commit/b9e2c45b): Add support for query validation

## 1.5.3

- Updated dependencies [42a45bbd](https://github.com/keystonejs/keystone/commit/42a45bbd):
  - @keystone-alpha/adapter-knex@4.0.10
  - @keystone-alpha/adapter-mongoose@4.0.7
  - @keystone-alpha/test-utils@2.3.4
  - @keystone-alpha/keystone@15.1.0

## 1.5.2

### Patch Changes

- [9498c690](https://github.com/keystonejs/keystone/commit/9498c690): Fix meta queries with maxResults limits

- Updated dependencies [b61289b4](https://github.com/keystonejs/keystone/commit/b61289b4):
- Updated dependencies [0bba9f07](https://github.com/keystonejs/keystone/commit/0bba9f07):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone/commit/9ade2b2d):
  - @keystone-alpha/adapter-knex@4.0.9
  - @keystone-alpha/adapter-mongoose@4.0.6
  - @keystone-alpha/test-utils@2.3.3
  - @keystone-alpha/keystone@15.0.0
  - @keystone-alpha/auth-password@1.0.2
  - @keystone-alpha/fields@12.0.0

## 1.5.1

- Updated dependencies [decf7319](https://github.com/keystonejs/keystone/commit/decf7319):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone/commit/89c0d7e9):
- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone/commit/89c0d7e9):
- Updated dependencies [f8ad0975](https://github.com/keystonejs/keystone/commit/f8ad0975):
- Updated dependencies [a8e9378d](https://github.com/keystonejs/keystone/commit/a8e9378d):
  - @keystone-alpha/adapter-knex@4.0.8
  - @keystone-alpha/adapter-mongoose@4.0.5
  - @keystone-alpha/test-utils@2.3.2
  - @keystone-alpha/keystone@14.0.0
  - @keystone-alpha/auth-password@1.0.1
  - @keystone-alpha/fields@11.0.0
  - @keystone-alpha/app-graphql@8.0.0

## 1.5.0

### Minor Changes

- [63350996](https://github.com/keystonejs/keystone/commit/63350996): Add queryLimits and maxResults to List API

## 1.4.0

### Minor Changes

- [8bb1bb0e](https://github.com/keystonejs/keystone/commit/8bb1bb0e): Add a `keystone.executeQuery()` method to run GraphQL queries and mutations directly against a Keystone instance. NOTE: These queries are executed without any Access Control checks by default.

- Updated dependencies [8d0d98c7](https://github.com/keystonejs/keystone/commit/8d0d98c7):
  - @keystone-alpha/test-utils@2.3.0
  - @keystone-alpha/adapter-knex@4.0.7
  - @keystone-alpha/adapter-mongoose@4.0.4
  - @keystone-alpha/app-graphql@7.0.0
  - @keystone-alpha/keystone@13.0.0

## 1.3.1

- Updated dependencies [33001656](https://github.com/keystonejs/keystone/commit/33001656):
  - @keystone-alpha/adapter-knex@4.0.5
  - @keystone-alpha/adapter-mongoose@4.0.3
  - @keystone-alpha/test-utils@2.2.4
  - @keystone-alpha/keystone@12.0.0

## 1.3.0

### Minor Changes

- [e42fdb4a](https://github.com/keystonejs/keystone/commit/e42fdb4a): Makes the password auth strategy its own package.
  Previously: `const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');`
  After change: `const { PasswordAuthStrategy } = require('@keystone-alpha/auth-password');`

## 1.2.1

- Updated dependencies [b86f0e26](https://github.com/keystonejs/keystone/commit/b86f0e26):
  - @keystone-alpha/adapter-knex@4.0.3
  - @keystone-alpha/adapter-mongoose@4.0.1
  - @keystone-alpha/test-utils@2.2.2
  - @keystone-alpha/keystone@10.5.0

## 1.2.0

### Minor Changes

- [e049cfcb](https://github.com/keystonejs/keystone/commit/e049cfcb): Support defaultValue as a function at mutation execution time
- [144e6e86](https://github.com/keystonejs/keystone/commit/144e6e86): - API Changes to Adapters: - Configs are now passed directly to the adapters rather than via `adapterConnectOptions`. - Default connections strings changed for both Knex and Mongoose adapters to be more inline with system defaults. - `keystone.connect()` no longer accepts a `to` paramter - the connection options must be passed to the adapter constructor (as above).

### Patch Changes

- [87155453](https://github.com/keystonejs/keystone/commit/87155453): Refactor Knex query builder to fix many-to-many filtering in complex queries, and reduce the number of database calls

## 1.1.0

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Ensure resolveInput for list receives result from fields

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade prettier to 1.18.2
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Reload all columns after insert (knex); fixes #1399
- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade express to 4.17.1

- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9):
- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9):
  - @keystone-alpha/test-utils@2.1.0
  - @keystone-alpha/adapter-mongoose@3.0.0
  - @keystone-alpha/keystone@9.0.0
  - @keystone-alpha/fields@10.0.0

## 1.0.14

- Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone/commit/4007f5dd):
  - @keystone-alpha/adapter-mongoose@2.2.1
  - @keystone-alpha/test-utils@2.0.7
  - @keystone-alpha/keystone@8.0.0
  - @keystone-alpha/fields@9.1.0

## 1.0.13

- Updated dependencies [2b094b7f](https://github.com/keystonejs/keystone/commit/2b094b7f):
  - @keystone-alpha/test-utils@2.0.6
  - @keystone-alpha/fields@9.0.0
  - @keystone-alpha/keystone@7.0.3

## 1.0.12

- Updated dependencies [b6a9f6b9](https://github.com/keystonejs/keystone/commit/b6a9f6b9):
  - @keystone-alpha/keystone@7.0.2
  - @keystone-alpha/fields@8.0.0

## 1.0.11

### Patch Changes

- [148400dc](https://github.com/keystonejs/keystone/commit/148400dc):

  Using `connect: []` and `create: []` in many-relationship queries now behaves as expected.

## 1.0.10

- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):
  - @keystone-alpha/adapter-mongoose@2.2.0
  - @keystone-alpha/test-utils@2.0.5
  - @keystone-alpha/keystone@7.0.0

## 1.0.9

### Patch Changes

- [3958a9c7](https://github.com/keystonejs/keystone/commit/3958a9c7):

  Fields configured with isRequired now behave as expected on create and update, returning a validation error if they are null.

- [ec9e6e2a](https://github.com/keystonejs/keystone/commit/ec9e6e2a):

  Fixed behaviour of isRequired within update operations.

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone/commit/30c1b1e1):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone/commit/1b4cf4e0):
  - @keystone-alpha/keystone@6.0.0
  - @keystone-alpha/fields@7.0.0
  - @keystone-alpha/adapter-mongoose@2.1.0
  - @keystone-alpha/test-utils@2.0.4
  - @keystone-alpha/app-graphql@6.1.0
  - @keystone-alpha/session@2.0.0

## 1.0.8

### Patch Changes

- [dfcabe6a](https://github.com/keystonejs/keystone/commit/dfcabe6a):

  Specify custom servers from within the index.js file

  - Major Changes:
    - The `index.js` export for `admin` must now be exported in the `servers`
      array:
      ```diff
       module.exports = {
         keystone,
      -  admin,
      +  apps: [admin],
       }
      ```
    - The `keystone.prepare()` method (often used within a _Custom Server_
      `server.js`) no longer returns a `server`, it now returns a `middlewares`
      array:
      ```diff
      +const express = require('express');
       const port = 3000;
       keystone.prepare({ port })
      -  .then(async ({ server, keystone: keystoneApp }) => {
      +  .then(async ({ middlewares, keystone: keystoneApp }) => {
           await keystoneApp.connect();
      -    await server.start();
      +    const app = express();
      +    app.use(middlewares);
      +    app.listen(port)
         });
      ```

* Updated dependencies [b2651279](https://github.com/keystonejs/keystone/commit/b2651279):
  - @keystone-alpha/keystone@5.0.0
  - @keystone-alpha/test-utils@2.0.3
  - @keystone-alpha/app-graphql@6.0.0

## 1.0.7

- Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone/commit/9a0456ff):
  - @keystone-alpha/fields@6.1.1
  - @keystone-alpha/test-utils@2.0.2
  - @keystone-alpha/adapter-mongoose@2.0.0

## 1.0.6

### Patch Changes

- [e4daadc7](https://github.com/keystonejs/keystone/commit/e4daadc7):

  Re-enable field tests

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone/commit/24cd26ee):
* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone/commit/9dbed649):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone/commit/2ef2658f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone/commit/119448fc):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone/commit/ae5cf6cc):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone/commit/1a7b706c):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone/commit/b7a2ea9c):
* Updated dependencies [b22d6c16](https://github.com/keystonejs/keystone/commit/b22d6c16):
* Updated dependencies [bd0ea21f](https://github.com/keystonejs/keystone/commit/bd0ea21f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone/commit/119448fc):
  - @keystone-alpha/adapter-mongoose@1.0.7
  - @keystone-alpha/test-utils@2.0.1
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/fields@6.0.0
  - @keystone-alpha/server@5.0.0

## 1.0.5

- [patch][85b74a2c](https://github.com/keystonejs/keystone/commit/85b74a2c):

  - Expose result of running relationship operations (create/connect/disconnect)

- [patch][4eb2dcd0](https://github.com/keystonejs/keystone/commit/4eb2dcd0):

  - Add more relationship query tests to exercise knex adapter bug

## 1.0.4

- [patch][b4dcf44b](https://github.com/keystonejs/keystone/commit/b4dcf44b):

  - Use named exports from @keystone-alpha/keystone package.

- [patch][302930a4](https://github.com/keystonejs/keystone/commit/302930a4):

  - Minor internal code cleanups

- [patch][21be780b](https://github.com/keystonejs/keystone/commit/21be780b):

  - Use updated test-utils APIs

- Updated dependencies [37dcee37](https://github.com/keystonejs/keystone/commit/37dcee37):
- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone/commit/b4dcf44b):
- Updated dependencies [21be780b](https://github.com/keystonejs/keystone/commit/21be780b):
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/fields@4.0.0
  - @keystone-alpha/adapter-mongoose@1.0.5
  - @keystone-alpha/test-utils@2.0.0
  - @keystone-alpha/server@4.0.0

## 1.0.3

- [patch][5ebf4c3a](https://github.com/keystonejs/keystone/commit/5ebf4c3a):

  - Use the new @keystone-alpha/session package

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone/commit/8d385ede):
- Updated dependencies [d718c016](https://github.com/keystonejs/keystone/commit/d718c016):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone/commit/5ebf4c3a):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone/commit/5ebf4c3a):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone/commit/52f1c47b):
  - @keystone-alpha/adapter-mongoose@1.0.4
  - @keystone-alpha/test-utils@1.1.3
  - @keystone-alpha/keystone@2.0.0
  - @keystone-alpha/server@3.0.0
  - @keystone-alpha/session@1.0.0

## 1.0.2

- [patch][de616f7e](https://github.com/keystonejs/keystone/commit/de616f7e):

  - Use new authStrategy APIs

- Updated dependencies [9a9f214a](https://github.com/keystonejs/keystone/commit/9a9f214a):
- Updated dependencies [de616f7e](https://github.com/keystonejs/keystone/commit/de616f7e):
  - @keystone-alpha/keystone@1.0.3
  - @keystone-alpha/fields@3.0.0
  - @keystone-alpha/test-utils@1.1.2
  - @keystone-alpha/server@2.0.0

## 1.0.1

- [patch][7417ea3a](https://github.com/keystonejs/keystone/commit/7417ea3a):

  - Update patch-level dependencies

- Updated dependencies [dcb93771](https://github.com/keystonejs/keystone/commit/dcb93771):
  - @keystone-alpha/keystone@1.0.2
  - @keystone-alpha/fields@2.0.0

## 1.0.0

- [major][c0e64c01](https://github.com/keystonejs/keystone/commit/c0e64c01):

  - Create a new package to house all system tests
