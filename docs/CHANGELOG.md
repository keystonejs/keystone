# @keystone-next/website

## 3.1.0

### Minor Changes

- [#5774](https://github.com/keystonejs/keystone/pull/5774) [`107eeb037`](https://github.com/keystonejs/keystone/commit/107eeb0374e214b69be3727ca955a9f76e1468bb) Thanks [@jonowu](https://github.com/jonowu)! - Added `sameSite` option to session options for cookies

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

* [#5771](https://github.com/keystonejs/keystone/pull/5771) [`51aca916b`](https://github.com/keystonejs/keystone/commit/51aca916b0fd03bdd9100e13acbb86f49b494c0f) Thanks [@raveling](https://github.com/raveling)! - New tutorial for Keystone Lite. First draft.

- [#5767](https://github.com/keystonejs/keystone/pull/5767) [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a) Thanks [@timleslie](https://github.com/timleslie)! - Deprecated the `sortBy` GraphQL filter. Updated the `orderBy` GraphQL filter with an improved API.

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

* [#5823](https://github.com/keystonejs/keystone/pull/5823) [`553bad1e7`](https://github.com/keystonejs/keystone/commit/553bad1e7bfdba960f00a9f0a132f7f2000b1931) Thanks [@gabrielkuettel](https://github.com/gabrielkuettel)! - Fixed a typo in the db items api sample code.

- [#5791](https://github.com/keystonejs/keystone/pull/5791) [`9de71a9fb`](https://github.com/keystonejs/keystone/commit/9de71a9fb0d3b7f5f05c0d908bebdb818723fd4b) Thanks [@timleslie](https://github.com/timleslie)! - Changed the return type of `allItems(...)` from `[User]` to `[User!]`, as this API can never have `null` items in the return array.

* [#5769](https://github.com/keystonejs/keystone/pull/5769) [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394) Thanks [@timleslie](https://github.com/timleslie)! - The GraphQL query `_all<Items>Meta { count }` generated for each list has been deprecated in favour of a new query `<items>Count`, which directy returns the count.

  A `User` list would have the following query added to the API:

  ```graphql
  usersCount(where: UserWhereInput! = {}): Int
  ```

* Updated dependencies [[`5cc35170f`](https://github.com/keystonejs/keystone/commit/5cc35170fd46118089a2a6f863d782aff989bbf0), [`3a7acc2c5`](https://github.com/keystonejs/keystone/commit/3a7acc2c5114fbcbde994d1f4c6cc0b21c572ec0)]:
  - @keystone-next/fields-document@6.0.1
  - @keystone-ui/fields@4.1.0

## 3.0.0

### Major Changes

- [#5746](https://github.com/keystonejs/keystone/pull/5746) [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d) Thanks [@timleslie](https://github.com/timleslie)! - Update Node.js dependency to `^12.20 || >= 14.13`.

### Patch Changes

- Updated dependencies [[`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d), [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab)]:
  - @keystone-ui/button@5.0.0
  - @keystone-ui/core@3.0.0
  - @keystone-ui/fields@4.0.0
  - @keystone-ui/icons@4.0.0
  - @keystone-ui/notice@4.0.0
  - @keystone-ui/toast@4.0.0
  - @keystone-ui/tooltip@4.0.0
  - @keystone-next/fields-document@6.0.0

## 2.0.2

### Patch Changes

- [#5601](https://github.com/keystonejs/keystone/pull/5601) [`8b77b6971`](https://github.com/keystonejs/keystone/commit/8b77b697187f8d5eb73e862b2c07b8bfbb769e0b) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Next.js dependency to `^10.2.0`.

## 2.0.1

### Patch Changes

- [#5544](https://github.com/keystonejs/keystone/pull/5544) [`b49befd9c`](https://github.com/keystonejs/keystone/commit/b49befd9c9ed6403a685580bb92b4caff6f11f76) Thanks [@raveling](https://github.com/raveling)! - copy changes to document-fields guide

- Updated dependencies []:
  - @keystone-next/fields-document@5.0.1

## 2.0.0

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

* [#5467](https://github.com/keystonejs/keystone/pull/5467) [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc) Thanks [@timleslie](https://github.com/timleslie)! - Removed the deprecated `context.executeGraphQL`. Identical functionality is available via `context.graphql.raw`.

- [#5471](https://github.com/keystonejs/keystone/pull/5471) [`838247cc0`](https://github.com/keystonejs/keystone/commit/838247cc0644ccedbd16210dfefc1ce7810f74ee) Thanks [@raveling](https://github.com/raveling)! - Fixed typo in guide meta title.

* [#5366](https://github.com/keystonejs/keystone/pull/5366) [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Next.js dependency to `^10.1.3`.

* Updated dependencies [[`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`43a0f5429`](https://github.com/keystonejs/keystone/commit/43a0f5429028eb9df53e93f19f2dd6fc328cde32), [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276), [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2), [`8eebf9195`](https://github.com/keystonejs/keystone/commit/8eebf9195ac625f6642c76ea145642f075e725fe)]:
  - @keystone-next/fields-document@5.0.0
  - @keystone-ui/button@4.0.0
  - @keystone-ui/fields@3.0.0
  - @keystone-ui/icons@3.0.0
  - @keystone-ui/notice@3.0.0
  - @keystone-ui/toast@3.0.0
  - @keystone-ui/tooltip@3.0.0

## 1.3.0

### Minor Changes

- [#5368](https://github.com/keystonejs/keystone/pull/5368) [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8) Thanks [@timleslie](https://github.com/timleslie)! - The config option `db.adapter` is now deprecated. It has been repaced with `db.provider` which can take the values `postgresql` or `sqlite`.

### Patch Changes

- [#5301](https://github.com/keystonejs/keystone/pull/5301) [`c8744fd56`](https://github.com/keystonejs/keystone/commit/c8744fd56d03ccbf9fefb75edf94c147b636555a) Thanks [@raveling](https://github.com/raveling)! - Added a Keystone 5 vs Next guide to site.

* [#5340](https://github.com/keystonejs/keystone/pull/5340) [`ff472d5af`](https://github.com/keystonejs/keystone/commit/ff472d5afeffb5f38b76004fcda02f81338d8eb8) Thanks [@raveling](https://github.com/raveling)! - copy changes to home page (including CTA to getting started tut)

- [#5283](https://github.com/keystonejs/keystone/pull/5283) [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b) Thanks [@timleslie](https://github.com/timleslie)! - The flag `{ experimental: { prismaSqlite: true } }` is no longer required to use the SQLite adapter.

- Updated dependencies [[`4fa66ac1f`](https://github.com/keystonejs/keystone/commit/4fa66ac1fc6fd0a43da17dd90797733e8c958785), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b)]:
  - @keystone-next/fields-document@4.0.0
  - @keystone-ui/fields@2.1.0

## 1.2.0

### Minor Changes

- [#3946](https://github.com/keystonejs/keystone/pull/3946) [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05) Thanks [@timleslie](https://github.com/timleslie)! - Added experimental support for Prisma + SQLite as a database adapter.

* [#4912](https://github.com/keystonejs/keystone/pull/4912) [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.graphql.apolloConfig` option to allow developers to configure the `ApolloServer` object provided by Keystone.

### Patch Changes

- [#5150](https://github.com/keystonejs/keystone/pull/5150) [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed) Thanks [@timleslie](https://github.com/timleslie)! - Applied eslint `import/order` rule.

- Updated dependencies [[`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05), [`17c86e0c3`](https://github.com/keystonejs/keystone/commit/17c86e0c3eda7ba08d1bb8edf5eb8ddc9a819e5a), [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed), [`a4e34e9eb`](https://github.com/keystonejs/keystone/commit/a4e34e9ebb6f746f54ccd898d0aeb4dc5c5d9271)]:
  - @keystone-next/fields-document@3.1.0
  - @keystone-ui/fields@2.0.2
  - @keystone-ui/core@2.0.2
  - @keystone-ui/notice@2.0.2

## 1.1.1

### Patch Changes

- [#5073](https://github.com/keystonejs/keystone/pull/5073) [`ba637676b`](https://github.com/keystonejs/keystone/commit/ba637676b83625b06581daae6fd625d8fb0b612d) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Moved viewport meta tag from \_document to \_app to avoid dedupe issues and next warnings.

* [#5072](https://github.com/keystonejs/keystone/pull/5072) [`5a78af92e`](https://github.com/keystonejs/keystone/commit/5a78af92e1ab364f9ab444c5244f9581e33bad1f) Thanks [@timleslie](https://github.com/timleslie)! - Updated cypress tests to pre-build the site before running the tests.

## 1.1.0

### Minor Changes

- [`b1da7806c`](https://github.com/keystonejs/keystone/commit/b1da7806c0e82f676de5bc51595069be71b86331) [#4922](https://github.com/keystonejs/keystone/pull/4922) Thanks [@timleslie](https://github.com/timleslie)! - Added access control API docs.

* [`f4163a06d`](https://github.com/keystonejs/keystone/commit/f4163a06d27fcb106a0159711010e0087eebc945) [#4838](https://github.com/keystonejs/keystone/pull/4838) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added anchoring and copy to clipboard functionality to headings

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

* [`2655c0b1b`](https://github.com/keystonejs/keystone/commit/2655c0b1bf714d80d46e1ff4e414b4bce474c23d) [#4866](https://github.com/keystonejs/keystone/pull/4866) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.ui.isDisabled` option to completely disable the Admin UI.

- [`f4163a06d`](https://github.com/keystonejs/keystone/commit/f4163a06d27fcb106a0159711010e0087eebc945) [#4838](https://github.com/keystonejs/keystone/pull/4838) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Remove backticks from headings in docs

* [`45d2b7cc9`](https://github.com/keystonejs/keystone/commit/45d2b7cc9b56a73c68f424cffc5cf143dfc9caa9) [#4925](https://github.com/keystonejs/keystone/pull/4925) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Removed backticks from inline code blocks in mdx, and made minor styling changes.

- [`1f315bbfb`](https://github.com/keystonejs/keystone/commit/1f315bbfb750d9570d7969aa0c9349e6a7d427e4) [#4961](https://github.com/keystonejs/keystone/pull/4961) Thanks [@timleslie](https://github.com/timleslie)! - Added docs for the `float` field type.

* [`954083571`](https://github.com/keystonejs/keystone/commit/954083571d8ca8c3b37deb8332f911c4cc755f89) [#4926](https://github.com/keystonejs/keystone/pull/4926) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added a favicon to @keystone-next/website

* Updated dependencies [[`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7), [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6), [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6), [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6), [`556c1f95f`](https://github.com/keystonejs/keystone/commit/556c1f95f287035493704d6f5d9744fd5e9774b6), [`3ca5038a0`](https://github.com/keystonejs/keystone/commit/3ca5038a021105a7452f4e7a4641107caa4ffe3a), [`d53eb872f`](https://github.com/keystonejs/keystone/commit/d53eb872ffb0396fcdcae34c380acf9739c8ca5d)]:
  - @keystone-ui/button@3.0.1
  - @keystone-ui/core@2.0.1
  - @keystone-ui/fields@2.0.1
  - @keystone-ui/icons@2.0.1
  - @keystone-ui/notice@2.0.1
  - @keystone-ui/toast@2.0.1
  - @keystone-ui/tooltip@2.0.1
  - @keystone-next/fields-document@3.0.0

## 1.0.0

### Major Changes

- [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf) [#4622](https://github.com/keystonejs/keystone/pull/4622) Thanks [@renovate](https://github.com/apps/renovate)! - Updated react and react-dom to v17

### Patch Changes

- [`28c2ee5be`](https://github.com/keystonejs/keystone/commit/28c2ee5bee5866c90c6f114e9120f57434f552fe) [#4811](https://github.com/keystonejs/keystone/pull/4811) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added syntax highlighting to code in mdx.

- Updated dependencies [[`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf)]:
  - @keystone-ui/button@3.0.0
  - @keystone-ui/core@2.0.0
  - @keystone-ui/fields@2.0.0
  - @keystone-ui/notice@2.0.0
  - @keystone-ui/tooltip@2.0.0

## 0.1.1

### Patch Changes

- [`75d3c521e`](https://github.com/keystonejs/keystone/commit/75d3c521e4f1f0a1eec9bc91319839a2afc000e0) [#4770](https://github.com/keystonejs/keystone/pull/4770) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded Next.js dependency to `10.0.5`.

## 0.1.0

### Minor Changes

- [`26543bd07`](https://github.com/keystonejs/keystone/commit/26543bd0752c470e336d61644c14e6a5333f65c0) [#4758](https://github.com/keystonejs/keystone/pull/4758) Thanks [@timleslie](https://github.com/timleslie)! - Added documentation for the `keystone-next` CLI.

### Patch Changes

- [`08a67e820`](https://github.com/keystonejs/keystone/commit/08a67e820ff3f8ce22ba3fb57d1730202b18fddf) [#4764](https://github.com/keystonejs/keystone/pull/4764) Thanks [@timleslie](https://github.com/timleslie)! - Moved API docs into a separate section from the Guides.

- [`4c635ae4b`](https://github.com/keystonejs/keystone/commit/4c635ae4bb5a4c4b5525103b55b145db7a443a63) [#4737](https://github.com/keystonejs/keystone/pull/4737) Thanks [@timleslie](https://github.com/timleslie)! - Added API placeholder.
