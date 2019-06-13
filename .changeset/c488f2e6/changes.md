- Add `OEmbed` field
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
      }
    }
  });
  ```
