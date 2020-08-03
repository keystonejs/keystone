# @keystonejs/server-side-graphql-client

## 1.0.0

### Major Changes

- [`24af20b38`](https://github.com/keystonejs/keystone/commit/24af20b38ab89a452edc7a060c9bc936cda55a4a) [#3300](https://github.com/keystonejs/keystone/pull/3300) Thanks [@MadeByMike](https://github.com/MadeByMike)! - This is the initial release of `@keystonejs/server-side-graphql-client,` a library for running server-side graphQL queries and mutations in Keystone.

  It is intended to replace the `keystone.createItems` method with a set of utility functions to generate and execute graphQL queries.

  Note: In a future change we will remove the `keystone.createItems` method. You will need to update code that used `createItems`.

  If you have examples like:

  ```
  keystone.createItems({
    User: [{ name: 'Ticiana' }, { name: 'Lauren' }],
  });
  ```

  You will need to change this to:

  ```
  const { createItems } = require('@keystonejs/server-side-graphql-client');

  createItems({
    keystone,
    listKey: 'User',
    items: [{ data: { name: 'Ticiana' } }, {data:  { name: 'Lauren' } }]
  })
  ```

### Patch Changes

- [`acaf19cd9`](https://github.com/keystonejs/keystone/commit/acaf19cd9679861234e67f9e130aea83d052f01e) [#3301](https://github.com/keystonejs/keystone/pull/3301) Thanks [@MadeByMike](https://github.com/MadeByMike)! - No functional changes. Update all internal usages of `keystone.createItems` to the new `createItems` function.

* [`2e10b1083`](https://github.com/keystonejs/keystone/commit/2e10b1083c0ab3925b877f16543c3d302f618313) [#3309](https://github.com/keystonejs/keystone/pull/3309) Thanks [@timleslie](https://github.com/timleslie)! - Simplified tests using the updated `test-utils` API.

* Updated dependencies [[`af5171563`](https://github.com/keystonejs/keystone/commit/af51715637433bcdd2538835c98ac71a8eb86122), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2), [`7da9d67d7`](https://github.com/keystonejs/keystone/commit/7da9d67d7d481c44a81406c6b34540a3f0a8340d), [`086b6baec`](https://github.com/keystonejs/keystone/commit/086b6baecdb8730bd7ae7001a96ae881fb13bac2), [`5332988e3`](https://github.com/keystonejs/keystone/commit/5332988e3fafe6a3594f7dcecd79a9402df28015), [`c3883e01c`](https://github.com/keystonejs/keystone/commit/c3883e01c01b83cf5938de9bebf2dd68f4861364), [`fd2b8d1cf`](https://github.com/keystonejs/keystone/commit/fd2b8d1cf0b23b177951d65006a0d0faf666a5d6), [`2e10b1083`](https://github.com/keystonejs/keystone/commit/2e10b1083c0ab3925b877f16543c3d302f618313)]:
  - @keystonejs/fields@15.0.0
  - @keystonejs/test-utils@7.1.1
