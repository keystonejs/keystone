---
'@keystonejs/oembed-adapters': major
---


The `IframelyOEmbedAdapter` should now be imported from `@keystonejs/fields-oembed`.

```js
const { OEmbed } = require('@keystonejs/fields-oembed');
const { IframelyOEmbedAdapter } = require('@keystonejs/oembed-adapters');
```

Should be changed to:

```js
const { OEmbed, IframelyOEmbedAdapter } = require('@keystonejs/fields-oembed');
```

