<!--[meta]
section: api
subSection: field-types
title: CloudinaryImage
[meta]-->

# CloudinaryImage

Upload an image to Cloudinary.

## Usage

Import the field from the `@keystonejs/file-adapters` package and configure it:

```js
const { CloudinaryAdapter } = require('@keystonejs/file-adapters');

const cloudinaryAdapter = new CloudinaryAdapter({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
  folder: 'my-keystone-app',
});
```

Then when creating your list, use the field as so:

```js
const { CloudinaryImage } = require('@keystonejs/fields');

keystone.createList('Item', {
  fields: {
    image: { type: CloudinaryImage, adapter: cloudinaryAdapter },
  },
});
```

## Cloudinary image block

The `CloudinaryImage` field also exposes a block that can be used in the [content field](/packages/field-content/README.md).

### Usage

```js
const { Keystone } = require('@keystonejs/keystone');
const { Content } = require('@keystonejs/field-content');
const { CloudinaryAdapter } = require('@keystonejs/file-adapters');
const { CloudinaryImage } = require('@keystonejs/fields');

const cloudinaryAdapter = new CloudinaryAdapter({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
  folder: 'my-keystone-app',
});

keystone.createList('Post', {
  fields: {
    body: {
      type: Content,
      blocks: [
        Content.blocks.heading,
        [CloudinaryImage.blocks.image, { adapter: cloudinaryAdapter }],
      ],
    },
  },
});
```
