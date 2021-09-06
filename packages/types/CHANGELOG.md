# @keystone-next/types

## 25.0.0

### Major Changes

- [#6371](https://github.com/keystonejs/keystone/pull/6371) [`44f2ef60e`](https://github.com/keystonejs/keystone/commit/44f2ef60e29912f3c85b91fc704e09a7d5a15b22) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved `@keystone-next/types` to `@keystone-next/keystone/types`

## 24.0.0

### Major Changes

- [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `_ListKeyMeta` and `_toManyRelationshipFieldMeta` fields. You should use `listKeyCount` and `toManyRelationshipFieldCount` instead

* [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed all arguments from `context.lists.List.count` and `context.db.lists.List.count` except for `where`.

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

* [#6208](https://github.com/keystonejs/keystone/pull/6208) [`092df6678`](https://github.com/keystonejs/keystone/commit/092df6678cea18d639be16ad250ec4ecc9250f5a) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The create one mutation now requires a non-null `data` argument and the create many mutation accepts a list of `ItemCreateInput` directly instead of being nested inside of an object with the `ItemCreateInput` in a `data` field.

  If you have a list called `Item`, `createItem` now looks like `createItem(data: ItemCreateInput!): Item` and `createItems` now looks like `createItems(data: [ItemCreateInput!]!): [Item]`.

- [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `search` argument from the GraphQL API for finding many items, Lists/DB API and to-many relationship fields. You should use `contains` filters instead.

* [#6095](https://github.com/keystonejs/keystone/pull/6095) [`272b97b3a`](https://github.com/keystonejs/keystone/commit/272b97b3a10c0dfada782171d55ef7ac6f47c98f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated filters to be nested instead of flattened and add top-level `NOT` operator. See the [Query Filter API docs](https://keystonejs.com/docs/apis/filters) and the upgrade guide for more information.

  ```graphql
  query {
    posts(where: { title: { contains: "Something" } }) {
      title
      content
    }
  }
  ```

- [#6196](https://github.com/keystonejs/keystone/pull/6196) [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `sortBy` argument from the GraphQL API for finding many items, Lists/DB API and to-many relationship fields. You should use `orderBy` instead.

* [#6312](https://github.com/keystonejs/keystone/pull/6312) [`56044e2a4`](https://github.com/keystonejs/keystone/commit/56044e2a425f4256b66475fd3b1a6342cd6c3bf9) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Updated `@graphql-ts/schema`. The second type parameter of `schema.Arg` exported from `@keystone-next/types` is now a boolean that defines whether or not the arg has a default value to make it easier to define circular input objects.

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

- [#6197](https://github.com/keystonejs/keystone/pull/6197) [`4d9f89f88`](https://github.com/keystonejs/keystone/commit/4d9f89f884e2bf984fdd74ca2cbb7874b25b9cda) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The generated CRUD queries, and some of the input types, in the GraphQL API have been renamed.

  If you have a list called `Item`, the query for multiple values, `allItems` will be renamed to `items`. The query for a single value, `Item`, will be renamed to `item`.

  Also, the input type used in the `updateItems` mutation has been renamed from `ItemsUpdateInput` to `ItemUpdateArgs`.

* [#6211](https://github.com/keystonejs/keystone/pull/6211) [`d214e2f72`](https://github.com/keystonejs/keystone/commit/d214e2f72bae1c798e2415a38410d6063c333e2e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The update mutations now accept `where` unique inputs instead of only an `id` and the `where` and `data` arguments are non-null.

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

- [#6206](https://github.com/keystonejs/keystone/pull/6206) [`f5e64af37`](https://github.com/keystonejs/keystone/commit/f5e64af37df2eb460c89d89fa3c8924fb34970ed) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The delete mutations now accept `where` unique inputs instead of only an `id`.

  If you have a list called `Item`, `deleteItem` now looks like `deleteItem(where: ItemWhereUniqueInput!): Item` and `deleteItems` now looks like `deleteItems(where: [ItemWhereUniqueInput!]!): [Item]`

### Minor Changes

- [#6267](https://github.com/keystonejs/keystone/pull/6267) [`1030296d1`](https://github.com/keystonejs/keystone/commit/1030296d1f304dc44246e895089ac1f992e80590) Thanks [@timleslie](https://github.com/timleslie)! - Added `config.graphql.debug` option, which can be used to control whether debug information such as stack traces are included in the errors returned by the GraphQL API.

### Patch Changes

- [#6249](https://github.com/keystonejs/keystone/pull/6249) [`8187ea019`](https://github.com/keystonejs/keystone/commit/8187ea019a212874f3c602573af3382c6f3bd3b2) Thanks [@timleslie](https://github.com/timleslie)! - Updated types to allow the `'id'` field in `ui.labelField`, `ui.listView.initialColumns`, and `ui.listView.initialSort`.

- Updated dependencies [[`e9f3c42d5`](https://github.com/keystonejs/keystone/commit/e9f3c42d5b9d42872cecbd18fbe9bf9d7d53ed82), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`b696a9579`](https://github.com/keystonejs/keystone/commit/b696a9579b503db86f42776381e247c4e1a7409f), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`4f4f0351a`](https://github.com/keystonejs/keystone/commit/4f4f0351a056dea9d1614aa2a3a4789d66bb402d), [`272b97b3a`](https://github.com/keystonejs/keystone/commit/272b97b3a10c0dfada782171d55ef7ac6f47c98f), [`5cd8ffd6c`](https://github.com/keystonejs/keystone/commit/5cd8ffd6cb822dbee8555b47846a5019c4d2b1c3), [`874f2c405`](https://github.com/keystonejs/keystone/commit/874f2c4058c9cf006213e84b9ffcf39c5bf144e8), [`3564b342d`](https://github.com/keystonejs/keystone/commit/3564b342d6dc2127ae591d7ac055af9eae90543c), [`4d9f89f88`](https://github.com/keystonejs/keystone/commit/4d9f89f884e2bf984fdd74ca2cbb7874b25b9cda), [`d214e2f72`](https://github.com/keystonejs/keystone/commit/d214e2f72bae1c798e2415a38410d6063c333e2e)]:
  - @keystone-next/fields@14.0.0

## 23.0.0

### Major Changes

- [#6165](https://github.com/keystonejs/keystone/pull/6165) [`e4e6cf9b5`](https://github.com/keystonejs/keystone/commit/e4e6cf9b59eec461d2b53acfa3b350e4f5a06fc4) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `ui.searchFields` option to lists to allow searching by multiple fields in the Admin UI (the only current usage of this is in the select used in relationship fields) and to replace the usage of the `search` GraphQL argument which will be removed soon and should be replaced by using `contains` filters directly.

### Minor Changes

- [#6111](https://github.com/keystonejs/keystone/pull/6111) [`9e2deac5f`](https://github.com/keystonejs/keystone/commit/9e2deac5f340b4baeb03b01ae065f2bec5977523) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Add Admin UI specific types AuthenticatedItem, VisibleLists, CreateViewFieldModes and NavigationProps to exports.

### Patch Changes

- [#6192](https://github.com/keystonejs/keystone/pull/6192) [`93f1e5d30`](https://github.com/keystonejs/keystone/commit/93f1e5d302701c610b6cba74e0c5c86a3ac8aacc) Thanks [@JedWatson](https://github.com/JedWatson)! - Added an optional `/_healthcheck` endpoint to Keystone's express server.

  You can enable it by setting `config.server.healthCheck: true`

  By default it will respond with `{ status: 'pass', timestamp: Date.now() }`

  You can also specify a custom path and JSON data:

  ```js
  config({
    server: {
      healthCheck: {
        path: '/my-health-check',
        data: { status: 'healthy' },
      },
    },
  });
  ```

  Or use a function for the `data` config to return real-time information:

  ```js
  config({
    server: {
      healthCheck: {
        path: '/my-health-check',
        data: () => ({
          status: 'healthy',
          timestamp: Date.now(),
          uptime: process.uptime(),
        }),
      },
    },
  });
  ```

- Updated dependencies [[`a11e54d69`](https://github.com/keystonejs/keystone/commit/a11e54d692d3cec4ec2439cbf743b590688fb7d3), [`e5f61ad50`](https://github.com/keystonejs/keystone/commit/e5f61ad50133a328fcb32299b838fd9eac574c3f), [`e4e6cf9b5`](https://github.com/keystonejs/keystone/commit/e4e6cf9b59eec461d2b53acfa3b350e4f5a06fc4), [`2ef6fe82c`](https://github.com/keystonejs/keystone/commit/2ef6fe82cee6df7796935d35d1c12cab29aecc75)]:
  - @keystone-next/fields@13.0.0

## 22.0.0

### Major Changes

- [#6027](https://github.com/keystonejs/keystone/pull/6027) [`38b78f2ae`](https://github.com/keystonejs/keystone/commit/38b78f2aeaf4c5d8176a1751ad8cb5a7acce2790) Thanks [@renovate](https://github.com/apps/renovate)! - Updated Prisma dependency to `2.26.0`.

### Patch Changes

- [#6061](https://github.com/keystonejs/keystone/pull/6061) [`5f3d407d7`](https://github.com/keystonejs/keystone/commit/5f3d407d79171f04ae877e8eaed9a7f9d5671705) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed TypeScript errors in declarations

* [#6087](https://github.com/keystonejs/keystone/pull/6087) [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951) Thanks [@JedWatson](https://github.com/JedWatson)! - Move source code from the `packages-next` to the `packages` directory.

* Updated dependencies [[`38b78f2ae`](https://github.com/keystonejs/keystone/commit/38b78f2aeaf4c5d8176a1751ad8cb5a7acce2790), [`139d7a8de`](https://github.com/keystonejs/keystone/commit/139d7a8def263d40c0d1d5353d2744842d9a0951), [`253df44c2`](https://github.com/keystonejs/keystone/commit/253df44c2f8d6535a6425b2593eaed5380433d57), [`c536b478f`](https://github.com/keystonejs/keystone/commit/c536b478fc89f2d933cddf8533e7d88030540a63)]:
  - @keystone-next/fields@12.0.0

## 21.0.1

### Patch Changes

- [#6029](https://github.com/keystonejs/keystone/pull/6029) [`038cd09a2`](https://github.com/keystonejs/keystone/commit/038cd09a201081e3f56ffd75577e6b74a6eb19e5) Thanks [@bladey](https://github.com/bladey)! - Updated Keystone URL reference from next.keystonejs.com to keystonejs.com.

- Updated dependencies [[`038cd09a2`](https://github.com/keystonejs/keystone/commit/038cd09a201081e3f56ffd75577e6b74a6eb19e5), [`0988f08c2`](https://github.com/keystonejs/keystone/commit/0988f08c2a88a0da6b85a385caf48ff093e1f9e5)]:
  - @keystone-next/fields@11.0.3

## 21.0.0

### Major Changes

- [#5947](https://github.com/keystonejs/keystone/pull/5947) [`03f535ba6`](https://github.com/keystonejs/keystone/commit/03f535ba6fa1a5e5f3027bcad761feb3fd94587b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced the `idField` list configuration option with a more constrained option, `db.idField`, that accepts an object with a `kind` property with a value of `cuid`, `uuid` or `autoincrement`. `db.idField` can be set on either the top level `config` object, or on individual lists.

  The default behaviour has changed from using `autoincrement` to using cuids. To keep the current behaviour, you should set `{ kind: 'autoincrement' }` at `db.idField` in your top level config.

### Patch Changes

- Updated dependencies []:
  - @keystone-next/fields@11.0.2

## 20.0.1

### Patch Changes

- [#5910](https://github.com/keystonejs/keystone/pull/5910) [`50ad1ce6b`](https://github.com/keystonejs/keystone/commit/50ad1ce6be90f5fb2481840dbd01328b6f629432) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed generated list types to allow passing a value directly when a GraphQL list of the value is expected

* [#5907](https://github.com/keystonejs/keystone/pull/5907) [`0df3734d5`](https://github.com/keystonejs/keystone/commit/0df3734d52a89df30f1d555d003002cb79ad9e9a) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `lists` and `db.lists` APIs on `KeystoneContext` to have improved types. If you're using the generated `KeystoneListsTypeInfo` type like this:

  ```ts
  const lists: KeystoneListsAPI<KeystoneListsTypeInfo> = context.lists;
  ```

  You will have to change it to use `as` like this:

  ```ts
  const lists = context.lists as KeystoneListsAPI<KeystoneListsTypeInfo>;
  ```

- [#5992](https://github.com/keystonejs/keystone/pull/5992) [`543154bc0`](https://github.com/keystonejs/keystone/commit/543154bc081dde33ea29b8a2bff1d3033d538077) Thanks [@timleslie](https://github.com/timleslie)! - Pinned dependency `decimal.js` to `10.2.1` to be consistent with Prisma.

- Updated dependencies [[`de0a5c19e`](https://github.com/keystonejs/keystone/commit/de0a5c19e656360ea3febc7e0240543c7817253e), [`7a25925c3`](https://github.com/keystonejs/keystone/commit/7a25925c3dc5b2af2cf1209ee949563fb71a4a8c), [`543154bc0`](https://github.com/keystonejs/keystone/commit/543154bc081dde33ea29b8a2bff1d3033d538077), [`972e04514`](https://github.com/keystonejs/keystone/commit/972e045145711e39fd6fa167cb87fa05e062272c)]:
  - @keystone-next/fields@11.0.1

## 20.0.0

### Major Changes

- [#5854](https://github.com/keystonejs/keystone/pull/5854) [`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Replaced the types `FileMode` and `ImageMode` with `AssetMode`.

  Added internal experimental Keystone Cloud integration capabilities for images.

* [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The core of Keystone has been re-implemented to make implementing fields and new features in Keystone easier. While the observable changes for most users should be minimal, there could be breakage. If you implemented a custom field type, you will need to change it to the new API, see fields in the `@keystone-next/fields` package for inspiration on how to do this.

- [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced `graphql.itemQueryName` with always using the list key as the singular name in GraphQL and renamed `graphql.listQueryName` to `graphql.plural`

* [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The `KeystoneContext` type no longer has the `keystone` object or functions to run access control.

- [#5665](https://github.com/keystonejs/keystone/pull/5665) [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - List level create, update and delete access control is now called for each operation in a many operation rather than on all of the operations as a whole. This means that rather than recieving originalInput as an array with itemIds, your access control functions will always be called with just an itemId and/or originalInput(depending on which access control function it is). If your access control functions already worked with creating/updating/deleting one item, they will continue working (though you may get TypeScript errors if you were previously handling itemIds and originalInput as an array, to fix that, you should stop handling that case).

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

- [#5868](https://github.com/keystonejs/keystone/pull/5868) [`84a5e7f3b`](https://github.com/keystonejs/keystone/commit/84a5e7f3bc3a29ff31d642831e7aaadfc8534ba1) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Added experimental support for the integration with keystone cloud files

### Patch Changes

- [#5885](https://github.com/keystonejs/keystone/pull/5885) [`4995c682d`](https://github.com/keystonejs/keystone/commit/4995c682dbdcfac2100de9fab98ba1e0e08cbcc2) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `BaseGeneratedListTypes` to have `orderBy` be readonly like the generated types

- Updated dependencies [[`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4), [`e4c19f808`](https://github.com/keystonejs/keystone/commit/e4c19f8086cc14f7f4a8ef390f1f4e1263004d40), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`881c9ffb7`](https://github.com/keystonejs/keystone/commit/881c9ffb7c5941e9fb214ed955148d8ea567e65f), [`ef14e77ce`](https://github.com/keystonejs/keystone/commit/ef14e77cebc9420db8c7d29dfe61f02140f4a705), [`df7d7b6f6`](https://github.com/keystonejs/keystone/commit/df7d7b6f6f2830573393560f4a1ec35234889947), [`84a5e7f3b`](https://github.com/keystonejs/keystone/commit/84a5e7f3bc3a29ff31d642831e7aaadfc8534ba1), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`97fd5e05d`](https://github.com/keystonejs/keystone/commit/97fd5e05d8681bae86001e6b7e8e3f36ebd639b7)]:
  - @keystone-next/fields@11.0.0

## 19.0.0

### Major Changes

- [#5815](https://github.com/keystonejs/keystone/pull/5815) [`b9c828fb0`](https://github.com/keystonejs/keystone/commit/b9c828fb0d6e587976dbd0dc4e87004bce3b2ef7) Thanks [@timleslie](https://github.com/timleslie)! - Fixed the type of `originalInput` in the argument to `defaultValue`.

* [#5802](https://github.com/keystonejs/keystone/pull/5802) [`7bda87ea7`](https://github.com/keystonejs/keystone/commit/7bda87ea7f11e0faceccc6ab3f715c72b07c129b) Thanks [@timleslie](https://github.com/timleslie)! - Changed `config.session` to access a `SessionStrategy` object, rather than a `() => SessionStrategy` function. You will only need to change your configuration if you're using a customised session strategy.

- [#5828](https://github.com/keystonejs/keystone/pull/5828) [`4b11c5ea8`](https://github.com/keystonejs/keystone/commit/4b11c5ea87b759c24bdbff9d18443bbc972757c0) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `keystone` argument from the `ExtendGraphqlSchema` type. This will only impact you if you were directly constructing this function. Users of the `graphQLSchemaExtension` function will not be impacted.

### Patch Changes

- [#5831](https://github.com/keystonejs/keystone/pull/5831) [`5cc35170f`](https://github.com/keystonejs/keystone/commit/5cc35170fd46118089a2a6f863d782aff989bbf0) Thanks [@timleslie](https://github.com/timleslie)! - Updated the type of `KeystoneContext.gqlNames` to be `GqlNames` rather than just `Record<string,string>`.

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

- [#5769](https://github.com/keystonejs/keystone/pull/5769) [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394) Thanks [@timleslie](https://github.com/timleslie)! - The GraphQL query `_all<Items>Meta { count }` generated for each list has been deprecated in favour of a new query `<items>Count`, which directy returns the count.

  A `User` list would have the following query added to the API:

  ```graphql
  usersCount(where: UserWhereInput! = {}): Int
  ```

* [#5787](https://github.com/keystonejs/keystone/pull/5787) [`bb4f4ac91`](https://github.com/keystonejs/keystone/commit/bb4f4ac91c3ed70393774f744075971453a12aba) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `req, session, createContext` args to `config.ui.pageMiddleware` with a `context` arg.

* Updated dependencies [[`b9c828fb0`](https://github.com/keystonejs/keystone/commit/b9c828fb0d6e587976dbd0dc4e87004bce3b2ef7), [`a6a444acd`](https://github.com/keystonejs/keystone/commit/a6a444acd23f2590d9812872441cafb5d088c48e), [`59421c039`](https://github.com/keystonejs/keystone/commit/59421c0399368e56e46537c1c687daa27f5912d0), [`0617c81ea`](https://github.com/keystonejs/keystone/commit/0617c81eacc88e40bdd21bacab285d674b171a4a), [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a), [`590bb1fe9`](https://github.com/keystonejs/keystone/commit/590bb1fe9254c2f8feff7e3a0e2e964610116f95), [`19a756496`](https://github.com/keystonejs/keystone/commit/19a7564964d9dcdc94ecdda9c0a0e92c539eb309)]:
  - @keystone-next/fields@10.0.0
  - @keystone-next/adapter-prisma-legacy@8.0.0

## 18.0.0

### Major Changes

- [#5746](https://github.com/keystonejs/keystone/pull/5746) [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d) Thanks [@timleslie](https://github.com/timleslie)! - Update Node.js dependency to `^12.20 || >= 14.13`.

### Patch Changes

- Updated dependencies [[`d40c2a590`](https://github.com/keystonejs/keystone/commit/d40c2a5903f07e5a1e80d116ec4cea00289bbf6a), [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d), [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab)]:
  - @keystone-next/adapter-prisma-legacy@7.0.0
  - @keystone-next/fields@9.0.0

## 17.1.0

### Minor Changes

- [#5143](https://github.com/keystonejs/keystone/pull/5143) [`1ef9986dd`](https://github.com/keystonejs/keystone/commit/1ef9986ddc5a4a881a3fc6fae3d1420447174fdb) Thanks [@timleslie](https://github.com/timleslie)! - Added `graphql.cacheHint` configuration for lists and fields.

### Patch Changes

- [#5686](https://github.com/keystonejs/keystone/pull/5686) [`62e68c8e5`](https://github.com/keystonejs/keystone/commit/62e68c8e5b4964785a173ab05ff89cba9cc685f2) Thanks [@timleslie](https://github.com/timleslie)! - Reduced the explicit dependence on the internal Keystone object when creating context objects.

* [#5673](https://github.com/keystonejs/keystone/pull/5673) [`deb7f9504`](https://github.com/keystonejs/keystone/commit/deb7f9504573da67b0cd76d3f53dc0fcceaf1021) Thanks [@timleslie](https://github.com/timleslie)! - Refactored code to parse `config.db`. No functional changes.

## 17.0.1

### Patch Changes

- [#5509](https://github.com/keystonejs/keystone/pull/5509) [`7e81b52b0`](https://github.com/keystonejs/keystone/commit/7e81b52b0f2240f0c590eb8f6733360cab9fe93a) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed incorrect types which said that field level delete access control exists when it does not

* [#5518](https://github.com/keystonejs/keystone/pull/5518) [`fddeacf79`](https://github.com/keystonejs/keystone/commit/fddeacf79d25fea15be57d1a4ec16815bcdc4ab5) Thanks [@timleslie](https://github.com/timleslie)! - Updated the list item and db item APIs to include an empty default for `.findMany()` and `.count()`.

- [#5575](https://github.com/keystonejs/keystone/pull/5575) [`fdebf79cc`](https://github.com/keystonejs/keystone/commit/fdebf79cc3520ffb65979ddac7d61791f4f37324) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused `description` field from `FieldConfig.ui` type.

* [#5525](https://github.com/keystonejs/keystone/pull/5525) [`9fd7cc62a`](https://github.com/keystonejs/keystone/commit/9fd7cc62a889f8a0f8933040bb16fcc36af7795e) Thanks [@timleslie](https://github.com/timleslie)! - Moved field-related types into their own internal module.

* Updated dependencies [[`b7aeb232d`](https://github.com/keystonejs/keystone/commit/b7aeb232db43b32cae0bca3fcb74479d6834c587), [`f7d4c9b9f`](https://github.com/keystonejs/keystone/commit/f7d4c9b9f06cc3090b59d4b29e0907e9f3d1faee), [`8577eb3ba`](https://github.com/keystonejs/keystone/commit/8577eb3baafe9cd61c48d89aca9eff252765e5a6), [`05d4883ee`](https://github.com/keystonejs/keystone/commit/05d4883ee19bcfdfcbff7f80693a3fa85cf81aaa), [`a0c5aa307`](https://github.com/keystonejs/keystone/commit/a0c5aa30771d187253d0cfe24b4b686e136136cc), [`3e33cd3ff`](https://github.com/keystonejs/keystone/commit/3e33cd3ff46f824ec3516e5810a7e5027b332a5a), [`49dd46843`](https://github.com/keystonejs/keystone/commit/49dd468435a96c537f5649aa2fd9e21103da40e1)]:
  - @keystone-next/fields@8.0.0
  - @keystone-next/adapter-prisma-legacy@6.0.1

## 17.0.0

### Major Changes

- [#5467](https://github.com/keystonejs/keystone/pull/5467) [`7498fcabb`](https://github.com/keystonejs/keystone/commit/7498fcabba3ef6b411dd3bf67a20821702442ebc) Thanks [@timleslie](https://github.com/timleslie)! - Removed the deprecated `context.executeGraphQL`. Identical functionality is available via `context.graphql.raw`.

* [#5397](https://github.com/keystonejs/keystone/pull/5397) [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b) Thanks [@bladey](https://github.com/bladey)! - Updated Node engine version to 12.x due to 10.x reaching EOL on 2021-04-30.

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

* [#5396](https://github.com/keystonejs/keystone/pull/5396) [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Added types for new images functionality in keystone.

### Patch Changes

- [#5478](https://github.com/keystonejs/keystone/pull/5478) [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed) Thanks [@timleslie](https://github.com/timleslie)! - Improved types for `BaseKeystoneList`.

* [#5442](https://github.com/keystonejs/keystone/pull/5442) [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db) Thanks [@timleslie](https://github.com/timleslie)! - Updated type definitions to be more consistent and correct.

- [#5466](https://github.com/keystonejs/keystone/pull/5466) [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78) Thanks [@timleslie](https://github.com/timleslie)! - Improved the `BaseKeystone` type to be more correct.

- Updated dependencies [[`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`d0adec53f`](https://github.com/keystonejs/keystone/commit/d0adec53ff20c2246dfe955b449b7c6e1afe96fb), [`c7aecec3c`](https://github.com/keystonejs/keystone/commit/c7aecec3c768eec742e0ce9c5506331e902e5124), [`f059f6349`](https://github.com/keystonejs/keystone/commit/f059f6349bee3dce8bbf4a0584b235e97872851c), [`11f5bb631`](https://github.com/keystonejs/keystone/commit/11f5bb6316b90ec603aa034db1b9259c911204ed), [`8ab2c9bb6`](https://github.com/keystonejs/keystone/commit/8ab2c9bb6633c2f85844e658f534582c30a39a57), [`637ae05d3`](https://github.com/keystonejs/keystone/commit/637ae05d3f8a138902c2d03c5b342cb93c440767), [`fe55e9289`](https://github.com/keystonejs/keystone/commit/fe55e9289b898bdcb937eb5e981dba2bb58a672f), [`a5627304b`](https://github.com/keystonejs/keystone/commit/a5627304b7921a0f1484d6d08330115d0edbb45b), [`1d85d7ff4`](https://github.com/keystonejs/keystone/commit/1d85d7ff4e8d7795d6e0f82484cf7108d11925db), [`2bef01aaa`](https://github.com/keystonejs/keystone/commit/2bef01aaacd32eb746353bde11dd5e37c67fb43e), [`0e74d8123`](https://github.com/keystonejs/keystone/commit/0e74d81238d5d00cc3eb968c95c02f25cb3a5a78), [`be60812f2`](https://github.com/keystonejs/keystone/commit/be60812f29d7768ce65a5f5e8c40597d4742c5d7), [`d7e8cad4f`](https://github.com/keystonejs/keystone/commit/d7e8cad4fca5d8ffefa235c2ff30ec8e2e0d6276), [`ecf07393a`](https://github.com/keystonejs/keystone/commit/ecf07393a19714f1686772bd082de7d229065aa2), [`89b869e8d`](https://github.com/keystonejs/keystone/commit/89b869e8d492151449f2146108767a7e5e5ecdfa), [`58a793988`](https://github.com/keystonejs/keystone/commit/58a7939888ec84d0f089d77ca1ce9d94ef0d9a85)]:
  - @keystone-next/fields@7.0.0
  - @keystone-next/adapter-prisma-legacy@6.0.0

## 16.0.0

### Major Changes

- [#5266](https://github.com/keystonejs/keystone/pull/5266) [`c28e765d1`](https://github.com/keystonejs/keystone/commit/c28e765d12655f802e324b82529fcf571d88c0c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `migrationAction` argument to `createSystem` and require that the PrismaClient is passed to `createSystem` to be able to connect to the database.

* [#5256](https://github.com/keystonejs/keystone/pull/5256) [`399e6db39`](https://github.com/keystonejs/keystone/commit/399e6db39c51cf9e8bbf3dde0887e5bf55dd1c4d) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for the `knex` and `mongoose` database adapters. We now only support `prisma_postgresql` and `prisma_sqlite`.

### Minor Changes

- [#5368](https://github.com/keystonejs/keystone/pull/5368) [`b40016301`](https://github.com/keystonejs/keystone/commit/b40016301dab71630068cc86c04828c5ee1683e8) Thanks [@timleslie](https://github.com/timleslie)! - The config option `db.adapter` is now deprecated. It has been repaced with `db.provider` which can take the values `postgresql` or `sqlite`.

* [#5283](https://github.com/keystonejs/keystone/pull/5283) [`192393d0d`](https://github.com/keystonejs/keystone/commit/192393d0df67e123a694a42dd3f95ffa6d40042b) Thanks [@timleslie](https://github.com/timleslie)! - The flag `{ experimental: { prismaSqlite: true } }` is no longer required to use the SQLite adapter.

- [#5341](https://github.com/keystonejs/keystone/pull/5341) [`1886b4323`](https://github.com/keystonejs/keystone/commit/1886b43235e50bd2e070350d258f0a3145c19bbc) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `generateNextGraphqlAPI` and `generateNodeAPI` experimental options

## 15.0.1

### Patch Changes

- [#5257](https://github.com/keystonejs/keystone/pull/5257) [`34dd809ee`](https://github.com/keystonejs/keystone/commit/34dd809eef2368bba1e50ed613b36c5dac7262d1) Thanks [@timleslie](https://github.com/timleslie)! - Updated type `GraphQLExecutionArguments.variables` to be optional.

## 15.0.0

### Major Changes

- [#5155](https://github.com/keystonejs/keystone/pull/5155) [`215aed387`](https://github.com/keystonejs/keystone/commit/215aed387d35e9d4c896fe76991b12b54789cc55) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `createOnly` migration mode

* [#5163](https://github.com/keystonejs/keystone/pull/5163) [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced `MigrationMode` type with `MigrationAction` that `createSystem` and `createKeystone` now accept.

### Minor Changes

- [#3946](https://github.com/keystonejs/keystone/pull/3946) [`8e9b04ecd`](https://github.com/keystonejs/keystone/commit/8e9b04ecd07d9c5d0e6aead4705e7a655498ae05) Thanks [@timleslie](https://github.com/timleslie)! - Added experimental support for Prisma + SQLite as a database adapter.

* [#5102](https://github.com/keystonejs/keystone/pull/5102) [`714bdadce`](https://github.com/keystonejs/keystone/commit/714bdadce8c87a15cf3a296b44a31b9b9ca95e9d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `none-skip-client-generation` migrationMode

- [#5087](https://github.com/keystonejs/keystone/pull/5087) [`56e5fe10b`](https://github.com/keystonejs/keystone/commit/56e5fe10bc89877be7d7e3013e53012b4d82b648) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `MigrationMode` type

* [#5163](https://github.com/keystonejs/keystone/pull/5163) [`b37cbffc8`](https://github.com/keystonejs/keystone/commit/b37cbffc886a4317793a97b7a8afd95639f59ce0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `db.useMigrations` option to replace using `keystone-next dev` and `keystone-next prototype` depending on what kind of migration strategy you want to use. If you were previously using `keystone-next dev`, you should set `db.useMigrations` to true in your config and continue using `keystone-next dev`. If you were previously using `keystone-next prototype`, you should now use `keystone-next dev`.

- [#5084](https://github.com/keystonejs/keystone/pull/5084) [`40d4fff5d`](https://github.com/keystonejs/keystone/commit/40d4fff5d63850cbd513c80bcb5e551e5782dc4b) Thanks [@timleslie](https://github.com/timleslie)! - Updated `context.sudo()` to provide access to all operations, including those excluded by `{ access: false }` in the public schema.

* [#4912](https://github.com/keystonejs/keystone/pull/4912) [`d31acf61b`](https://github.com/keystonejs/keystone/commit/d31acf61bcca96ac059d4ba2e78955513a6a0f91) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.graphql.apolloConfig` option to allow developers to configure the `ApolloServer` object provided by Keystone.

### Patch Changes

- [#5104](https://github.com/keystonejs/keystone/pull/5104) [`b84abebb6`](https://github.com/keystonejs/keystone/commit/b84abebb6c817172d04f338befa45b3573af55d6) Thanks [@timleslie](https://github.com/timleslie)! - Fixed type of `defaultValue` for fields.

* [#5150](https://github.com/keystonejs/keystone/pull/5150) [`3a9d20ce1`](https://github.com/keystonejs/keystone/commit/3a9d20ce11463e7f73f6b6325375cdcee17d63ed) Thanks [@timleslie](https://github.com/timleslie)! - Applied eslint `import/order` rule.

## 14.0.1

### Patch Changes

- [`9b202b31a`](https://github.com/keystonejs/keystone/commit/9b202b31a7d4944b709fe0ce58d6ca7ec1523a02) [#5033](https://github.com/keystonejs/keystone/pull/5033) Thanks [@rohan-deshpande](https://github.com/rohan-deshpande)! - Added `experimental` config namespace and `enableNextJsGraphqlApiEndpoint` property to support the GraphQL API being served from a Next.js API route rather than Express

## 14.0.0

### Major Changes

- [`24e0ef5b6`](https://github.com/keystonejs/keystone/commit/24e0ef5b6bd93c105fdef2caea6b862ff1dfd6f3) [#4945](https://github.com/keystonejs/keystone/pull/4945) Thanks [@timleslie](https://github.com/timleslie)! - Removed the `context` argument from `KeystoneContext.graphql.raw` and `KeystoneContext.graphql.run`.

* [`0f86e99bb`](https://github.com/keystonejs/keystone/commit/0f86e99bb3aa15f691ab7ff79e5a9ae3d1ac464e) [#4839](https://github.com/keystonejs/keystone/pull/4839) Thanks [@timleslie](https://github.com/timleslie)! - Removed `context.graphql.createContext` from `KeystoneContext`.

### Minor Changes

- [`2655c0b1b`](https://github.com/keystonejs/keystone/commit/2655c0b1bf714d80d46e1ff4e414b4bce474c23d) [#4866](https://github.com/keystonejs/keystone/pull/4866) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.ui.isDisabled` option to completely disable the Admin UI.

* [`bea9008f8`](https://github.com/keystonejs/keystone/commit/bea9008f82efea7fcf1cb547f3841915cd4689cc) [#4944](https://github.com/keystonejs/keystone/pull/4944) Thanks [@timleslie](https://github.com/timleslie)! - Deprecated `KeystoneContext.keystone`.

- [`5d565ea57`](https://github.com/keystonejs/keystone/commit/5d565ea57853713458329b823bde7a38776b02bc) [#4892](https://github.com/keystonejs/keystone/pull/4892) Thanks [@timleslie](https://github.com/timleslie)! - Added support for configuring the field to use for `search` filtering via the `db: { searchField }` list config option.

### Patch Changes

- [`f4e4498c6`](https://github.com/keystonejs/keystone/commit/f4e4498c6e4c7301288f23048f4aad3c492985c7) [#5018](https://github.com/keystonejs/keystone/pull/5018) Thanks [@bladey](https://github.com/bladey)! - Updated legacy packages to the @keystone-next namespace.

* [`687fd5ef0`](https://github.com/keystonejs/keystone/commit/687fd5ef0f798da996f970af1591411f9cfe0985) [#4835](https://github.com/keystonejs/keystone/pull/4835) Thanks [@timleslie](https://github.com/timleslie)! - Removed the unused `connect` and `disconnect` properties of `SessionStrategy`.

- [`29e787983`](https://github.com/keystonejs/keystone/commit/29e787983bdc26b147d6b5f476e70768bbc5318c) [#4905](https://github.com/keystonejs/keystone/pull/4905) Thanks [@gautamsi](https://github.com/gautamsi)! - Fixed typing for `afterDelete` or `beforeDelete` hooks. Also added type for `updatedItem` in the `afterChange` or `beforeChange` hook

* [`45ea93421`](https://github.com/keystonejs/keystone/commit/45ea93421f9a6cf9b7ccbd983e0c9cbd687ff6af) [#4810](https://github.com/keystonejs/keystone/pull/4810) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replaced usage of `React.ComponentType` with more accurate types that do not automatically add `children` prop.

- [`6c949dbf2`](https://github.com/keystonejs/keystone/commit/6c949dbf262350e280072d82cd48fdd31ff5ba6d) [#4942](https://github.com/keystonejs/keystone/pull/4942) Thanks [@timleslie](https://github.com/timleslie)! - Refactored `KeystoneContext` definition to make documentation easier. No functional changes.

## 13.0.0

### Major Changes

- [`e29ae2749`](https://github.com/keystonejs/keystone/commit/e29ae2749321c103dd494eba6778ee4137bb2aa3) [#4818](https://github.com/keystonejs/keystone/pull/4818) Thanks [@timleslie](https://github.com/timleslie)! - Added `context.exitSudo()` and `context.withSession(session)` methods. Removed `context.createContext()`.

* [`8d0be8a89`](https://github.com/keystonejs/keystone/commit/8d0be8a89e2d9b89826365f81f47b8d8863b93d0) [#4815](https://github.com/keystonejs/keystone/pull/4815) Thanks [@timleslie](https://github.com/timleslie)! - Added a `.sudo()` method to `context` objects, which is equivalent to the common operation `context.createContext({ skipAccessControl: true })`.

### Patch Changes

- [`208722a42`](https://github.com/keystonejs/keystone/commit/208722a4234434e116846756bab18f7e11674ec8) [#4784](https://github.com/keystonejs/keystone/pull/4784) Thanks [@timleslie](https://github.com/timleslie)! - Reordered type definitions for consistency with docs. Remove unused type `ListAdminUIConfig.path`.

* [`ad75e3d61`](https://github.com/keystonejs/keystone/commit/ad75e3d61c73ba1239fd21b58f175aac01d9f302) [#4798](https://github.com/keystonejs/keystone/pull/4798) Thanks [@timleslie](https://github.com/timleslie)! - Removed unused type `config.ui.path`.

- [`954350389`](https://github.com/keystonejs/keystone/commit/9543503894c3e78a9b69a75cbfb3ca6b85ae34e8) [#4778](https://github.com/keystonejs/keystone/pull/4778) Thanks [@timleslie](https://github.com/timleslie)! - Removed the unused `plural`, `singular`, `label`, `db`, and `graphql.cacheHint` list config options.

## 12.0.1

### Patch Changes

- [`6ecd2a766`](https://github.com/keystonejs/keystone/commit/6ecd2a766c868d46f84291bc1611eadef79e6100) [#4772](https://github.com/keystonejs/keystone/pull/4772) Thanks [@timleslie](https://github.com/timleslie)! - Removed `config.db.dropDatabase` for `prisma_postgresql` and `config.db.knexOptions` for `knex` as they were unused.

* [`777981069`](https://github.com/keystonejs/keystone/commit/7779810691c4154e1344ced4fb94c5bb9524a71f) [#4765](https://github.com/keystonejs/keystone/pull/4765) Thanks [@timleslie](https://github.com/timleslie)! - Reorganised package internals to allow for easier documentation.

- [`4d808eaa5`](https://github.com/keystonejs/keystone/commit/4d808eaa5aa1593ad1e54000d80f674f7c4d12bd) [#4766](https://github.com/keystonejs/keystone/pull/4766) Thanks [@timleslie](https://github.com/timleslie)! - Removed `config.db.provider` option, which did not have any meaningful, viable value.

## 12.0.0

### Major Changes

- [`1744c5f05`](https://github.com/keystonejs/keystone/commit/1744c5f05c9a13e680aaa1ed151f23f1d015ed9c) [#4763](https://github.com/keystonejs/keystone/pull/4763) Thanks [@timleslie](https://github.com/timleslie)! - Removed the type `SchemaConfig`. Updated the `keystone` parameter of `ExtendGraphqlSchema` to be `BaseKeystone`.

* [`5be53ddc3`](https://github.com/keystonejs/keystone/commit/5be53ddc39be1415d56e2fa5e7898ab9edf468d5) [#4762](https://github.com/keystonejs/keystone/pull/4762) Thanks [@timleslie](https://github.com/timleslie)! - Renamed the type `KeystoneAdminUIConfig` to `AdminUIConfig`.

### Minor Changes

- [`fd0dff3fd`](https://github.com/keystonejs/keystone/commit/fd0dff3fdfcbe20b2884357a6e1b20f1b7307652) [#4669](https://github.com/keystonejs/keystone/pull/4669) Thanks [@MurzNN](https://github.com/MurzNN)! - Added the ability to set the server port number via `config.server.port`.

### Patch Changes

- [`d9675553b`](https://github.com/keystonejs/keystone/commit/d9675553b33f39e2c7ada7eb6555d16e9fccb37e) [#4761](https://github.com/keystonejs/keystone/pull/4761) Thanks [@timleslie](https://github.com/timleslie)! - Remove unused configuration option `config.graphql.path` from the `KeystoneConfig` type.

* [`096927a68`](https://github.com/keystonejs/keystone/commit/096927a6813a23030988ba8b64b2e8452f571a33) [#4756](https://github.com/keystonejs/keystone/pull/4756) Thanks [@timleslie](https://github.com/timleslie)! - Added correct types for `config.server.cors`.

## 11.0.2

### Patch Changes

- [`94fbb45f1`](https://github.com/keystonejs/keystone/commit/94fbb45f1920781423f6a8e489e812b74a260099) [#4728](https://github.com/keystonejs/keystone/pull/4728) Thanks [@timleslie](https://github.com/timleslie)! - Added new CLI options to support migrations in the Prisma adapter: `prototype`, `reset`, `generate`, and `deploy`.

* [`588be9ea1`](https://github.com/keystonejs/keystone/commit/588be9ea16ab5fb6e74f844b917ca8aeb91a9ac9) [#3222](https://github.com/keystonejs/keystone/pull/3222) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for multiple database adapters in a single `Keystone` system. The `adapters` and `defaultAdapter` config options were removed from the `Keystone()` constructor. If you were accessing the adapter object via `keystone.adapters.KnexAdapter` or `keystone.adapters.MongooseAdapter` you should now simply access `keystone.adapter`.

## 11.0.1

### Patch Changes

- [`a96c24cca`](https://github.com/keystonejs/keystone/commit/a96c24ccab8dadc9e8f0131fe6509abd64a776f5) [#4696](https://github.com/keystonejs/keystone/pull/4696) Thanks [@timleslie](https://github.com/timleslie)! - Marked `db.enableLogging` as optional.

## 11.0.0

### Major Changes

- [`0d9404768`](https://github.com/keystonejs/keystone/commit/0d94047686d1bb1308fd8c47b769c999390d8f6d) [#4659](https://github.com/keystonejs/keystone/pull/4659) Thanks [@timleslie](https://github.com/timleslie)! - Removed `system` argument from `config.ui.getAdditionalFiles`.

* [`7ffd2ebb4`](https://github.com/keystonejs/keystone/commit/7ffd2ebb42dfaf12e23ba166b44ec4db60d9824b) [#4662](https://github.com/keystonejs/keystone/pull/4662) Thanks [@timleslie](https://github.com/timleslie)! - Remove type `KeystoneSystem`.

### Minor Changes

- [`4768fbf83`](https://github.com/keystonejs/keystone/commit/4768fbf831ffff648e540c479a1954ae40e05aaa) [#4654](https://github.com/keystonejs/keystone/pull/4654) Thanks [@timleslie](https://github.com/timleslie)! - Added an `args` paramter to `Keystone.connect(args)`, which is passed through as the second argument to the config function `onConnect(keystone, args)`.

### Patch Changes

- [`6ea4ff3cf`](https://github.com/keystonejs/keystone/commit/6ea4ff3cf77d5d2278bf4f0415d11aa7399a0490) [#4660](https://github.com/keystonejs/keystone/pull/4660) Thanks [@timleslie](https://github.com/timleslie)! - Converted `@keystonejs/test-utils` to TypeScript.

## 10.0.0

### Major Changes

- [`24ecd72e5`](https://github.com/keystonejs/keystone/commit/24ecd72e54eee12442c7c1d0533936a9ad86620a) [#4604](https://github.com/keystonejs/keystone/pull/4604) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `SerializedAdminMeta` to `AdminMetaRootVal`.

## 9.0.0

### Major Changes

- [`89f7d4599`](https://github.com/keystonejs/keystone/commit/89f7d459906072940da1355c38815d1b3ef49368) [#4586](https://github.com/keystonejs/keystone/pull/4586) Thanks [@timleslie](https://github.com/timleslie)! - Removed `adminMeta` from `KeystoneSystem`. `getAdminMetaSchema` now takes a `BaseKeystone` argument `keystone` rather than `adminMeta`.

### Patch Changes

- [`933c78a1e`](https://github.com/keystonejs/keystone/commit/933c78a1edc070b63f7720f64c15421ba28bdde5) [#4587](https://github.com/keystonejs/keystone/pull/4587) Thanks [@timleslie](https://github.com/timleslie)! - Use `keystone.getTypeDefs` and `keystone.getResolvers` when creating the graphQL schema.

## 8.0.0

### Major Changes

- [`075ef1628`](https://github.com/keystonejs/keystone/commit/075ef16281a89c8291f90275adca98f042cc54da) [#4547](https://github.com/keystonejs/keystone/pull/4547) Thanks [@timleslie](https://github.com/timleslie)! - Removed `allViews` from `KeystoneSystem` type. `createAdminMeta` no longer returns `allViews`.

## 7.0.0

### Major Changes

- [`661104764`](https://github.com/keystonejs/keystone/commit/66110476491953af2134cd3cd4e3ef7c361ac5da) [#4509](https://github.com/keystonejs/keystone/pull/4509) Thanks [@timleslie](https://github.com/timleslie)! - Replaced `KeystoneAdminUIConfig.system` with `KeystoneAdminUIConfig.createConfig` to reduce API surface area.

* [`481e456ac`](https://github.com/keystonejs/keystone/commit/481e456ac4158207436ddd9be18fdca0f27b6409) [#4533](https://github.com/keystonejs/keystone/pull/4533) Thanks [@timleslie](https://github.com/timleslie)! - Renamed to `SessionImplementation.createContext` to `createSessionContext`.

### Minor Changes

- [`6d09df338`](https://github.com/keystonejs/keystone/commit/6d09df3381d1682b8002d52ed1696b661fdff035) [#4523](https://github.com/keystonejs/keystone/pull/4523) Thanks [@timleslie](https://github.com/timleslie)! - Added support for all database adapter configuration options.

* [`2308e5efc`](https://github.com/keystonejs/keystone/commit/2308e5efc7c6893c87652411496b15a8124f6e05) [#4527](https://github.com/keystonejs/keystone/pull/4527) Thanks [@timleslie](https://github.com/timleslie)! - Added an optional `req` property to the `KeystoneContext` type.

- [`f2c7675fb`](https://github.com/keystonejs/keystone/commit/f2c7675fb51ed41e6df8248c76b9322d6de5ee0d) [#4528](https://github.com/keystonejs/keystone/pull/4528) Thanks [@timleslie](https://github.com/timleslie)! - `KeystoneAdminUIConfig.isAccessAllowed` now takes a full `KeystoneContext` object, rather than just `{ session }`.

### Patch Changes

- [`39639b203`](https://github.com/keystonejs/keystone/commit/39639b2031bb749067ef537ea47e5d93a8bb89da) [#4529](https://github.com/keystonejs/keystone/pull/4529) Thanks [@timleslie](https://github.com/timleslie)! - Added missing attributes `path`, `viewsIndex`, and `customViews` to `FieldMeta`.

## 6.0.0

### Major Changes

- [`dc58df5c8`](https://github.com/keystonejs/keystone/commit/dc58df5c87d694ce94b7d1c2b20d4976176dbd13) [#4493](https://github.com/keystonejs/keystone/pull/4493) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `SerializedFieldMeta.views` to `SerializedFieldMeta.viewsIndex` to makes it clear that this is the index, not the views object itself.

* [`a5d7b264a`](https://github.com/keystonejs/keystone/commit/a5d7b264ad3e5590e335758881d22f7f296203c9) [#4473](https://github.com/keystonejs/keystone/pull/4473) Thanks [@timleslie](https://github.com/timleslie)! - Added a `resolveFields: false | string` argument to the items API methods.

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

- [`b7a4b997b`](https://github.com/keystonejs/keystone/commit/b7a4b997bae5b2269bea0ad94ca771e63c26ab95) [#4501](https://github.com/keystonejs/keystone/pull/4501) Thanks [@timleslie](https://github.com/timleslie)! - Removed `sessionImplementation` from `KeystoneSystem` and instead pass it explicitly where needed.

* [`ca34424d5`](https://github.com/keystonejs/keystone/commit/ca34424d58e58cc4a657828b1362978be8ee4f62) [#4494](https://github.com/keystonejs/keystone/pull/4494) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `KeystoneSystem.views` to `KeystoneSystem.allViews`.

- [`57092b7c1`](https://github.com/keystonejs/keystone/commit/57092b7c13845fffd1f3767bb609d203afbc2776) [#4465](https://github.com/keystonejs/keystone/pull/4465) Thanks [@timleslie](https://github.com/timleslie)! - Updated `SessionStrategy.start` and `SessionStrategy.end` to be required attributes.

* [`b21b62ed5`](https://github.com/keystonejs/keystone/commit/b21b62ed59fcd83ef2fc89587544b9d64522ba27) [#4477](https://github.com/keystonejs/keystone/pull/4477) Thanks [@timleslie](https://github.com/timleslie)! - Changed the type `SessionContext` to have parameters `startSession` and `endSession` as required. This type also takes a type parameter `T` which corresponds to the data type of the `data` argument to `startSession`.

- [`2da044a0c`](https://github.com/keystonejs/keystone/commit/2da044a0cb22dc16a54b7b5555c2b2678e8d4cab) [#4482](https://github.com/keystonejs/keystone/pull/4482) Thanks [@timleslie](https://github.com/timleslie)! - Removed `config` from type `KeystoneSystem`. The config object is now explicitly passed around where needed to make it clear which code is consuming it.
  Type `KeystoneAdminUIConfig.getAdditionalFiles` now takes a `config` parameter.

* [`3f3c65ab2`](https://github.com/keystonejs/keystone/commit/3f3c65ab2d206ef1c72f17259e73fb24a79f0a9b) [#4458](https://github.com/keystonejs/keystone/pull/4458) Thanks [@timleslie](https://github.com/timleslie)! - Removed `createContextFromRequest` and `createSessionContext` from `KeystoneSystem` and replaced them with `sessionImplementation`, which provides the same core functionality.

- [`fe52e25e0`](https://github.com/keystonejs/keystone/commit/fe52e25e04db121adbc6a0ce3bd0dbe1c7270180) [#4492](https://github.com/keystonejs/keystone/pull/4492) Thanks [@timleslie](https://github.com/timleslie)! - Replaced the `system` argument on `SessionStrategy.start`, '.end`, and`.get`with`createContext`.

### Minor Changes

- [`68d361d25`](https://github.com/keystonejs/keystone/commit/68d361d2596e8811caf00390c60341ef0c233c7b) [#4467](https://github.com/keystonejs/keystone/pull/4467) Thanks [@timleslie](https://github.com/timleslie)! - Added type for `BaseKeystone.createApolloServer()`.

### Patch Changes

- [`341ee2b4b`](https://github.com/keystonejs/keystone/commit/341ee2b4b7eab89f296146ff9e14ce53233235f6) [#4475](https://github.com/keystonejs/keystone/pull/4475) Thanks [@timleslie](https://github.com/timleslie)! - Use `SerializedAdminMeta` in `createGraphQLSchema` and `FieldType<...>.getAdminMeta?`.

* [`4b019b8cf`](https://github.com/keystonejs/keystone/commit/4b019b8cfcb7bea6f800609da5d07e8c8abfc80a) [#4478](https://github.com/keystonejs/keystone/pull/4478) Thanks [@timleslie](https://github.com/timleslie)! - Refactored types to isolate base keystone type definitions.

- [`bf22d9f2a`](https://github.com/keystonejs/keystone/commit/bf22d9f2afe537111b95571b86d4fd2759eb6a98) [#4498](https://github.com/keystonejs/keystone/pull/4498) Thanks [@timleslie](https://github.com/timleslie)! - Removed usage of `keystone as any`.

* [`1c12b8204`](https://github.com/keystonejs/keystone/commit/1c12b8204f8238997ddaf7337c44cf26ebea9ba4) [#4424](https://github.com/keystonejs/keystone/pull/4424) Thanks [@timleslie](https://github.com/timleslie)! - Added more specific types for `listQuery`, `listQueryMeta`, and the items API.

## 5.0.0

### Major Changes

- [`803626e88`](https://github.com/keystonejs/keystone/commit/803626e8854f9b7d293bd1829398d25a6692154a) [#4440](https://github.com/keystonejs/keystone/pull/4440) Thanks [@JedWatson](https://github.com/JedWatson)! - Changed the `config.db.onConnect` argument to accept a `KeystoneContext` instance, created with `{ skipAccessControl: true }`, rather than a `BaseKeystone` instance.

  Added database APIs `{ knex?, mongoose?, prisma? }" to`KeystoneContext`.

### Minor Changes

- [`b6498d9f1`](https://github.com/keystonejs/keystone/commit/b6498d9f1341648742f2db78fec53b851b36dddd) [#4427](https://github.com/keystonejs/keystone/pull/4427) Thanks [@timleslie](https://github.com/timleslie)! - Added a `BaseKeystone` type to replace usage of `any` in all instances.

### Patch Changes

- [`d36e580cc`](https://github.com/keystonejs/keystone/commit/d36e580cc21e4b77a1bd0615c96c0793b9c5dac5) [#4426](https://github.com/keystonejs/keystone/pull/4426) Thanks [@timleslie](https://github.com/timleslie)! - Used the `KeystoneContext` type rather than `any` where appropriate.

## 4.1.1

### Patch Changes

- [`6cd469e29`](https://github.com/keystonejs/keystone/commit/6cd469e29682ff41a515ed76919efc2bfe0c7567) [#4414](https://github.com/keystonejs/keystone/pull/4414) Thanks [@JedWatson](https://github.com/JedWatson)! - Typed keystone context

## 4.1.0

### Minor Changes

- [`add3f67e3`](https://github.com/keystonejs/keystone/commit/add3f67e379caebbcf0880b4ce82cf6a1e89020b) [#4316](https://github.com/keystonejs/keystone/pull/4316) Thanks [@timleslie](https://github.com/timleslie)! - Added a `config.server.cors` option to allow configuration of the cors middleware. Updated the Apollo server middleware to not override cors options.

* [`2d5f78207`](https://github.com/keystonejs/keystone/commit/2d5f78207103caaf8f86a4dd05b7e4b0a4795213) [#4302](https://github.com/keystonejs/keystone/pull/4302) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add optional `allowedExportsOnCustomViews` export to field views

## 4.0.0

### Major Changes

- [`11777cddb`](https://github.com/keystonejs/keystone/commit/11777cddba45b28a9e17a3149b792db121322b46) [#4263](https://github.com/keystonejs/keystone/pull/4263) Thanks [@timleslie](https://github.com/timleslie)! - Renamed the type `Keystone` to `KeystoneSystem` to avoid confusion with the core `Keystone` class.

* [`cc987d078`](https://github.com/keystonejs/keystone/commit/cc987d078653fd9e686069f9f885f1269b64a882) [#4269](https://github.com/keystonejs/keystone/pull/4269) Thanks [@timleslie](https://github.com/timleslie)! - Renamed `keystone` argument of `KeystoneAdminUIConfig.getAdditionalFiles()` and `KeystoneAdminUIConfig.pageMiddleware()` to `system`.
  Renamed `keystone` argument of `SessionStrategy.start`, `SessionStrategy.end` and `SessionStrategy.get` to `system`.

### Patch Changes

- [`b2de22941`](https://github.com/keystonejs/keystone/commit/b2de229419cc93b69ee4027c387cab9c8d701488) [#4288](https://github.com/keystonejs/keystone/pull/4288) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed type for defaultFieldMode in listConfig.ui.itemView

## 3.0.0

### Major Changes

- [`98dd7dcff`](https://github.com/keystonejs/keystone/commit/98dd7dcffa797eb40eb1713ba1ac2697dfef95e3) [#4200](https://github.com/keystonejs/keystone/pull/4200) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Renamed CRUD API to Items API and changed property on context from `crud` to `lists`

* [`fab97f6b4`](https://github.com/keystonejs/keystone/commit/fab97f6b416d7040cdd159be379e226142fc189c) [#4238](https://github.com/keystonejs/keystone/pull/4238) Thanks [@timleslie](https://github.com/timleslie)! - Removed `getBackingType` from `FieldType` as this functionality is now provided by `field.getBackingTypes()` in the core field classes.

- [`9928da13e`](https://github.com/keystonejs/keystone/commit/9928da13ecca03fed560a42e1071afc59c0feb3b) [#4242](https://github.com/keystonejs/keystone/pull/4242) Thanks [@timleslie](https://github.com/timleslie)! - Removed `name` field from `KeystoneConfig` type, as it doesn't actually do anything.

### Minor Changes

- [`d02957453`](https://github.com/keystonejs/keystone/commit/d029574533c179fa53f65c0e0ba3812dab2ba4ad) [#4239](https://github.com/keystonejs/keystone/pull/4239) Thanks [@timleslie](https://github.com/timleslie)! - Added support for `config.db.onConnect` in the new APIs. This is passed through as `Keystone{ onConnect }` to the core object.

* [`8f4ebd5f7`](https://github.com/keystonejs/keystone/commit/8f4ebd5f70251ccdfb6b5ce14efb9fb59f5d2b3d) [#4201](https://github.com/keystonejs/keystone/pull/4201) Thanks [@JedWatson](https://github.com/JedWatson)! - New internal graphql api

### Patch Changes

- [`98e8fd4bc`](https://github.com/keystonejs/keystone/commit/98e8fd4bc586c732d629328ef643014ce42442ed) [#4212](https://github.com/keystonejs/keystone/pull/4212) Thanks [@JedWatson](https://github.com/JedWatson)! - Rename KeystoneItemAPI to KeystoneListsAPI

* [`2a2a7c00b`](https://github.com/keystonejs/keystone/commit/2a2a7c00b74028b758006219781cbbd22909be85) [#4185](https://github.com/keystonejs/keystone/pull/4185) Thanks [@JedWatson](https://github.com/JedWatson)! - Fixed field defaultValue types for new fields package

## 2.0.0

### Major Changes

- [`ae0fc4d78`](https://github.com/keystonejs/keystone/commit/ae0fc4d787ba47eb9e5258a20a57f76124aee797) [#4132](https://github.com/keystonejs/keystone/pull/4132) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add CardValue export from field views

### Patch Changes

- [`166acb9bf`](https://github.com/keystonejs/keystone/commit/166acb9bf211e0ee8a90d4740f6ebc54ffe72dec) [#4138](https://github.com/keystonejs/keystone/pull/4138) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Allow field view React components to return null

## 1.0.0

### Major Changes

- [`9d360a67b`](https://github.com/keystonejs/keystone/commit/9d360a67b69ec38e3018fe132b1e34f24956f86c) [#4106](https://github.com/keystonejs/keystone/pull/4106) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release
