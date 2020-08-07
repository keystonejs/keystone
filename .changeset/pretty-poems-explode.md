---
'@keystonejs/fields': major
---

Moved `@keystonejs/fields-cloudinary-image`, `@keystonejs/fields-unsplash` and `@keystonejs/fields-oembed` out of the core fields package `@keystonejs/fields`.

```js
const { CloudinaryImage, Unsplash, OEmbed } = require('@keystonejs/fields');
```

Needs to be changed to:

```js
const { CloudinaryImage } = require('@keystonejs/fields-cloudinary-image');
const { Unsplash } = require('@keystonejs/fields-unsplash');
const { OEmbed } = require('@keystonejs/fields-oembed');
```

---
