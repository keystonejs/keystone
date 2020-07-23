---
'@keystonejs/fields': patch
'@keystonejs/oembed-adapters': patch
---

Moved `@keystonejs/fields-cloudinary-image`, `@keystonejs/fields-unsplash` and `@keystonejs/fields-oembed`  out of the core fields package `@keystonejs/fields`.

```js
const { CloudinaryImage, Unsplash, OEmbed } = require('@keystonejs/fields');
```

Changes to:

```js
const { CloudinaryImage, Unsplash, OEmbed } = require('@keystonejs/fields-cloudinary-image');
const { Unsplash } = require('@keystonejs/fields-unsplash');
const { OEmbed } = require('@keystonejs/fields-oembed');
```

---

The `IframelyOEmbedAdapter` can now also be imported from `@keystonejs/fields-oembed`.

```js
const { OEmbed } = require('@keystonejs/fields-oembed');
const { IframelyOEmbedAdapter } = require('@keystonejs/oembed-adapters');
```

Changed to:

```js
const { OEmbed, IframelyOEmbedAdapter } = require('@keystonejs/fields-oembed');
```

Existing import methods remain working but in future may be deprecated.