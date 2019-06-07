<!--[meta]
section: packages
title: OEmbed Adapters
[meta]-->

# OEmbed Adapters

The `OEmbed` field type (from `@keystone-alpha/fields`) can fetch oEmbed data
from a number of providers such as [Iframely](https://iframely.com) and
[Embedly](https://embed.ly/).

This package contains adapters for different providers.

## `IframelyOEmbedAdapter`

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

NOTE: The request to Iframely will include the following [parameters](https://iframely.com/docs/parameters):

- `iframe=1`
- `omit_script=1`

## `EmbedlyOEmbedAdapter`

```javascript
const { Keystone } = require('@keystone-alpha/keystone');
const { OEmbed } = require('@keystone-alpha/fields');
const { EmbedlyOEmbedAdapter } = require('@keystone-alpha/oembed-adapters');

const keystone = new Keystone(/* ... */);

const embedlyAdapter = new EmbedlyOEmbedAdapter({
  apiKey: '...', // Get one from https://iframely.com
});

keystone.createList('User', {
  fields: {
    portfolio: {
      type: OEmbed,
      adapter: embedlyAdapter,
    }
  }
});
```
