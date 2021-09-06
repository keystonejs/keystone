# @keystone-next/fields

## 15.0.0

### Major Changes

- [#6362](https://github.com/keystonejs/keystone/pull/6362) [`fd744dcaa`](https://github.com/keystonejs/keystone/commit/fd744dcaa513efb2a8ae954bb2d5d1fa7f0723d6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved `@keystone-next/fields` to `@keystone-next/keystone/fields`

## 14.0.0

### Major Changes

- [#6280](https://github.com/keystonejs/keystone/pull/6280) [`e9f3c42d5`](https://github.com/keystonejs/keystone/commit/e9f3c42d5b9d42872cecbd18fbe9bf9d7d53ed82) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `gqlType` option to `autoIncrement` field type. The field type will now always be represented with an `Int` in GraphQL

* [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `_ListKeyMeta` and `_toManyRelationshipFieldMeta` fields. You should use `listKeyCount` and `toManyRelationshipFieldCount` instead

- [#6266](https://github.com/keystonejs/keystone/pull/6266) [`b696a9579`](https://github.com/keystonejs/keystone/commit/b696a9579b503db86f42776381e247c4e1a7409f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Renamed `first` argument in find many queries to `take` to align with Prisma.

  ```graphql
  type Query {
    users(
      where: UserWhereInput! = {}
      orderBy: [UserOrderByInput!]! = []
      # previously was first: Int
      take: Int
      skip: Int! = 0
    ): [User!]
    # ...
  }

  type User {
    # ...
    posts(
      where: PostWhereInput! = {}
      orderBy: [PostOrderByInput!]! = []
      # previously was first: Int
      take: Int
      skip: Int! = 0
    ): [Post!]
    # ...
  }
  ```

* [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `search` argument from the GraphQL API for finding many items, Lists/DB API and to-many relationship fields. You should use `contains` filters instead.

- [#6095](https://github.com/keystonejs/keystone/pull/6095) [`272b97b3a`](https://github.com/keystonejs/keystone/commit/272b97b3a10c0dfada782171d55ef7ac6f47c98f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated filters to be nested instead of flattened and add top-level `NOT` operator. See the [Query Filter API docs](https://keystonejs.com/docs/apis/filters) and the upgrade guide for more information.

  ```graphql
  query {
    posts(where: { title: { contains: "Something" } }) {
      title
      content
    }
  }
  ```

* [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `sortBy` argument from the GraphQL API for finding many items, Lists/DB API and to-many relationship fields. You should use `orderBy` instead.

- [#6217](https://github.com/keystonejs/keystone/pull/6217) [`874f2c405`](https://github.com/keystonejs/keystone/commit/874f2c4058c9cf006213e84b9ffcf39c5bf144e8) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - `disconnectAll` has been renamed to `disconnect` in to-one relationship inputs and the old `disconnect` field has been removed. There are also seperate input types for create and update where the input for create doesn't have `disconnect`. It's also now required that if you provide a to-one relationship input, you must provide exactly one field to the input.

  If you have a list called `Item`, the to-one relationship inputs now look like this:

  ```graphql
  input ItemRelateToOneForCreateInput {
    create: ItemCreateInput
    connect: ItemWhereUniqueInput
  }
  input ItemRelateToOneForUpdateInput {
    create: ItemCreateInput
    connect: ItemWhereUniqueInput
    disconnect: Boolean
  }
  ```

* [#6224](https://github.com/keystonejs/keystone/pull/6224) [`3564b342d`](https://github.com/keystonejs/keystone/commit/3564b342d6dc2127ae591d7ac055af9eae90543c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - `disconnectAll` has been replaced by `set` in to-many relationship inputs, the equivalent to `disconnectAll: true` is now `set: []`. There are also seperate input types for create and update where the input for create doesn't have `disconnect` or `set`. The inputs in the lists in the input field are now also non-null.

  If you have a list called `Item`, the to-many relationship inputs now look like this:

  ```graphql
  input ItemRelateToManyForCreateInput {
    create: [ItemCreateInput!]
    connect: [ItemWhereUniqueInput!]
  }
  input ItemRelateToManyForUpdateInput {
    disconnect: [ItemWhereUniqueInput!]
    set: [ItemWhereUniqueInput!]
    create: [ItemCreateInput!]
    connect: [ItemWhereUniqueInput!]
  }
  ```

- [#6211](https://github.com/keystonejs/keystone/pull/6211) [`d214e2f72`](https://github.com/keystonejs/keystone/commit/d214e2f72bae1c798e2415a38410d6063c333e2e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The update mutations now accept `where` unique inputs instead of only an `id` and the `where` and `data` arguments are non-null.

  If you have a list called `Item`, the update mutations now look like this:

  ```graphql
  type Mutation {
    updateItem(where: ItemWhereUniqueInput!, data: ItemUpdateInput!): Item
    updateItems(data: [ItemUpdateArgs!]!): [Item]
  }

  input ItemUpdateArgs {
    where: ItemWhereUniqueInput!
    data: ItemUpdateInput!
  }
  ```

### Patch Changes

- [#6237](https://github.com/keystonejs/keystone/pull/6237) [`4f4f0351a`](https://github.com/keystonejs/keystone/commit/4f4f0351a056dea9d1614aa2a3a4789d66bb402d) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Updated timestamp field to default time to 00:00 when no time is selected.

* [#6197](https://github.com/keystonejs/keystone/pull/6197) [`4d9f89f88`](https://github.com/keystonejs/keystone/commit/4d9f89f884e2bf984fdd74ca2cbb7874b25b9cda) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The generated CRUD queries, and some of the input types, in the GraphQL API have been renamed.

  If you have a list called `Item`, the query for multiple values, `allItems` will be renamed to `items`. The query for a single value, `Item`, will be renamed to `item`.

  Also, the input type used in the `updateItems` mutation has been renamed from `ItemsUpdateInput` to `ItemUpdateArgs`.

* Updated dependencies [[`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`1cbcf54cb`](https://github.com/keystonejs/keystone/commit/1cbcf54cb1206461866b582865e3b1a8fc728f18), [`a92169d04`](https://github.com/keystonejs/keystone/commit/a92169d04e5a1a98deb8e757b8eae3b06fc66450), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`b696a9579`](https://github.com/keystonejs/keystone/commit/b696a9579b503db86f42776381e247c4e1a7409f), [`f3014a627`](https://github.com/keystonejs/keystone/commit/f3014a627060c7cd86440a6937da5caecfd023a0), [`092df6678`](https://github.com/keystonejs/keystone/commit/092df6678cea18d639be16ad250ec4ecc9250f5a), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`c2bb6a9a5`](https://github.com/keystonejs/keystone/commit/c2bb6a9a596fc52a3c61ec5d91c79758e417e61d), [`6da56b80e`](https://github.com/keystonejs/keystone/commit/6da56b80e03c748a621afcca6c1ec2887fef7271), [`697efa354`](https://github.com/keystonejs/keystone/commit/697efa354b1066b3d4b6eb757ca704b458f45e93), [`c7e331d90`](https://github.com/keystonejs/keystone/commit/c7e331d90a28b2ed8236100097cb8d34a11fabe2), [`3a7a06b2c`](https://github.com/keystonejs/keystone/commit/3a7a06b2cc6b5ea157d34d925b15494b471899eb), [`272b97b3a`](https://github.com/keystonejs/keystone/commit/272b97b3a10c0dfada782171d55ef7ac6f47c98f), [`78dac764e`](https://github.com/keystonejs/keystone/commit/78dac764e1860b33f9e2bd8cee6015abeaaa5ec4), [`399561b27`](https://github.com/keystonejs/keystone/commit/399561b2769ddd8f3d3fdf29838f5784404bb053), [`9d361c1c8`](https://github.com/keystonejs/keystone/commit/9d361c1c8625e1390f837b7318b63547d686a63b), [`0dcb1c95b`](https://github.com/keystonejs/keystone/commit/0dcb1c95b5200750cc8649485425f2ae40d023a3), [`94435ffee`](https://github.com/keystonejs/keystone/commit/94435ffee765824091899242e4a2f73c7356b524), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`56044e2a4`](https://github.com/keystonejs/keystone/commit/56044e2a425f4256b66475fd3b1a6342cd6c3bf9), [`f46fd32b7`](https://github.com/keystonejs/keystone/commit/f46fd32b7047dbb5ea2566859f7ecee8db5b0b15), [`874f2c405`](https://github.com/keystonejs/keystone/commit/874f2c4058c9cf006213e84b9ffcf39c5bf144e8), [`8ea4eed55`](https://github.com/keystonejs/keystone/commit/8ea4eed55367aaa213f6b4ffb7473087498e39ae), [`e3fe6498d`](https://github.com/keystonejs/keystone/commit/e3fe6498dc36203d8080dff3c2e0c25f6c98733e), [`6cd7ab78e`](https://github.com/keystonejs/keystone/commit/6cd7ab78e018fa0ffaddc1258426d23da19cd854), [`1030296d1`](https://github.com/keystonejs/keystone/commit/1030296d1f304dc44246e895089ac1f992e80590), [`3564b342d`](https://github.com/keystonejs/keystone/commit/3564b342d6dc2127ae591d7ac055af9eae90543c), [`8b2d179b2`](https://github.com/keystonejs/keystone/commit/8b2d179b2463d78b082182ca9afa8233109e0ba3), [`e3fefafcc`](https://github.com/keystonejs/keystone/commit/e3fefafcce6f8bf836c9bf0f4d931b8200ba41c7), [`4d9f89f88`](https://github.com/keystonejs/keystone/commit/4d9f89f884e2bf984fdd74ca2cbb7874b25b9cda), [`686c0f1c4`](https://github.com/keystonejs/keystone/commit/686c0f1c4a1feb609e1584aa71738709bbbf984e), [`8187ea019`](https://github.com/keystonejs/keystone/commit/8187ea019a212874f3c602573af3382c6f3bd3b2), [`d214e2f72`](https://github.com/keystonejs/keystone/commit/d214e2f72bae1c798e2415a38410d6063c333e2e), [`f5e64af37`](https://github.com/keystonejs/keystone/commit/f5e64af37df2eb460c89d89fa3c8924fb34970ed)]:
  - @keystone-next/keystone@24.0.0
  - @keystone-next/types@24.0.0
  - @keystone-ui/toast@4.0.2
  - @keystone-ui/segmented-control@4.0.2
  - @keystone-next/admin-ui-utils@5.0.6
  - @keystone-next/utils@1.0.4

## 13.0.0

### Major Changes

- [#6105](https://github.com/keystonejs/keystone/pull/6105) [`e5f61ad50`](https://github.com/keystonejs/keystone/commit/e5f61ad50133a328fcb32299b838fd9eac574c3f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed unnecessary descriptions on GraphQL types.

* [#6165](https://github.com/keystonejs/keystone/pull/6165) [`e4e6cf9b5`](https://github.com/keystonejs/keystone/commit/e4e6cf9b59eec461d2b53acfa3b350e4f5a06fc4) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `ui.searchFields` option to lists to allow searching by multiple fields in the Admin UI (the only current usage of this is in the select used in relationship fields) and to replace the usage of the `search` GraphQL argument which will be removed soon and should be replaced by using `contains` filters directly.

### Patch Changes

- [#6180](https://github.com/keystonejs/keystone/pull/6180) [`a11e54d69`](https://github.com/keystonejs/keystone/commit/a11e54d692d3cec4ec2439cbf743b590688fb7d3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed issues with React hooks dependency arrays

* [#6110](https://github.com/keystonejs/keystone/pull/6110) [`2ef6fe82c`](https://github.com/keystonejs/keystone/commit/2ef6fe82cee6df7796935d35d1c12cab29aecc75) Thanks [@ChuckJonas](https://github.com/ChuckJonas)! - Fixed virtual field rendering of false & 0 values.

* Updated dependencies [[`3f03b8c1f`](https://github.com/keystonejs/keystone/commit/3f03b8c1fa7005b37371e1cc401c3a03334a4f7a), [`ea0712aa2`](https://github.com/keystonejs/keystone/commit/ea0712aa22487325bd898818ea4fbca543c9dcf1), [`93f1e5d30`](https://github.com/keystonejs/keystone/commit/93f1e5d302701c610b6cba74e0c5c86a3ac8aacc), [`9e2deac5f`](https://github.com/keystonejs/keystone/commit/9e2deac5f340b4baeb03b01ae065f2bec5977523), [`7716315ea`](https://github.com/keystonejs/keystone/commit/7716315ea823dd91d17d54dcbb9155b5445cd956), [`a11e54d69`](https://github.com/keystonejs/keystone/commit/a11e54d692d3cec4ec2439cbf743b590688fb7d3), [`e5f61ad50`](https://github.com/keystonejs/keystone/commit/e5f61ad50133a328fcb32299b838fd9eac574c3f), [`9e2deac5f`](https://github.com/keystonejs/keystone/commit/9e2deac5f340b4baeb03b01ae065f2bec5977523), [`e4e6cf9b5`](https://github.com/keystonejs/keystone/commit/e4e6cf9b59eec461d2b53acfa3b350e4f5a06fc4), [`dd7e811e7`](https://github.com/keystonejs/keystone/commit/dd7e811e7ce084c1e832acefc6ed773af371ac9e), [`587a8d0b0`](https://github.com/keystonejs/keystone/commit/587a8d0b074ccecb239d120275359f72779f306f), [`597edbdd8`](https://github.com/keystonejs/keystone/commit/597edbdd81df80982dd3df3d9d600003ef8a15e9), [`1172e1853`](https://github.com/keystonejs/keystone/commit/1172e18531064df6412c06412e74da3b85740b35), [`fbe698461`](https://github.com/keystonejs/keystone/commit/fbe6984616de7a302db7c2b0082851db89c2e314), [`32e9879db`](https://github.com/keystonejs/keystone/commit/32e9879db9cfee77f067eb8105262df65bca6c06)]:
  - @keystone-next/keystone@23.0.0
  - @keystone-next/types@23.0.0
  - @keystone-ui/tooltip@4.0.1
  - @keystone-next/admin-ui-utils@5.0.5
  - @keystone-next/utils@1.0.3

## 12.0.0

### Major Changes

- [#6027](https://github.com/keystonejs/keystone/pull/6027) [`38b78f2ae`](https://github.com/keystonejs/keystone/commit/38b78f2aeaf4c5d8176a1751ad8cb5a7acce2790) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependency to `2.26.0`.

### Patch Changes

- [#6087](https://github.com/keystonejs/keystone/pull/6087) [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951) Thanks [@JedWatson](https://github.com/JedWatson)! - Move source code from the `packages-next` to the `packages` directory.

* [#6045](https://github.com/keystonejs/keystone/pull/6045) [`253df44c2`](https://github.com/keystonejs/keystone/commit/253df44c2f8d6535a6425b2593eaed5380433d57) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed confusing error when providing fields that don't exist to `ui.cardFields`, `ui.inlineCreate.fields` and `ui.inlineEdit.fields`.

- [#6041](https://github.com/keystonejs/keystone/pull/6041) [`c536b478f`](https://github.com/keystonejs/keystone/commit/c536b478fc89f2d933cddf8533e7d88030540a63) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `relationship` field with `displayMode: 'cards'` not using labels for related items in the cell view.

- Updated dependencies [[`38b78f2ae`](https://github.com/keystonejs/keystone/commit/38b78f2aeaf4c5d8176a1751ad8cb5a7acce2790), [`5f3d407d7`](https://github.com/keystonejs/keystone/commit/5f3d407d79171f04ae877e8eaed9a7f9d5671705), [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951), [`279403cb0`](https://github.com/keystonejs/keystone/commit/279403cb0b4bffb946763c9a7ef71be57478eeb3), [`253df44c2`](https://github.com/keystonejs/keystone/commit/253df44c2f8d6535a6425b2593eaed5380433d57), [`f482db633`](https://github.com/keystonejs/keystone/commit/f482db6332e54a1d5cd469e2805b99b544208e83)]:
  - @keystone-next/keystone@22.0.0
  - @keystone-next/types@22.0.0
  - @keystone-ui/core@3.1.1
  - @keystone-next/admin-ui-utils@5.0.4
  - @keystone-next/utils@1.0.2

## 11.0.3

### Patch Changes

- [#6029](https://github.com/keystonejs/keystone/pull/6029) [`038cd09a2`](https://github.com/keystonejs/keystone/commit/038cd09a201081e3f56ffd75577e6b74a6eb19e5) Thanks [@bladey](https://github.com/bladey)! - Updated Keystone URL reference from next.keystonejs.com to keystonejs.com.

* [#6031](https://github.com/keystonejs/keystone/pull/6031) [`0988f08c2`](https://github.com/keystonejs/keystone/commit/0988f08c2a88a0da6b85a385caf48ff093e1f9e5) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `relationship` field not passing through access control, hooks, ui and graphql options to Keystone.

* Updated dependencies [[`038cd09a2`](https://github.com/keystonejs/keystone/commit/038cd09a201081e3f56ffd75577e6b74a6eb19e5)]:
  - @keystone-next/keystone@21.0.2
  - @keystone-next/types@21.0.1

## 11.0.2

### Patch Changes

- Updated dependencies [[`03f535ba6`](https://github.com/keystonejs/keystone/commit/03f535ba6fa1a5e5f3027bcad761feb3fd94587b), [`03f535ba6`](https://github.com/keystonejs/keystone/commit/03f535ba6fa1a5e5f3027bcad761feb3fd94587b)]:
  - @keystone-next/keystone@21.0.0
  - @keystone-next/types@21.0.0
  - @keystone-next/admin-ui-utils@5.0.3
  - @keystone-next/utils@1.0.1

## 11.0.1

### Patch Changes

- [#5925](https://github.com/keystonejs/keystone/pull/5925) [`de0a5c19e`](https://github.com/keystonejs/keystone/commit/de0a5c19e656360ea3febc7e0240543c7817253e) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused dependencies.

* [#5932](https://github.com/keystonejs/keystone/pull/5932) [`7a25925c3`](https://github.com/keystonejs/keystone/commit/7a25925c3dc5b2af2cf1209ee949563fb71a4a8c) Thanks [@timleslie](https://github.com/timleslie)! - Initial release of `@keystone-next/utils` package.

- [#5992](https://github.com/keystonejs/keystone/pull/5992) [`543154bc0`](https://github.com/keystonejs/keystone/commit/543154bc081dde33ea29b8a2bff1d3033d538077) Thanks [@timleslie](https://github.com/timleslie)! - Pinned dependency `decimal.js` to `10.2.1` to be consistent with Prisma.

* [#5987](https://github.com/keystonejs/keystone/pull/5987) [`972e04514`](https://github.com/keystonejs/keystone/commit/972e045145711e39fd6fa167cb87fa05e062272c) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed autoFocus always being active in the text field Filter component.

* Updated dependencies [[`10b36551a`](https://github.com/keystonejs/keystone/commit/10b36551ac3a88da2cfeba3d065d6dd36041e769), [`8afbab763`](https://github.com/keystonejs/keystone/commit/8afbab7636b4236c6604311819160d5f1420a90e), [`7a25925c3`](https://github.com/keystonejs/keystone/commit/7a25925c3dc5b2af2cf1209ee949563fb71a4a8c), [`50ad1ce6b`](https://github.com/keystonejs/keystone/commit/50ad1ce6be90f5fb2481840dbd01328b6f629432), [`972e04514`](https://github.com/keystonejs/keystone/commit/972e045145711e39fd6fa167cb87fa05e062272c), [`0df3734d5`](https://github.com/keystonejs/keystone/commit/0df3734d52a89df30f1d555d003002cb79ad9e9a), [`123042b04`](https://github.com/keystonejs/keystone/commit/123042b047f3242ac95d2c5280de8c07f18a86be), [`4e5634b86`](https://github.com/keystonejs/keystone/commit/4e5634b86a26819cecec5b10c18f9d231b5434e2), [`006afd108`](https://github.com/keystonejs/keystone/commit/006afd1082b474bac2499bed57bcaccf1e1d6138), [`40a44d20d`](https://github.com/keystonejs/keystone/commit/40a44d20d2eda2bcfb311fc3ce05936623230205), [`972e04514`](https://github.com/keystonejs/keystone/commit/972e045145711e39fd6fa167cb87fa05e062272c), [`543154bc0`](https://github.com/keystonejs/keystone/commit/543154bc081dde33ea29b8a2bff1d3033d538077), [`3be09ea54`](https://github.com/keystonejs/keystone/commit/3be09ea548861b490dad8b50e58980580d366434), [`eab130f30`](https://github.com/keystonejs/keystone/commit/eab130f30d79b82c18b3cce0bc054abe2c1b58fd)]:
  - @keystone-next/keystone@20.0.1
  - @keystone-next/utils@1.0.0
  - @keystone-next/types@20.0.1
  - @keystone-ui/fields@4.1.2
  - @keystone-ui/toast@4.0.1
  - @keystone-ui/pill@5.0.0

## 11.0.0

### Major Changes

- [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The relationship field now returns a `[Item!]` instead of a `[Item!]!`, this is so that if an error occurs when resolving the related items, only the relationship field will be returned as null rather than the whole item being returned as null.

* [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The API to configure `virtual` fields has changed to accept a `field` using the `schema` API exported from `@keystone-next/types` rather than GraphQL SDL.

- [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The core of Keystone has been re-implemented to make implementing fields and new features in Keystone easier. While the observable changes for most users should be minimal, there could be breakage. If you implemented a custom field type, you will need to change it to the new API, see fields in the `@keystone-next/fields` package for inspiration on how to do this.

* [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The `password` field type now adds a GraphQL type `PasswordState` to the GraphQL output type instead of adding `${fieldKey}_is_set`.

  ```graphql
  type User {
    password: PasswordState
  }

  type PasswordState {
    isSet: Boolean!
  }
  ```

- [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The way that the implementations of `generateHash` and `compare` are passed from the password field to auth has changed to be in the extensions object of the GraphQL output field. Unless you've written your own password field implementation or you're using mismatching versions of @keystone-next/auth and @keystone-next/fields, this won't affect you.

* [#5891](https://github.com/keystonejs/keystone/pull/5891) [`97fd5e05d`](https://github.com/keystonejs/keystone/commit/97fd5e05d8681bae86001e6b7e8e3f36ebd639b7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added support for filtering uniquely by `text` and `integer` fields that have `isUnique: true` like this:

  ```graphql
  query {
    Post(where: { slug: "something-something-something" }) {
      id
      title
      content
    }
  }
  ```

### Minor Changes

- [#5854](https://github.com/keystonejs/keystone/pull/5854) [`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Replaced the types `FileMode` and `ImageMode` with `AssetMode`.

  Added internal experimental Keystone Cloud integration capabilities for images.

* [#5868](https://github.com/keystonejs/keystone/pull/5868) [`84a5e7f3b`](https://github.com/keystonejs/keystone/commit/84a5e7f3bc3a29ff31d642831e7aaadfc8534ba1) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Added experimental support for the integration with keystone cloud files

### Patch Changes

- [#5855](https://github.com/keystonejs/keystone/pull/5855) [`e4c19f808`](https://github.com/keystonejs/keystone/commit/e4c19f8086cc14f7f4a8ef390f1f4e1263004d40) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added assorted accessibility and layout fixes to the relationship field.

* [#5857](https://github.com/keystonejs/keystone/pull/5857) [`881c9ffb7`](https://github.com/keystonejs/keystone/commit/881c9ffb7c5941e9fb214ed955148d8ea567e65f) Thanks [@bladey](https://github.com/bladey)! - Fixed image not displaying when rendered in card format.

- [#5852](https://github.com/keystonejs/keystone/pull/5852) [`ef14e77ce`](https://github.com/keystonejs/keystone/commit/ef14e77cebc9420db8c7d29dfe61f02140f4a705) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed labels in `image` and `file` fields to be more screen reader friendly.

* [#5893](https://github.com/keystonejs/keystone/pull/5893) [`df7d7b6f6`](https://github.com/keystonejs/keystone/commit/df7d7b6f6f2830573393560f4a1ec35234889947) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed labels in timestamp field for better screen reader experience.

* Updated dependencies [[`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4), [`df7d7b6f6`](https://github.com/keystonejs/keystone/commit/df7d7b6f6f2830573393560f4a1ec35234889947), [`5227234a0`](https://github.com/keystonejs/keystone/commit/5227234a08edd99cd2795c8d888fbb3022810f54), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`98482efa4`](https://github.com/keystonejs/keystone/commit/98482efa4f629fe513fddd6871be1ef5bdd8d2bd), [`4995c682d`](https://github.com/keystonejs/keystone/commit/4995c682dbdcfac2100de9fab98ba1e0e08cbcc2), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`4c90c0d3c`](https://github.com/keystonejs/keystone/commit/4c90c0d3c8e75c6a58910c4bd563b3b80e61e801), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`84a5e7f3b`](https://github.com/keystonejs/keystone/commit/84a5e7f3bc3a29ff31d642831e7aaadfc8534ba1), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`8958704ec`](https://github.com/keystonejs/keystone/commit/8958704ec9819cd27ad1cae251628ad38dad1c79), [`97fd5e05d`](https://github.com/keystonejs/keystone/commit/97fd5e05d8681bae86001e6b7e8e3f36ebd639b7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7)]:
  - @keystone-next/keystone@20.0.0
  - @keystone-next/types@20.0.0
  - @keystone-next/utils-legacy@12.0.0
  - @keystone-ui/fields@4.1.1
  - @keystone-ui/segmented-control@4.0.1
  - @keystone-ui/core@3.1.0
  - @keystone-next/admin-ui-utils@5.0.2

## 10.0.0

### Major Changes

- [#5797](https://github.com/keystonejs/keystone/pull/5797) [`a6a444acd`](https://github.com/keystonejs/keystone/commit/a6a444acd23f2590d9812872441cafb5d088c48e) Thanks [@timleslie](https://github.com/timleslie)! - The GraphQL field `_all<path>Meta { count }` generated for `many` relationships has been deprecated in favour of a new field `<path>Count`, which directly returns the count.

  A `posts` relationship field would have the following field added to the API:

  ```graphql
  postsCount(where: PostWhereInput! = {}): Int
  ```

### Minor Changes

- [#5779](https://github.com/keystonejs/keystone/pull/5779) [`59421c039`](https://github.com/keystonejs/keystone/commit/59421c0399368e56e46537c1c687daa27f5912d0) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added `json` field.

### Patch Changes

- [#5815](https://github.com/keystonejs/keystone/pull/5815) [`b9c828fb0`](https://github.com/keystonejs/keystone/commit/b9c828fb0d6e587976dbd0dc4e87004bce3b2ef7) Thanks [@timleslie](https://github.com/timleslie)! - Fixed the type of `originalInput` in the argument to `defaultValue`.

* [#5799](https://github.com/keystonejs/keystone/pull/5799) [`0617c81ea`](https://github.com/keystonejs/keystone/commit/0617c81eacc88e40bdd21bacab285d674b171a4a) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed field label element, so that it actually refers to the text input.

- [#5800](https://github.com/keystonejs/keystone/pull/5800) [`590bb1fe9`](https://github.com/keystonejs/keystone/commit/590bb1fe9254c2f8feff7e3a0e2e964610116f95) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Fixed text, decimal, float and integer field labels. Labels are now associated with inputs via the field.path attribute.

* [#5764](https://github.com/keystonejs/keystone/pull/5764) [`19a756496`](https://github.com/keystonejs/keystone/commit/19a7564964d9dcdc94ecdda9c0a0e92c539eb309) Thanks [@bladey](https://github.com/bladey)! - Adjusted fields GqlAuxQueries function to return any type to prevent build errors.

* Updated dependencies [[`0eadba2ba`](https://github.com/keystonejs/keystone/commit/0eadba2badb13fc6a17f7e525d429494ca953481), [`f52079f0b`](https://github.com/keystonejs/keystone/commit/f52079f0bffc4cf2ab5e26e4c3654127b59d6078), [`b9c828fb0`](https://github.com/keystonejs/keystone/commit/b9c828fb0d6e587976dbd0dc4e87004bce3b2ef7), [`74bc77854`](https://github.com/keystonejs/keystone/commit/74bc778547623fe4ed3db97ed09384d9dc076372), [`29075e580`](https://github.com/keystonejs/keystone/commit/29075e58074672d90cfca84aba8dcedeecf243ca), [`5cc35170f`](https://github.com/keystonejs/keystone/commit/5cc35170fd46118089a2a6f863d782aff989bbf0), [`319c19bd5`](https://github.com/keystonejs/keystone/commit/319c19bd5f8e8c261a1aefb1997d66b2a136ae28), [`c6cd0a6bd`](https://github.com/keystonejs/keystone/commit/c6cd0a6bdc7ccb000c39fba0da31819e33d9e056), [`195d4fb12`](https://github.com/keystonejs/keystone/commit/195d4fb1218517d7b9a40d3bba1a087d40e6d1d6), [`1fe4753f3`](https://github.com/keystonejs/keystone/commit/1fe4753f3af28aa851e1f90d55937c940be5af1a), [`5b02e8625`](https://github.com/keystonejs/keystone/commit/5b02e8625e18c8e79547d5caf8cacb5014ffee9d), [`76cdb791b`](https://github.com/keystonejs/keystone/commit/76cdb791b1ab36d015e43b87deff52be2ea6b629), [`762f17823`](https://github.com/keystonejs/keystone/commit/762f1782334c9b7174c320182c753c215834ff7f), [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a), [`107eeb037`](https://github.com/keystonejs/keystone/commit/107eeb0374e214b69be3727ca955a9f76e1468bb), [`3a7acc2c5`](https://github.com/keystonejs/keystone/commit/3a7acc2c5114fbcbde994d1f4c6cc0b21c572ec0), [`9de71a9fb`](https://github.com/keystonejs/keystone/commit/9de71a9fb0d3b7f5f05c0d908bebdb818723fd4b), [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394), [`7bda87ea7`](https://github.com/keystonejs/keystone/commit/7bda87ea7f11e0faceccc6ab3f715c72b07c129b), [`4b11c5ea8`](https://github.com/keystonejs/keystone/commit/4b11c5ea87b759c24bdbff9d18443bbc972757c0), [`38a177d61`](https://github.com/keystonejs/keystone/commit/38a177d6140874b29d3c09b5852dbfd787d5c429), [`bb4f4ac91`](https://github.com/keystonejs/keystone/commit/bb4f4ac91c3ed70393774f744075971453a12aba)]:
  - @keystone-next/keystone@19.0.0
  - @keystone-next/types@19.0.0
  - @keystone-next/adapter-prisma-legacy@8.0.0
  - @keystone-ui/fields@4.1.0
  - @keystone-next/admin-ui-utils@5.0.1
  - @keystone-next/utils-legacy@11.0.1

## 9.0.0

### Major Changes

- [#5746](https://github.com/keystonejs/keystone/pull/5746) [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d) Thanks [@timleslie](https://github.com/timleslie)! - Update Node.js dependency to `^12.20 || >= 14.13`.

* [#5677](https://github.com/keystonejs/keystone/pull/5677) [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab) Thanks [@timleslie](https://github.com/timleslie)! - Consolidated the `@keystone-next/admin-ui` package into `@keystone-next/keystone`.

  If you were directly importing from `@keystone-next/admin-ui` you can now import the same items from `@keystone-next/keystone/admin-ui`.
  If you have `@keystone-next/admin-ui` in your `package.json` you should remove it.

### Patch Changes

- Updated dependencies [[`d40c2a590`](https://github.com/keystonejs/keystone/commit/d40c2a5903f07e5a1e80d116ec4cea00289bbf6a), [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d), [`016ccad82`](https://github.com/keystonejs/keystone/commit/016ccad82ed73898a64310506117c1cbae60a512), [`8da79e71a`](https://github.com/keystonejs/keystone/commit/8da79e71abb005eb755620fb3c8f82a3a2952152), [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab)]:
  - @keystone-next/adapter-prisma-legacy@7.0.0
  - @keystone-ui/button@5.0.0
  - @keystone-ui/core@3.0.0
  - @keystone-ui/fields@4.0.0
  - @keystone-ui/icons@4.0.0
  - @keystone-ui/loading@4.0.0
  - @keystone-ui/modals@4.0.0
  - @keystone-ui/pill@4.0.0
  - @keystone-ui/segmented-control@4.0.0
  - @keystone-ui/toast@4.0.0
  - @keystone-ui/tooltip@4.0.0
  - @keystone-next/admin-ui-utils@5.0.0
  - @keystone-next/keystone@18.0.0
  - @keystone-next/types@18.0.0
  - @keystone-next/access-control-legacy@11.0.0
  - @keystone-next/utils-legacy@11.0.0

## 8.2.0

### Minor Changes

- [#5630](https://github.com/keystonejs/keystone/pull/5630) [`79a0844b9`](https://github.com/keystonejs/keystone/commit/79a0844b9d5125891e3eaad4dc3999b232cefaa2) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `ui.displayMode: 'count'` to `many` relationship fields

### Patch Changes

- [#5629](https://github.com/keystonejs/keystone/pull/5629) [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Updated docs link to next.keystonejs.com.

* [#5639](https://github.com/keystonejs/keystone/pull/5639) [`400d88257`](https://github.com/keystonejs/keystone/commit/400d88257a3383595cf76c9399848b356dd51a11) Thanks [@timleslie](https://github.com/timleslie)! - Fixed Admin UI issues when using `select` fields with `dataType: 'integer'`.

- [#5622](https://github.com/keystonejs/keystone/pull/5622) [`bb8920843`](https://github.com/keystonejs/keystone/commit/bb8920843a1e0d803b8238bd17e9d65802698685) Thanks [@timleslie](https://github.com/timleslie)! - Disabled sorting for relationship fields.

- Updated dependencies [[`3aea3b12f`](https://github.com/keystonejs/keystone/commit/3aea3b12fd0047e54671ead796fca15b625ade66), [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857), [`b0a72a112`](https://github.com/keystonejs/keystone/commit/b0a72a112dae7857defc8b745e674d55a29be766), [`2b3efc8a8`](https://github.com/keystonejs/keystone/commit/2b3efc8a883e1e5832ed5111a6e0e4d3ee59f162), [`fc9c3d55d`](https://github.com/keystonejs/keystone/commit/fc9c3d55d5a2e6a87bcb9e9ed50a19a503290457), [`dbe831976`](https://github.com/keystonejs/keystone/commit/dbe831976eeee876f3722d4b96e1b752b67cb945), [`53225b0ef`](https://github.com/keystonejs/keystone/commit/53225b0efcf33810c1c91a0a4ec3e2369733ab0a), [`79d092afc`](https://github.com/keystonejs/keystone/commit/79d092afca565abe780e84d917299ecb749752f1)]:
  - @keystone-next/admin-ui@14.1.2
  - @keystone-ui/core@2.0.3

## 8.1.0

### Minor Changes

- [#5616](https://github.com/keystonejs/keystone/pull/5616) [`3d3894679`](https://github.com/keystonejs/keystone/commit/3d38946798650d117c39ce522987b169e616b2b9) Thanks [@timleslie](https://github.com/timleslie)! - Added an `isIndexed` config option to the `text`, `integer`, `float`, `select`, and `timestamp` field types.

### Patch Changes

- Updated dependencies [[`3d3894679`](https://github.com/keystonejs/keystone/commit/3d38946798650d117c39ce522987b169e616b2b9), [`8b77b6971`](https://github.com/keystonejs/keystone/commit/8b77b697187f8d5eb73e862b2c07b8bfbb769e0b)]:
  - @keystone-next/adapter-prisma-legacy@6.1.0
  - @keystone-next/admin-ui@14.1.1

## 8.0.0

### Major Changes

- [#5578](https://github.com/keystonejs/keystone/pull/5578) [`f7d4c9b9f`](https://github.com/keystonejs/keystone/commit/f7d4c9b9f06cc3090b59d4b29e0907e9f3d1faee) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced `mode` field on `ImageFieldOutput` GraphQL type with making `ImageFieldOutput` an interface and having a `LocalImageFieldOutput` type that implements `ImageFieldOutput`.

* [#5582](https://github.com/keystonejs/keystone/pull/5582) [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Changed image ref to now be `${mode}:image:${id}`.

### Minor Changes

- [#5529](https://github.com/keystonejs/keystone/pull/5529) [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Added file field type.

### Patch Changes

- [#5514](https://github.com/keystonejs/keystone/pull/5514) [`8577eb3ba`](https://github.com/keystonejs/keystone/commit/8577eb3baafe9cd61c48d89aca9eff252765e5a6) Thanks [@timleslie](https://github.com/timleslie)! - The field hooks API has deprecated the `addFieldValidationError` argument. It has been replaced with the argument `addValidationError`, and will be removed in a future release.

* [#5587](https://github.com/keystonejs/keystone/pull/5587) [`3e33cd3ff`](https://github.com/keystonejs/keystone/commit/3e33cd3ff46f824ec3516e5810a7e5027b332a5a) Thanks [@timleslie](https://github.com/timleslie)! - Simplified image input resolver.

* Updated dependencies [[`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`7e81b52b0`](https://github.com/keystonejs/keystone/commit/7e81b52b0f2240f0c590eb8f6733360cab9fe93a), [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5), [`fdebf79cc`](https://github.com/keystonejs/keystone/commit/fdebf79cc3520ffb65979ddac7d61791f4f37324), [`dbc62ff7c`](https://github.com/keystonejs/keystone/commit/dbc62ff7c71ca4d4db1fab76f3e0ab729af5b80c), [`05d4883ee`](https://github.com/keystonejs/keystone/commit/05d4883ee19bcfdfcbff7f80693a3fa85cf81aaa), [`a0c5aa307`](https://github.com/keystonejs/keystone/commit/a0c5aa30771d187253d0cfe24b4b686e136136cc), [`9fd7cc62a`](https://github.com/keystonejs/keystone/commit/9fd7cc62a889f8a0f8933040bb16fcc36af7795e), [`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1), [`74fed41e2`](https://github.com/keystonejs/keystone/commit/74fed41e23c3d5c6c073574c54ca339df2235351)]:
  - @keystone-next/admin-ui@14.1.0
  - @keystone-next/types@17.0.1
  - @keystone-next/adapter-prisma-legacy@6.0.1
  - @keystone-next/utils-legacy@10.0.0
  - @keystone-next/access-control-legacy@10.0.1

## 7.0.0

### Major Changes

- [#5478](https://github.com/keystonejs/keystone/pull/5478) [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed) Thanks [@timleslie](https://github.com/timleslie)! - Improved types for `BaseKeystoneList`.

* [#5397](https://github.com/keystonejs/keystone/pull/5397) [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b) Thanks [@bladey](https://github.com/bladey)! - Updated Node engine version to 12.x due to 10.x reaching EOL on 2021-04-30.

- [#5420](https://github.com/keystonejs/keystone/pull/5420) [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2) Thanks [@timleslie](https://github.com/timleslie)! - Updated core fields implementation to expect an internal option `type.adapter` rather than `type.adapters.prisma`.

### Minor Changes

- [#5415](https://github.com/keystonejs/keystone/pull/5415) [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f) Thanks [@timleslie](https://github.com/timleslie)! - Exported the types `FieldConfigArgs` and `FieldExtraArgs`.

* [#5396](https://github.com/keystonejs/keystone/pull/5396) [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Added new image field type.

- [#5400](https://github.com/keystonejs/keystone/pull/5400) [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276) Thanks [@timleslie](https://github.com/timleslie)! - Moved the `Implementation` base class from the `fields-legacy` package into the `fields` package.

### Patch Changes

- [#5406](https://github.com/keystonejs/keystone/pull/5406) [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767) Thanks [@timleslie](https://github.com/timleslie)! - Fixed a bug which added unsupported string filter options to the GraphQL API for the SQLite provider.
  Added a `.containsInputFields()` method to include string filters just for the `contains` and `not_contains` options.

* [#5403](https://github.com/keystonejs/keystone/pull/5403) [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Replaced inflection.humanize usage with custom fn to account for edge cases.

- [#5452](https://github.com/keystonejs/keystone/pull/5452) [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124) Thanks [@timleslie](https://github.com/timleslie)! - Removed the legacy `defaultAccess` argument from the `Keystone` constructor.

* [#5392](https://github.com/keystonejs/keystone/pull/5392) [`f059f6349`](https://github.com/keystonejs/keystone/commit/f059f6349bee3dce8bbf4a0584b235e97872851c) Thanks [@timleslie](https://github.com/timleslie)! - Removed the dependency on the legacy `AutoIncrement` field implementation.

- [#5442](https://github.com/keystonejs/keystone/pull/5442) [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db) Thanks [@timleslie](https://github.com/timleslie)! - Updated type definitions to be more consistent and correct.

* [#5466](https://github.com/keystonejs/keystone/pull/5466) [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78) Thanks [@timleslie](https://github.com/timleslie)! - Improved the `BaseKeystone` type to be more correct.

- [#5374](https://github.com/keystonejs/keystone/pull/5374) [`89b869e8d`](https://github.com/keystonejs/keystone/commit/89b869e8d492151449f2146108767a7e5e5ecdfa) Thanks [@timleslie](https://github.com/timleslie)! - Removed an outdated reference to `mongoId`.

* [#5408](https://github.com/keystonejs/keystone/pull/5408) [`58a793988`](https://github.com/keystonejs/keystone/commit/58a7939888ec84d0f089d77ca1ce9d94ef0d9a85) Thanks [@timleslie](https://github.com/timleslie)! - Fixed an issue where `virtual` fields could have `create` and `update` access control set to something other than `false`.

* Updated dependencies [[`9e060fe83`](https://github.com/keystonejs/keystone/commit/9e060fe83459269bc5d257f31a23c164d2283624), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`b0db0a7a8`](https://github.com/keystonejs/keystone/commit/b0db0a7a8d3aa46a8034022c456ea5100b129dc0), [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`8ab2c9bb6`](https://github.com/keystonejs/keystone/commit/8ab2c9bb6633c2f85844e658f534582c30a39a57), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`5f2673704`](https://github.com/keystonejs/keystone/commit/5f2673704e997710a088c45e9d95d22e1195b2da), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`ea708559f`](https://github.com/keystonejs/keystone/commit/ea708559fbd19914fe7eb52f519937e5fe50a143), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`115b06130`](https://github.com/keystonejs/keystone/commit/115b06130d801e00dec88935a5d400e71f089853)]:
  - @keystone-next/admin-ui@14.0.0
  - @keystone-next/types@17.0.0
  - @keystone-next/adapter-prisma-legacy@6.0.0
  - @keystone-next/utils-legacy@9.0.0
  - @keystone-ui/button@4.0.0
  - @keystone-ui/fields@3.0.0
  - @keystone-ui/icons@3.0.0
  - @keystone-ui/loading@3.0.0
  - @keystone-ui/modals@3.0.0
  - @keystone-ui/pill@3.0.0
  - @keystone-ui/segmented-control@3.0.0
  - @keystone-ui/toast@3.0.0
  - @keystone-ui/tooltip@3.0.0
  - @keystone-next/admin-ui-utils@4.0.0
  - @keystone-next/access-control-legacy@10.0.0

## 6.0.0

### Major Changes

- [#5256](https://github.com/keystonejs/keystone/pull/5256) [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for the `mongoId` field type.

* [#5275](https://github.com/keystonejs/keystone/pull/5275) [`8665cfe66`](https://github.com/keystonejs/keystone/commit/8665cfe66016e0356681413e31f80a6d5586d364) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `mongoId` field type.

- [#5256](https://github.com/keystonejs/keystone/pull/5256) [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for the `knex` and `mongoose` database adapters. We now only support `prisma_postgresql` and `prisma_sqlite`.

### Patch Changes

- [#5280](https://github.com/keystonejs/keystone/pull/5280) [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `adapters-mongoose-legacy` packages dependency.

- Updated dependencies [[`e702fea44`](https://github.com/keystonejs/keystone/commit/e702fea44c3116db158d97b5ffd24440f09c9d49), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8), [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b), [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6), [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc), [`8665cfe66`](https://github.com/keystonejs/keystone/commit/8665cfe66016e0356681413e31f80a6d5586d364), [`fda82869c`](https://github.com/keystonejs/keystone/commit/fda82869c376d05fd007bec22d7bde2604db445b), [`4fa66ac1f`](https://github.com/keystonejs/keystone/commit/4fa66ac1fc6fd0a43da17dd90797733e8c958785), [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b), [`9e450d6b3`](https://github.com/keystonejs/keystone/commit/9e450d6b326e2ba5f46e49ecf53b6bd7a627e9ca), [`bc21855a7`](https://github.com/keystonejs/keystone/commit/bc21855a7ff6dd4dbc278b3e15c9157de765e6ba), [`d93bab17b`](https://github.com/keystonejs/keystone/commit/d93bab17b69c76e57580dc00e41314215da6d49b)]:
  - @keystone-next/fields-legacy@25.0.0
  - @keystone-next/types@16.0.0
  - @keystone-next/admin-ui@13.0.0
  - @keystone-next/fields-auto-increment-legacy@10.0.0
  - @keystone-ui/fields@2.1.0
  - @keystone-next/admin-ui-utils@3.0.3

## 5.4.0

### Minor Changes

- [#5217](https://github.com/keystonejs/keystone/pull/5217) [`da900777a`](https://github.com/keystonejs/keystone/commit/da900777a27264595a68fe1ed0e7a689944eb372) Thanks [@timleslie](https://github.com/timleslie)! - `select` field type now uses the correct underlying type, allowing the use of `{ dataType: 'enum' }` and `{ dataType: 'integer'}`.

### Patch Changes

- [#5216](https://github.com/keystonejs/keystone/pull/5216) [`0e01f471d`](https://github.com/keystonejs/keystone/commit/0e01f471dc669e46c88233cb8ce698749ddcf4fa) Thanks [@timleslie](https://github.com/timleslie)! - Added a default config value of `{}` for the `mongoId` field type.

* [#5212](https://github.com/keystonejs/keystone/pull/5212) [`76e5c7bd3`](https://github.com/keystonejs/keystone/commit/76e5c7bd3d5e4b74b1b3b6b6d6c23d087e81bb21) Thanks [@timleslie](https://github.com/timleslie)! - Moved test fixtures into the new packages.

* Updated dependencies [[`ca1be4156`](https://github.com/keystonejs/keystone/commit/ca1be415663dd822b3adda1e073bd7a1d4a9b97b), [`9e78d8818`](https://github.com/keystonejs/keystone/commit/9e78d88187d8d789e5f080fd4529742f54ff1ddd), [`4d405390c`](https://github.com/keystonejs/keystone/commit/4d405390c0f8dcc37e6fe4da7ce3866c699088f3), [`34dd809ee`](https://github.com/keystonejs/keystone/commit/34dd809eef2368bba1e50ed613b36c5dac7262d1), [`a8be4c860`](https://github.com/keystonejs/keystone/commit/a8be4c8602bcda63d96fc956ead8568d8c989ffc), [`0e1487385`](https://github.com/keystonejs/keystone/commit/0e1487385c42556c027a6f7bfbc9aa806b3cbd66), [`aa76102c1`](https://github.com/keystonejs/keystone/commit/aa76102c11bdfea02059df66f406a8b1d387c879), [`f448a8b3a`](https://github.com/keystonejs/keystone/commit/f448a8b3a36b295d4ce5ff9ef2fd7aabcdb5dacc)]:
  - @keystone-next/fields-legacy@24.0.0
  - @keystone-next/fields-auto-increment-legacy@9.0.0
  - @keystone-next/fields-mongoid-legacy@10.0.0
  - @keystone-next/types@15.0.1

## 5.3.0

### Minor Changes

- [#3946](https://github.com/keystonejs/keystone/pull/3946) [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05) Thanks [@timleslie](https://github.com/timleslie)! - Added experimental support for Prisma + SQLite as a database adapter.

### Patch Changes

- [#5131](https://github.com/keystonejs/keystone/pull/5131) [`1eeac4722`](https://github.com/keystonejs/keystone/commit/1eeac4722da174307152dad9b5adf5062e4b6403) Thanks [@timleslie](https://github.com/timleslie)! - Fixed type for `float({ defaultValue })`.

* [#5150](https://github.com/keystonejs/keystone/pull/5150) [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed) Thanks [@timleslie](https://github.com/timleslie)! - Applied eslint `import/order` rule.

- [#5113](https://github.com/keystonejs/keystone/pull/5113) [`ec6f9b601`](https://github.com/keystonejs/keystone/commit/ec6f9b601ea6fdbfb2335a5e81b7ec3f1b0e4d4d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed Admin UI not allowing negative values for float, decimal and integer

- Updated dependencies [[`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05), [`17c86e0c3`](https://github.com/keystonejs/keystone/commit/17c86e0c3eda7ba08d1bb8edf5eb8ddc9a819e5a), [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d), [`b84abebb6`](https://github.com/keystonejs/keystone/commit/b84abebb6c817172d04f338befa45b3573af55d6), [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`40d4fff5d`](https://github.com/keystonejs/keystone/commit/40d4fff5d63850cbd513c80bcb5e551e5782dc4b), [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55), [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0), [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91)]:
  - @keystone-next/types@15.0.0
  - @keystone-next/fields-legacy@23.1.0
  - @keystone-next/fields-auto-increment-legacy@8.2.0
  - @keystone-ui/fields@2.0.2
  - @keystone-ui/core@2.0.2
  - @keystone-next/admin-ui@12.0.0
  - @keystone-next/admin-ui-utils@3.0.2
  - @keystone-next/fields-mongoid-legacy@9.1.7

## 5.2.1

### Patch Changes

- Updated dependencies [[`c45cbb9b1`](https://github.com/keystonejs/keystone/commit/c45cbb9b14010b3ced7ea012f3502998ba2ec393), [`a2c52848a`](https://github.com/keystonejs/keystone/commit/a2c52848a3a7b66a1968a430040887194e6138d1), [`acc6e9772`](https://github.com/keystonejs/keystone/commit/acc6e9772b4a312a62ea756777034638c03a3761)]:
  - @keystone-next/fields-legacy@23.0.0
  - @keystone-next/admin-ui@11.0.0
  - @keystone-next/fields-auto-increment-legacy@8.1.6
  - @keystone-next/fields-mongoid-legacy@9.1.6

## 5.2.0

### Minor Changes

- [`aba7c45d7`](https://github.com/keystonejs/keystone/commit/aba7c45d7645aa71b50de070d37896b73248751a) [#4938](https://github.com/keystonejs/keystone/pull/4938) Thanks [@MurzNN](https://github.com/MurzNN)! - Added a `decimal` field type to keystone-next.

### Patch Changes

- Updated dependencies [[`aba7c45d7`](https://github.com/keystonejs/keystone/commit/aba7c45d7645aa71b50de070d37896b73248751a), [`9b202b31a`](https://github.com/keystonejs/keystone/commit/9b202b31a7d4944b709fe0ce58d6ca7ec1523a02)]:
  - @keystone-next/fields-legacy@22.1.0
  - @keystone-next/admin-ui@10.0.1
  - @keystone-next/types@14.0.1

## 5.1.0

### Minor Changes

- [`53b8b659f`](https://github.com/keystonejs/keystone/commit/53b8b659ffc7db41e0e0d9ad7393e6a821187340) [#4907](https://github.com/keystonejs/keystone/pull/4907) Thanks [@MurzNN](https://github.com/MurzNN)! - Added float field type for keystone-next

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

- Updated dependencies [[`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7), [`1c5a39972`](https://github.com/keystonejs/keystone/commit/1c5a39972759a0aad49aed2c4b19e2c70a993a8a), [`687fd5ef0`](https://github.com/keystonejs/keystone/commit/687fd5ef0f798da996f970af1591411f9cfe0985), [`9a9276eb7`](https://github.com/keystonejs/keystone/commit/9a9276eb7acded979b703b4f3ed8bce781e0718a), [`370c0ee62`](https://github.com/keystonejs/keystone/commit/370c0ee623b515177c3863e66545465c13d5c914), [`2655c0b1b`](https://github.com/keystonejs/keystone/commit/2655c0b1bf714d80d46e1ff4e414b4bce474c23d), [`7b84c4066`](https://github.com/keystonejs/keystone/commit/7b84c40661a086b5468cc4d4542dfb696bfc2f93), [`29e787983`](https://github.com/keystonejs/keystone/commit/29e787983bdc26b147d6b5f476e70768bbc5318c), [`d9c20ba66`](https://github.com/keystonejs/keystone/commit/d9c20ba66931077f6e18d3497282be328cfb629f), [`0e265f6c1`](https://github.com/keystonejs/keystone/commit/0e265f6c10eadd37f75e5551b22b50236e830086), [`24e0ef5b6`](https://github.com/keystonejs/keystone/commit/24e0ef5b6bd93c105fdef2caea6b862ff1dfd6f3), [`45ea93421`](https://github.com/keystonejs/keystone/commit/45ea93421f9a6cf9b7ccbd983e0c9cbd687ff6af), [`6c949dbf2`](https://github.com/keystonejs/keystone/commit/6c949dbf262350e280072d82cd48fdd31ff5ba6d), [`3ca5038a0`](https://github.com/keystonejs/keystone/commit/3ca5038a021105a7452f4e7a4641107caa4ffe3a), [`bea9008f8`](https://github.com/keystonejs/keystone/commit/bea9008f82efea7fcf1cb547f3841915cd4689cc), [`c63e5d75c`](https://github.com/keystonejs/keystone/commit/c63e5d75cd77cf26f8762bda8143d1c1db6d0e3e), [`0f86e99bb`](https://github.com/keystonejs/keystone/commit/0f86e99bb3aa15f691ab7ff79e5a9ae3d1ac464e), [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc)]:
  - @keystone-ui/button@3.0.1
  - @keystone-ui/core@2.0.1
  - @keystone-ui/fields@2.0.1
  - @keystone-ui/icons@2.0.1
  - @keystone-ui/loading@2.0.1
  - @keystone-ui/modals@2.0.1
  - @keystone-ui/segmented-control@2.0.1
  - @keystone-ui/toast@2.0.1
  - @keystone-ui/tooltip@2.0.1
  - @keystone-next/admin-ui@10.0.0
  - @keystone-next/admin-ui-utils@3.0.1
  - @keystone-next/types@14.0.0
  - @keystone-next/fields-legacy@22.0.1
  - @keystone-next/fields-auto-increment-legacy@8.1.5
  - @keystone-next/fields-mongoid-legacy@9.1.5

## 5.0.0

### Major Changes

- [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf) [#4622](https://github.com/keystonejs/keystone/pull/4622) Thanks [@renovate](https://github.com/apps/renovate)! - Updated react and react-dom to v17

### Patch Changes

- Updated dependencies [[`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`b97216a65`](https://github.com/keystonejs/keystone/commit/b97216a6526fffcca8232d86b115c28cb19587bf), [`208722a42`](https://github.com/keystonejs/keystone/commit/208722a4234434e116846756bab18f7e11674ec8), [`ad75e3d61`](https://github.com/keystonejs/keystone/commit/ad75e3d61c73ba1239fd21b58f175aac01d9f302), [`74f428353`](https://github.com/keystonejs/keystone/commit/74f428353b90958f97669cbcb78e18ca44438765), [`4035218df`](https://github.com/keystonejs/keystone/commit/4035218df390beff3d42c0d3fc21335230d8a60d), [`954350389`](https://github.com/keystonejs/keystone/commit/9543503894c3e78a9b69a75cbfb3ca6b85ae34e8), [`e29ae2749`](https://github.com/keystonejs/keystone/commit/e29ae2749321c103dd494eba6778ee4137bb2aa3), [`ee019cfc5`](https://github.com/keystonejs/keystone/commit/ee019cfc51a831d005524e5427d0ebe1c71a1dee), [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0)]:
  - @keystone-next/admin-ui@9.0.0
  - @keystonejs/fields@22.0.0
  - @keystone-next/admin-ui-utils@3.0.0
  - @keystone-ui/button@3.0.0
  - @keystone-ui/core@2.0.0
  - @keystone-ui/fields@2.0.0
  - @keystone-ui/icons@2.0.0
  - @keystone-ui/loading@2.0.0
  - @keystone-ui/modals@2.0.0
  - @keystone-ui/segmented-control@2.0.0
  - @keystone-ui/toast@2.0.0
  - @keystone-ui/tooltip@2.0.0
  - @keystone-next/types@13.0.0
  - @keystonejs/fields-auto-increment@8.1.4
  - @keystonejs/fields-mongoid@9.1.4

## 4.1.1

### Patch Changes

- Updated dependencies [[`1744c5f05`](https://github.com/keystonejs/keystone/commit/1744c5f05c9a13e680aaa1ed151f23f1d015ed9c), [`d9675553b`](https://github.com/keystonejs/keystone/commit/d9675553b33f39e2c7ada7eb6555d16e9fccb37e), [`fd0dff3fd`](https://github.com/keystonejs/keystone/commit/fd0dff3fdfcbe20b2884357a6e1b20f1b7307652), [`5be53ddc3`](https://github.com/keystonejs/keystone/commit/5be53ddc39be1415d56e2fa5e7898ab9edf468d5), [`fb8bcff91`](https://github.com/keystonejs/keystone/commit/fb8bcff91ef487730164c3330e0742ab13d9b3d7), [`096927a68`](https://github.com/keystonejs/keystone/commit/096927a6813a23030988ba8b64b2e8452f571a33)]:
  - @keystone-next/types@12.0.0
  - @keystone-next/admin-ui@8.0.1
  - @keystone-next/admin-ui-utils@2.0.8

## 4.1.0

### Minor Changes

- [`177cbd530`](https://github.com/keystonejs/keystone/commit/177cbd5303b814d1acaa8ded98e3d114c770bdba) [#4643](https://github.com/keystonejs/keystone/pull/4643) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Add DatePicker component to design system.
  Update timestamp field in keystone-next to use the new DatePicker an an additional time picker input.

### Patch Changes

- Updated dependencies [[`4768fbf83`](https://github.com/keystonejs/keystone/commit/4768fbf831ffff648e540c479a1954ae40e05aaa), [`59027f8a4`](https://github.com/keystonejs/keystone/commit/59027f8a41cb11632f7c1eb5b3a8092193ecc87e), [`0d9404768`](https://github.com/keystonejs/keystone/commit/0d94047686d1bb1308fd8c47b769c999390d8f6d), [`b81a11c17`](https://github.com/keystonejs/keystone/commit/b81a11c171f3627f6cecb66bd2faeb89a68a009e), [`7ffd2ebb4`](https://github.com/keystonejs/keystone/commit/7ffd2ebb42dfaf12e23ba166b44ec4db60d9824b), [`0df2fb79c`](https://github.com/keystonejs/keystone/commit/0df2fb79c56094b5cdc0be6a0d6c2812ff0ec7f9), [`d090053df`](https://github.com/keystonejs/keystone/commit/d090053df9545380c42ddd18fae6782f3c3e2719), [`177cbd530`](https://github.com/keystonejs/keystone/commit/177cbd5303b814d1acaa8ded98e3d114c770bdba), [`160bd77d3`](https://github.com/keystonejs/keystone/commit/160bd77d39d5e99b11bee056fe2c3b2585126bbc), [`831db7c2b`](https://github.com/keystonejs/keystone/commit/831db7c2b7a9bced87acf76e3f431ca88a8880b0), [`a36bcf847`](https://github.com/keystonejs/keystone/commit/a36bcf847806ca0739f7b44d49a9bf6ac26a38d4), [`6ea4ff3cf`](https://github.com/keystonejs/keystone/commit/6ea4ff3cf77d5d2278bf4f0415d11aa7399a0490), [`81e86cbaa`](https://github.com/keystonejs/keystone/commit/81e86cbaa5c73633d6cb0ca2f84e834201e8bf9a)]:
  - @keystone-next/types@11.0.0
  - @keystone-next/admin-ui@8.0.0
  - @keystone-ui/fields@1.1.0
  - @keystone-ui/tooltip@1.0.5
  - @keystonejs/fields@21.0.1
  - @keystone-next/admin-ui-utils@2.0.7

## 4.0.3

### Patch Changes

- [`24ecd72e5`](https://github.com/keystonejs/keystone/commit/24ecd72e54eee12442c7c1d0533936a9ad86620a) [#4604](https://github.com/keystonejs/keystone/pull/4604) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `SerializedAdminMeta` to `AdminMetaRootVal`.

- Updated dependencies [[`24ecd72e5`](https://github.com/keystonejs/keystone/commit/24ecd72e54eee12442c7c1d0533936a9ad86620a)]:
  - @keystone-next/admin-ui@7.0.1
  - @keystone-next/types@10.0.0
  - @keystone-next/admin-ui-utils@2.0.6

## 4.0.2

### Patch Changes

- Updated dependencies [[`1236f5f40`](https://github.com/keystonejs/keystone/commit/1236f5f4024f1698b5a39343b4e5dbfa42c5fc9c), [`ba842d48b`](https://github.com/keystonejs/keystone/commit/ba842d48b5e9499ccd6f59d1610d55e964ffdb93), [`933c78a1e`](https://github.com/keystonejs/keystone/commit/933c78a1edc070b63f7720f64c15421ba28bdde5), [`f559e680b`](https://github.com/keystonejs/keystone/commit/f559e680bad7a7c948a317adfb91a3b024b486c4), [`89f7d4599`](https://github.com/keystonejs/keystone/commit/89f7d459906072940da1355c38815d1b3ef49368), [`17519bf64`](https://github.com/keystonejs/keystone/commit/17519bf64f277ad154fad1b0d5a423048e1336e0)]:
  - @keystone-next/admin-ui@7.0.0
  - @keystone-ui/tooltip@1.0.4
  - @keystone-next/types@9.0.0
  - @keystone-next/admin-ui-utils@2.0.5

## 4.0.1

### Patch Changes

- Updated dependencies [[`075ef1628`](https://github.com/keystonejs/keystone/commit/075ef16281a89c8291f90275adca98f042cc54da)]:
  - @keystone-next/admin-ui@6.0.0
  - @keystone-next/types@8.0.0
  - @keystone-next/admin-ui-utils@2.0.4

## 4.0.0

### Major Changes

- [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0) [#4544](https://github.com/keystonejs/keystone/pull/4544) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced `useCompiledBcrypt` option with `bcrypt` option which accepts an alternative implementation of bcrypt(such as the native `bcrypt` npm package) in the password field type.

  For example, if you had the following field definition:

  ```js
  password: { type: Password, useCompiledBcrypt: true }
  ```

  you will need to change it to:

  ```js
  password: { type: Password, bcrypt: require('bcrypt') }
  ```

### Patch Changes

- Updated dependencies [[`364ac9254`](https://github.com/keystonejs/keystone/commit/364ac9254735befd2d4804789bb62464bb51ee5b), [`841be0bc9`](https://github.com/keystonejs/keystone/commit/841be0bc9d192cf64399231a543a9ba9ff41b9a0), [`2d3668c49`](https://github.com/keystonejs/keystone/commit/2d3668c49d1913afecbacf2b5ef164e553210956), [`6912c7b9d`](https://github.com/keystonejs/keystone/commit/6912c7b9dc3d786e61e6f657b0886b258d942c30), [`e33cf0c1e`](https://github.com/keystonejs/keystone/commit/e33cf0c1e78ae69cffaf45009e47ca1198464cf2), [`5c75534f6`](https://github.com/keystonejs/keystone/commit/5c75534f6e9e0f10a6556a1f1dc87b5fdd986dd4), [`6d09df338`](https://github.com/keystonejs/keystone/commit/6d09df3381d1682b8002d52ed1696b661fdff035), [`88b230317`](https://github.com/keystonejs/keystone/commit/88b2303177253aa5d76b50d40d19138af2bc3e41), [`39639b203`](https://github.com/keystonejs/keystone/commit/39639b2031bb749067ef537ea47e5d93a8bb89da), [`661104764`](https://github.com/keystonejs/keystone/commit/66110476491953af2134cd3cd4e3ef7c361ac5da), [`dab8121a6`](https://github.com/keystonejs/keystone/commit/dab8121a6a8eae4c42a5a9ecbdb72a3e8b1eeda4), [`88b230317`](https://github.com/keystonejs/keystone/commit/88b2303177253aa5d76b50d40d19138af2bc3e41), [`481e456ac`](https://github.com/keystonejs/keystone/commit/481e456ac4158207436ddd9be18fdca0f27b6409), [`08398473b`](https://github.com/keystonejs/keystone/commit/08398473bb81dfd43a3c134ed8de61e45aa770f0), [`2308e5efc`](https://github.com/keystonejs/keystone/commit/2308e5efc7c6893c87652411496b15a8124f6e05), [`4d3cb8e32`](https://github.com/keystonejs/keystone/commit/4d3cb8e32b22250fdbe04af758b0aad727ba63e4), [`f2c7675fb`](https://github.com/keystonejs/keystone/commit/f2c7675fb51ed41e6df8248c76b9322d6de5ee0d)]:
  - @keystonejs/fields@21.0.0
  - @keystone-next/admin-ui@5.0.0
  - @keystone-next/types@7.0.0
  - @keystone-ui/core@1.0.4
  - @keystone-ui/fields@1.0.3
  - @keystonejs/fields-auto-increment@8.1.1
  - @keystonejs/fields-mongoid@9.1.1
  - @keystone-next/admin-ui-utils@2.0.3

## 3.2.2

### Patch Changes

- Updated dependencies [[`dc58df5c8`](https://github.com/keystonejs/keystone/commit/dc58df5c87d694ce94b7d1c2b20d4976176dbd13), [`a5d7b264a`](https://github.com/keystonejs/keystone/commit/a5d7b264ad3e5590e335758881d22f7f296203c9), [`b7a4b997b`](https://github.com/keystonejs/keystone/commit/b7a4b997bae5b2269bea0ad94ca771e63c26ab95), [`ca34424d5`](https://github.com/keystonejs/keystone/commit/ca34424d58e58cc4a657828b1362978be8ee4f62), [`cffa011f7`](https://github.com/keystonejs/keystone/commit/cffa011f79a49e2f5c9165f82e6dff09a88a5b6d), [`192cbed74`](https://github.com/keystonejs/keystone/commit/192cbed74267b68be7de632667261ab943be1e2a), [`2338ed731`](https://github.com/keystonejs/keystone/commit/2338ed73185cd3d33c62fac69064c8a4950dc3fd), [`57092b7c1`](https://github.com/keystonejs/keystone/commit/57092b7c13845fffd1f3767bb609d203afbc2776), [`dbfef6256`](https://github.com/keystonejs/keystone/commit/dbfef6256b11d94250885f5f3a11d0ba81ad3b08), [`b21b62ed5`](https://github.com/keystonejs/keystone/commit/b21b62ed59fcd83ef2fc89587544b9d64522ba27), [`2da044a0c`](https://github.com/keystonejs/keystone/commit/2da044a0cb22dc16a54b7b5555c2b2678e8d4cab), [`341ee2b4b`](https://github.com/keystonejs/keystone/commit/341ee2b4b7eab89f296146ff9e14ce53233235f6), [`4b019b8cf`](https://github.com/keystonejs/keystone/commit/4b019b8cfcb7bea6f800609da5d07e8c8abfc80a), [`68d361d25`](https://github.com/keystonejs/keystone/commit/68d361d2596e8811caf00390c60341ef0c233c7b), [`3f3c65ab2`](https://github.com/keystonejs/keystone/commit/3f3c65ab2d206ef1c72f17259e73fb24a79f0a9b), [`bf22d9f2a`](https://github.com/keystonejs/keystone/commit/bf22d9f2afe537111b95571b86d4fd2759eb6a98), [`3be854440`](https://github.com/keystonejs/keystone/commit/3be85444064b8e62e97670594a1d2599ec2fd11c), [`fe52e25e0`](https://github.com/keystonejs/keystone/commit/fe52e25e04db121adbc6a0ce3bd0dbe1c7270180), [`1c12b8204`](https://github.com/keystonejs/keystone/commit/1c12b8204f8238997ddaf7337c44cf26ebea9ba4), [`6a364a664`](https://github.com/keystonejs/keystone/commit/6a364a664ce16f741408111054f0f3437a63a194), [`79ae6462a`](https://github.com/keystonejs/keystone/commit/79ae6462aac5ba9e27f9e95eacb2d94e76ce6a77)]:
  - @keystone-next/admin-ui@4.0.0
  - @keystone-next/types@6.0.0
  - @keystone-next/admin-ui-utils@2.0.2

## 3.2.1

### Patch Changes

- Updated dependencies [[`abdaeb9c1`](https://github.com/keystonejs/keystone/commit/abdaeb9c17a0f1d8e6eda1178d79107ac8770058), [`b6498d9f1`](https://github.com/keystonejs/keystone/commit/b6498d9f1341648742f2db78fec53b851b36dddd), [`d36e580cc`](https://github.com/keystonejs/keystone/commit/d36e580cc21e4b77a1bd0615c96c0793b9c5dac5), [`803626e88`](https://github.com/keystonejs/keystone/commit/803626e8854f9b7d293bd1829398d25a6692154a)]:
  - @keystonejs/fields@20.1.3
  - @keystone-next/types@5.0.0
  - @keystone-next/admin-ui@3.1.2
  - @keystone-next/admin-ui-utils@2.0.1

## 3.2.0

### Minor Changes

- [`8b12f795d`](https://github.com/keystonejs/keystone/commit/8b12f795d64dc085ca663921aa6826350d234cd0) [#4337](https://github.com/keystonejs/keystone/pull/4337) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `extraSelection` prop to RelationshipSelect

### Patch Changes

- [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b) [#4387](https://github.com/keystonejs/keystone/pull/4387) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated usage of `Fields` component

* [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567) [#4414](https://github.com/keystonejs/keystone/pull/4414) Thanks [@JedWatson](https://github.com/JedWatson)! - Typed keystone context

- [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a) [#4378](https://github.com/keystonejs/keystone/pull/4378) Thanks [@timleslie](https://github.com/timleslie)! - Updated code to consistently use `context` rather than `ctx` for graphQL context variables.

* [`b8c2c48ec`](https://github.com/keystonejs/keystone/commit/b8c2c48ec3746809894af7347c205f6a95329e8d) [#4407](https://github.com/keystonejs/keystone/pull/4407) Thanks [@JedWatson](https://github.com/JedWatson)! - Show list label instead of "item" when linking to related items

* Updated dependencies [[`038b0ae65`](https://github.com/keystonejs/keystone/commit/038b0ae6586f8673de22046842b2ef993b0e1937), [`55a04a100`](https://github.com/keystonejs/keystone/commit/55a04a1004b7f15fcd41b4935d74fd1847c9deeb), [`f4a855c71`](https://github.com/keystonejs/keystone/commit/f4a855c71e966ef3ebc894a3b0f1af51e5182394), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b), [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567), [`fa12a18b0`](https://github.com/keystonejs/keystone/commit/fa12a18b077367563b1b69db55274e47a1bd5027), [`4eef4dc55`](https://github.com/keystonejs/keystone/commit/4eef4dc5587cc06f08ead5d5d05db2e9a786b8bc), [`eddd7e795`](https://github.com/keystonejs/keystone/commit/eddd7e79599e20f5bef61f240d874b37d0a084c4), [`139c74a4a`](https://github.com/keystonejs/keystone/commit/139c74a4aacfd5230fc86471b9cbd2a3c90bac9a), [`c9159c956`](https://github.com/keystonejs/keystone/commit/c9159c9560efa7f7ae6ef802302c97b7a23f987b)]:
  - @keystonejs/fields@20.1.2
  - @keystone-ui/core@1.0.3
  - @keystone-next/admin-ui@3.1.1
  - @keystone-next/admin-ui-utils@2.0.0
  - @keystone-next/types@4.1.1
  - @keystone-ui/tooltip@1.0.3

## 3.1.0

### Minor Changes

- [`2d5f78207`](https://github.com/keystonejs/keystone/commit/2d5f78207103caaf8f86a4dd05b7e4b0a4795213) [#4302](https://github.com/keystonejs/keystone/pull/4302) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Exposed RelationshipSelect in an entrypoint

### Patch Changes

- Updated dependencies [[`80c980452`](https://github.com/keystonejs/keystone/commit/80c9804522d493106321e1832ca07be07437720a), [`c62a35fe0`](https://github.com/keystonejs/keystone/commit/c62a35fe0834ec60e2472b22feedda539d18a918), [`add3f67e3`](https://github.com/keystonejs/keystone/commit/add3f67e379caebbcf0880b4ce82cf6a1e89020b), [`2d5f78207`](https://github.com/keystonejs/keystone/commit/2d5f78207103caaf8f86a4dd05b7e4b0a4795213)]:
  - @keystone-ui/fields@1.0.2
  - @keystonejs/fields@20.1.1
  - @keystone-next/types@4.1.0
  - @keystone-next/admin-ui@3.1.0

## 3.0.1

### Patch Changes

- [`81a140ee3`](https://github.com/keystonejs/keystone/commit/81a140ee3badc9c032ab02a233a21d011278e173) [#4289](https://github.com/keystonejs/keystone/pull/4289) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed many relationship select clipping in the Create drawer

- Updated dependencies [[`11777cddb`](https://github.com/keystonejs/keystone/commit/11777cddba45b28a9e17a3149b792db121322b46), [`cbf11a69b`](https://github.com/keystonejs/keystone/commit/cbf11a69b8f2c428e2c0a08dd568b3bc0e0d80f4), [`b2de22941`](https://github.com/keystonejs/keystone/commit/b2de229419cc93b69ee4027c387cab9c8d701488), [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882), [`60e061246`](https://github.com/keystonejs/keystone/commit/60e061246bc35b76031f43ff6c07446fe6ad3c6b), [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882)]:
  - @keystone-next/admin-ui@3.0.0
  - @keystone-next/types@4.0.0
  - @keystone-next/admin-ui-utils@1.0.2

## 3.0.0

### Major Changes

- [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c) [#4238](https://github.com/keystonejs/keystone/pull/4238) Thanks [@timleslie](https://github.com/timleslie)! - Removed `getBackingType` from `FieldType` as this functionality is now provided by `field.getBackingTypes()` in the core field classes.

### Minor Changes

- [`8291187de`](https://github.com/keystonejs/keystone/commit/8291187de347784f21e4d856ed1eefbc5b8a103b) [#4207](https://github.com/keystonejs/keystone/pull/4207) Thanks [@JedWatson](https://github.com/JedWatson)! - Improve field cell components

### Patch Changes

- [`fd4b0d04c`](https://github.com/keystonejs/keystone/commit/fd4b0d04cd9ab8ba12653f1e64fdf08d8cb0c4db) [#4186](https://github.com/keystonejs/keystone/pull/4186) Thanks [@JedWatson](https://github.com/JedWatson)! - Improving the appearance of readonly fields in the Admin UI

* [`c103cde7d`](https://github.com/keystonejs/keystone/commit/c103cde7da198cd7e9adefa763c51e433680e800) [#4226](https://github.com/keystonejs/keystone/pull/4226) Thanks [@jossmac](https://github.com/jossmac)! - General admin tidy

- [`84e651c3f`](https://github.com/keystonejs/keystone/commit/84e651c3f08fdfc11628490c9d55229dc360f52a) [#4187](https://github.com/keystonejs/keystone/pull/4187) Thanks [@JedWatson](https://github.com/JedWatson)! - Improve readonly relationship views

* [`549a9a06d`](https://github.com/keystonejs/keystone/commit/549a9a06d9dbeb514aad724ece603a3fa7fc8cb6) [#4197](https://github.com/keystonejs/keystone/pull/4197) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Improved field UI when fields have `itemView: { fieldMode: 'read'}`

- [`400a6e50c`](https://github.com/keystonejs/keystone/commit/400a6e50cba643f4b142858bb1cac83a50ab020d) [#4243](https://github.com/keystonejs/keystone/pull/4243) Thanks [@timleslie](https://github.com/timleslie)! - Improved internal consistency of field definition code.

* [`7afde2fb5`](https://github.com/keystonejs/keystone/commit/7afde2fb516e1d3824d73a96308abb4a6b022400) [#4253](https://github.com/keystonejs/keystone/pull/4253) Thanks [@jossmac](https://github.com/jossmac)! - Admin UI layout experiments and general tidy, esp. fields

- [`2a2a7c00b`](https://github.com/keystonejs/keystone/commit/2a2a7c00b74028b758006219781cbbd22909be85) [#4185](https://github.com/keystonejs/keystone/pull/4185) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed field defaultValue types for new fields package

* [`8e77254a2`](https://github.com/keystonejs/keystone/commit/8e77254a262a4c892263e30044803b463750c3e9) [#4179](https://github.com/keystonejs/keystone/pull/4179) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed defaultValue types for `AutoIncrement` and `Integer` fields.

- [`b9e643dc6`](https://github.com/keystonejs/keystone/commit/b9e643dc6c66f75bc6d5b6ced74d91ba3ee7533d) [#4199](https://github.com/keystonejs/keystone/pull/4199) Thanks [@JedWatson](https://github.com/JedWatson)! - Fix a bunch of minor bugs in the relationship field cards view

* [`0e65409c7`](https://github.com/keystonejs/keystone/commit/0e65409c7416d285fdc4f9da4a7dfb0f652c6cb2) [#4216](https://github.com/keystonejs/keystone/pull/4216) Thanks [@jossmac](https://github.com/jossmac)! - Admin UI tidy: mostly alignment and spacing consolidation.

* Updated dependencies [[`fd4b0d04c`](https://github.com/keystonejs/keystone/commit/fd4b0d04cd9ab8ba12653f1e64fdf08d8cb0c4db), [`c103cde7d`](https://github.com/keystonejs/keystone/commit/c103cde7da198cd7e9adefa763c51e433680e800), [`3d66ebc87`](https://github.com/keystonejs/keystone/commit/3d66ebc87c4dea7fa70df1209c8d85f539ceccb8), [`98e8fd4bc`](https://github.com/keystonejs/keystone/commit/98e8fd4bc586c732d629328ef643014ce42442ed), [`d02957453`](https://github.com/keystonejs/keystone/commit/d029574533c179fa53f65c0e0ba3812dab2ba4ad), [`302afe226`](https://github.com/keystonejs/keystone/commit/302afe226162452c91d9e2f11f5c29552df70c6a), [`98dd7dcff`](https://github.com/keystonejs/keystone/commit/98dd7dcffa797eb40eb1713ba1ac2697dfef95e3), [`7afde2fb5`](https://github.com/keystonejs/keystone/commit/7afde2fb516e1d3824d73a96308abb4a6b022400), [`8291187de`](https://github.com/keystonejs/keystone/commit/8291187de347784f21e4d856ed1eefbc5b8a103b), [`5216e9dc6`](https://github.com/keystonejs/keystone/commit/5216e9dc6894c1a6e81765c0278dc6f7c4cc617b), [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c), [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c), [`36cf9b0a9`](https://github.com/keystonejs/keystone/commit/36cf9b0a9f6c9c2cd3c823146135f86d4152718b), [`6eb4def9a`](https://github.com/keystonejs/keystone/commit/6eb4def9a1be293872e59bcf6472866c0981b45f), [`8f4ebd5f7`](https://github.com/keystonejs/keystone/commit/8f4ebd5f70251ccdfb6b5ce14efb9fb59f5d2b3d), [`2a2a7c00b`](https://github.com/keystonejs/keystone/commit/2a2a7c00b74028b758006219781cbbd22909be85), [`68f1c8fdc`](https://github.com/keystonejs/keystone/commit/68f1c8fdc83f683d13de55b2f3a81eff7639ebf6), [`28e2b43d4`](https://github.com/keystonejs/keystone/commit/28e2b43d4a5a4624b3ad6683e5f4f0116a5971f4), [`cfa0d8275`](https://github.com/keystonejs/keystone/commit/cfa0d8275c89f09b89643c801b208161348b4f65), [`9928da13e`](https://github.com/keystonejs/keystone/commit/9928da13ecca03fed560a42e1071afc59c0feb3b), [`d2927f78c`](https://github.com/keystonejs/keystone/commit/d2927f78c40bdb21190d06991466566f49a9f08b), [`0e65409c7`](https://github.com/keystonejs/keystone/commit/0e65409c7416d285fdc4f9da4a7dfb0f652c6cb2)]:
  - @keystone-ui/core@1.0.2
  - @keystone-ui/fields@1.0.1
  - @keystone-ui/tooltip@1.0.2
  - @keystone-next/admin-ui@2.0.2
  - @keystone-next/types@3.0.0
  - @keystonejs/fields@20.1.0
  - @keystone-next/admin-ui-utils@1.0.1
  - @keystone-ui/modals@1.0.2
  - @keystone-ui/segmented-control@1.0.1
  - @keystone-ui/toast@1.0.1
  - @keystonejs/fields-auto-increment@8.1.0
  - @keystonejs/fields-mongoid@9.1.0
  - @keystone-ui/button@2.0.1

## 2.0.1

### Patch Changes

- [`d6139dcf9`](https://github.com/keystonejs/keystone/commit/d6139dcf99f87d78c5e1bb0393349bb52bcb28bd) [#4163](https://github.com/keystonejs/keystone/pull/4163) Thanks [@JedWatson](https://github.com/JedWatson)! - UX improvements to relationship cards

- Updated dependencies [[`ce6b8ebee`](https://github.com/keystonejs/keystone/commit/ce6b8ebeef39f2d22bfc62500a408739a7f1f419), [`6c3b566a1`](https://github.com/keystonejs/keystone/commit/6c3b566a130fa4eb5ae57e638b4cff7a16299998), [`c3e4c1e3f`](https://github.com/keystonejs/keystone/commit/c3e4c1e3fdf8ffdbfd785860c26d15e665c5e25e), [`39a5890de`](https://github.com/keystonejs/keystone/commit/39a5890de2021b9e32569ce4011c3e2948d4ede6)]:
  - @keystone-ui/tooltip@1.0.1
  - @keystone-ui/button@2.0.0
  - @keystone-ui/core@1.0.1
  - @keystone-next/admin-ui@2.0.1
  - @keystone-ui/modals@1.0.1

## 2.0.0

### Major Changes

- [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797) [#4132](https://github.com/keystonejs/keystone/pull/4132) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add CardValue export from field views

### Minor Changes

- [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797) [#4132](https://github.com/keystonejs/keystone/pull/4132) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add `displayMode: 'cards'` to relationship field type

### Patch Changes

- [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797) [#4132](https://github.com/keystonejs/keystone/pull/4132) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Handle autoFocus in various field views

* [`f3c0f79e3`](https://github.com/keystonejs/keystone/commit/f3c0f79e3005aa6a8e867efef4431b83bbdf9898) [#4137](https://github.com/keystonejs/keystone/pull/4137) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add missing options `isRequired`, `defaultValue`, `isUnique` and `isIndexed` to field types

* Updated dependencies [[`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797), [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec), [`71b74161d`](https://github.com/keystonejs/keystone/commit/71b74161dfc9d7f0b918a3451cf545935afce94d), [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797)]:
  - @keystone-next/admin-ui-utils@1.0.0
  - @keystone-next/types@2.0.0
  - @keystone-next/admin-ui@2.0.0

## 1.0.0

### Major Changes

- [`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c) [#4106](https://github.com/keystonejs/keystone/pull/4106) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release

### Patch Changes

- Updated dependencies [[`a5e40e6c4`](https://github.com/keystonejs/keystone/commit/a5e40e6c4af1ab38cc2079a0f6e27d39d6b7d546), [`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c), [`2d660b2a1`](https://github.com/keystonejs/keystone/commit/2d660b2a1dd013787e022cad3a0c70dbe08c60da)]:
  - @keystonejs/fields@20.0.0
  - @keystone-ui/button@1.0.0
  - @keystone-ui/core@1.0.0
  - @keystone-ui/fields@1.0.0
  - @keystone-ui/icons@1.0.0
  - @keystone-ui/modals@1.0.0
  - @keystone-ui/segmented-control@1.0.0
  - @keystone-ui/tooltip@1.0.0
  - @keystone-next/admin-ui@1.0.0
  - @keystone-next/types@1.0.0
  - @keystonejs/fields-auto-increment@8.0.1
  - @keystonejs/fields-mongoid@9.0.1
