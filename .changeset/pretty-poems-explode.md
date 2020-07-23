---
'@keystonejs/fields': major
'@keystonejs/oembed-adapters': major
---

Moved `@keystonejs/fields-cloudinary-image`, `@keystonejs/fields-unsplash` and `@keystonejs/fields-oembed` out of the core fields package `@keystonejs/fields`.

```js
const { CloudinaryImage, Unsplash, OEmbed } = require('@keystonejs/fields');
```

Needs to be changed to:

```js
const { CloudinaryImage, Unsplash, OEmbed } = require('@keystonejs/fields-cloudinary-image');
const { Unsplash } = require('@keystonejs/fields-unsplash');
const { OEmbed } = require('@keystonejs/fields-oembed');
```

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
