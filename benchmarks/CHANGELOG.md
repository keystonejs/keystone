# @keystone/benchmarks

## 5.0.0

### Major Changes

- [`c7ba40ec`](https://github.com/keystonejs/keystone-5/commit/c7ba40ec98116603c6b7a501d2442e16170ec6be) [#1813](https://github.com/keystonejs/keystone-5/pull/1813) Thanks [@jesstelford](https://github.com/jesstelford)! - - This is the first release of `@keystone/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystone` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystone/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`c7ba40ec`](https://github.com/keystonejs/keystone-5/commit/c7ba40ec98116603c6b7a501d2442e16170ec6be)]:
  - @keystone/adapter-knex@5.0.0
  - @keystone/adapter-mongoose@5.0.0
  - @keystone/app-graphql@5.0.0
  - @keystone/fields@5.0.0
  - @keystone/keystone@5.0.0
  - @keystone/session@5.0.0
  - @keystone/test-utils@5.0.0

# @keystone-alpha/benchmarks

## 1.0.1

### Patch Changes

- Updated dependencies [[`0a36b0f4`](https://github.com/keystonejs/keystone-5/commit/0a36b0f403da73a76106b5e14940a789466b4f94), [`7129c887`](https://github.com/keystonejs/keystone-5/commit/7129c8878a825d961f2772be497dcd5bd6b2b697), [`3bc02545`](https://github.com/keystonejs/keystone-5/commit/3bc025452fb8e6e69790bdbee032ddfdeeb7dabb), [`768420f5`](https://github.com/keystonejs/keystone-5/commit/768420f567c244d57a4e2a3aaafe628ea9813d9d), [`a48281ba`](https://github.com/keystonejs/keystone-5/commit/a48281ba605bf5bebc89fcbb36d3e69c17182eec), [`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/keystone@16.1.0
  - @keystone-alpha/app-graphql@8.2.1
  - @keystone-alpha/adapter-knex@6.0.2
  - @keystone-alpha/adapter-mongoose@6.0.1
  - @keystone-alpha/fields@15.0.0

## 1.0.0

### Major Changes

- [`b62595f4`](https://github.com/keystonejs/keystone-5/commit/b62595f43cd3b5e19fa33330fafa7ad238cd105b) [#1772](https://github.com/keystonejs/keystone-5/pull/1772) Thanks [@timleslie](https://github.com/timleslie)! - Initial release of the `benchmarks` package. Run `yarn benchmark` to execute benchmark scripts.

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/adapter-knex@6.0.0
  - @keystone-alpha/adapter-mongoose@6.0.0
  - @keystone-alpha/fields@14.0.0
  - @keystone-alpha/keystone@16.0.0
  - @keystone-alpha/test-utils@2.6.3
