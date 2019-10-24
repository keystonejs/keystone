# @keystonejs/oembed-adapters

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/build-field-types@5.0.0

# @keystone-alpha/oembed-adapters

## 1.1.2

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade emotion to 10.0.14

## 1.1.1

### Patch Changes

- [73976672](https://github.com/keystonejs/keystone-5/commit/73976672):

  Build package with @keystone-alpha/build-field-types so it works when published

## 1.1.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Add oEmbed Content Block with adapter-specific renderers.

## 1.0.0

### Major Changes

- [5c28c142](https://github.com/keystonejs/keystone-5/commit/5c28c142):

  - Add IFramely OEmbed adapter:

    ```javascript
    const { Keystone } = require('@keystone-alpha/keystone');
    const { OEmbed } = require('@keystone-alpha/fields');
    const { IframelyOEmbedAdapter } = require('@keystone-alpha/oembed-adapters');

    const keystone = new Keystone(/* ... */);

    const iframelyAdapter = new IframelyOEmbedAdapter({
      apiKey: '...', // Get one from https://iframely.com
    });

    keystone.createList('User', {
      fields: {
        portfolio: {
          type: OEmbed,
          adapter: iframelyAdapter,
        },
      },
    });
    ```
