# @keystone-alpha/oembed-adapters

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
