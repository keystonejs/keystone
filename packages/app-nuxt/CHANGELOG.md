# @keystonejs/app-nuxt

## 5.1.1

### Patch Changes

- [`d495f17b`](https://github.com/keystonejs/keystone/commit/d495f17b08706ee2bf297e4196248cbde25fd24f) [#2416](https://github.com/keystonejs/keystone/pull/2416) Thanks [@Vultraz](https://github.com/Vultraz)! - Upgraded Nuxt dependency to 2.11.0.

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/app-nuxt

## 1.0.0

### Major Changes

- [4b3bb060](https://github.com/keystonejs/keystone-5/commit/4b3bb060): Adding new "app-nuxt" package in @keystone-alpha
