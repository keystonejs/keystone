# @keystone-next/example-blog

## 2.0.2

### Patch Changes

- Updated dependencies [[`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`7eabb4dee`](https://github.com/keystonejs/keystone/commit/7eabb4dee2552f7baf1e0024d82011b179d418d4), [`5227234a0`](https://github.com/keystonejs/keystone/commit/5227234a08edd99cd2795c8d888fbb3022810f54), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`e4c19f808`](https://github.com/keystonejs/keystone/commit/e4c19f8086cc14f7f4a8ef390f1f4e1263004d40), [`4995c682d`](https://github.com/keystonejs/keystone/commit/4995c682dbdcfac2100de9fab98ba1e0e08cbcc2), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`881c9ffb7`](https://github.com/keystonejs/keystone/commit/881c9ffb7c5941e9fb214ed955148d8ea567e65f), [`ef14e77ce`](https://github.com/keystonejs/keystone/commit/ef14e77cebc9420db8c7d29dfe61f02140f4a705), [`df7d7b6f6`](https://github.com/keystonejs/keystone/commit/df7d7b6f6f2830573393560f4a1ec35234889947), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`84a5e7f3b`](https://github.com/keystonejs/keystone/commit/84a5e7f3bc3a29ff31d642831e7aaadfc8534ba1), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7), [`97fd5e05d`](https://github.com/keystonejs/keystone/commit/97fd5e05d8681bae86001e6b7e8e3f36ebd639b7), [`a3b07ea16`](https://github.com/keystonejs/keystone/commit/a3b07ea16ffc0f6741c0c0e5e281622a1831e0e7)]:
  - @keystone-next/keystone@20.0.0
  - @keystone-next/fields@11.0.0

## 2.0.1

### Patch Changes

- [#5797](https://github.com/keystonejs/keystone/pull/5797) [`a6a444acd`](https://github.com/keystonejs/keystone/commit/a6a444acd23f2590d9812872441cafb5d088c48e) Thanks [@timleslie](https://github.com/timleslie)! - The GraphQL field `_all<path>Meta { count }` generated for `many` relationships has been deprecated in favour of a new field `<path>Count`, which directly returns the count.

  A `posts` relationship field would have the following field added to the API:

  ```graphql
  postsCount(where: PostWhereInput! = {}): Int
  ```

* [#5792](https://github.com/keystonejs/keystone/pull/5792) [`319c19bd5`](https://github.com/keystonejs/keystone/commit/319c19bd5f8e8c261a1aefb1997d66b2a136ae28) Thanks [@timleslie](https://github.com/timleslie)! - Changed the type of the `where` argument to `allItems` to `_allItemsMeta` from type `ItemWhereInput` to `ItemWhereInput! = {}`.

- [#5850](https://github.com/keystonejs/keystone/pull/5850) [`5b02e8625`](https://github.com/keystonejs/keystone/commit/5b02e8625e18c8e79547d5caf8cacb5014ffee9d) Thanks [@timleslie](https://github.com/timleslie)! - The `AND` and `OR` operators of `ItemWhereInput` now accept non-null values, e.g. `[ItemWhereInput!]`, rather than `[ItemWhereInput]`.

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

* Updated dependencies [[`0eadba2ba`](https://github.com/keystonejs/keystone/commit/0eadba2badb13fc6a17f7e525d429494ca953481), [`f52079f0b`](https://github.com/keystonejs/keystone/commit/f52079f0bffc4cf2ab5e26e4c3654127b59d6078), [`b9c828fb0`](https://github.com/keystonejs/keystone/commit/b9c828fb0d6e587976dbd0dc4e87004bce3b2ef7), [`74bc77854`](https://github.com/keystonejs/keystone/commit/74bc778547623fe4ed3db97ed09384d9dc076372), [`a6a444acd`](https://github.com/keystonejs/keystone/commit/a6a444acd23f2590d9812872441cafb5d088c48e), [`29075e580`](https://github.com/keystonejs/keystone/commit/29075e58074672d90cfca84aba8dcedeecf243ca), [`59421c039`](https://github.com/keystonejs/keystone/commit/59421c0399368e56e46537c1c687daa27f5912d0), [`319c19bd5`](https://github.com/keystonejs/keystone/commit/319c19bd5f8e8c261a1aefb1997d66b2a136ae28), [`c6cd0a6bd`](https://github.com/keystonejs/keystone/commit/c6cd0a6bdc7ccb000c39fba0da31819e33d9e056), [`195d4fb12`](https://github.com/keystonejs/keystone/commit/195d4fb1218517d7b9a40d3bba1a087d40e6d1d6), [`1fe4753f3`](https://github.com/keystonejs/keystone/commit/1fe4753f3af28aa851e1f90d55937c940be5af1a), [`5b02e8625`](https://github.com/keystonejs/keystone/commit/5b02e8625e18c8e79547d5caf8cacb5014ffee9d), [`76cdb791b`](https://github.com/keystonejs/keystone/commit/76cdb791b1ab36d015e43b87deff52be2ea6b629), [`762f17823`](https://github.com/keystonejs/keystone/commit/762f1782334c9b7174c320182c753c215834ff7f), [`0617c81ea`](https://github.com/keystonejs/keystone/commit/0617c81eacc88e40bdd21bacab285d674b171a4a), [`02af04c03`](https://github.com/keystonejs/keystone/commit/02af04c03c96c26c273cd49eda5b4a132e02a26a), [`107eeb037`](https://github.com/keystonejs/keystone/commit/107eeb0374e214b69be3727ca955a9f76e1468bb), [`9de71a9fb`](https://github.com/keystonejs/keystone/commit/9de71a9fb0d3b7f5f05c0d908bebdb818723fd4b), [`08478b8a7`](https://github.com/keystonejs/keystone/commit/08478b8a7bb9fe5932c7f74f9f6d3af75a0a5394), [`7bda87ea7`](https://github.com/keystonejs/keystone/commit/7bda87ea7f11e0faceccc6ab3f715c72b07c129b), [`590bb1fe9`](https://github.com/keystonejs/keystone/commit/590bb1fe9254c2f8feff7e3a0e2e964610116f95), [`4b11c5ea8`](https://github.com/keystonejs/keystone/commit/4b11c5ea87b759c24bdbff9d18443bbc972757c0), [`38a177d61`](https://github.com/keystonejs/keystone/commit/38a177d6140874b29d3c09b5852dbfd787d5c429), [`bb4f4ac91`](https://github.com/keystonejs/keystone/commit/bb4f4ac91c3ed70393774f744075971453a12aba), [`19a756496`](https://github.com/keystonejs/keystone/commit/19a7564964d9dcdc94ecdda9c0a0e92c539eb309)]:
  - @keystone-next/keystone@19.0.0
  - @keystone-next/fields@10.0.0

## 2.0.0

### Major Changes

- [#5746](https://github.com/keystonejs/keystone/pull/5746) [`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d) Thanks [@timleslie](https://github.com/timleslie)! - Update Node.js dependency to `^12.20 || >= 14.13`.

### Patch Changes

- Updated dependencies [[`19750d2dc`](https://github.com/keystonejs/keystone/commit/19750d2dc5801cc8d2ffae1f50d1d5ca6ab9407d), [`016ccad82`](https://github.com/keystonejs/keystone/commit/016ccad82ed73898a64310506117c1cbae60a512), [`8da79e71a`](https://github.com/keystonejs/keystone/commit/8da79e71abb005eb755620fb3c8f82a3a2952152), [`e2232a553`](https://github.com/keystonejs/keystone/commit/e2232a5537620bd82983ba3f5cff124cec8facab)]:
  - @keystone-next/fields@9.0.0
  - @keystone-next/keystone@18.0.0

## 1.0.0

### Major Changes

- [#5621](https://github.com/keystonejs/keystone/pull/5621) [`e69bcc254`](https://github.com/keystonejs/keystone/commit/e69bcc254303a24ecb33473f73fe350d49b0bec2) Thanks [@gwyneplaine](https://github.com/gwyneplaine)! - Initial version of the blog example.

### Patch Changes

- Updated dependencies [[`79a0844b9`](https://github.com/keystonejs/keystone/commit/79a0844b9d5125891e3eaad4dc3999b232cefaa2), [`11814ce98`](https://github.com/keystonejs/keystone/commit/11814ce9865bc14ffdf5ca2a09b7221001539857), [`85dfdfb1e`](https://github.com/keystonejs/keystone/commit/85dfdfb1ea236bb1515ac6df43f974b30d0bf89a), [`400d88257`](https://github.com/keystonejs/keystone/commit/400d88257a3383595cf76c9399848b356dd51a11), [`bb8920843`](https://github.com/keystonejs/keystone/commit/bb8920843a1e0d803b8238bd17e9d65802698685)]:
  - @keystone-next/fields@8.2.0
  - @keystone-next/keystone@17.1.1
