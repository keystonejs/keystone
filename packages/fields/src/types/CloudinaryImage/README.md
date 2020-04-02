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
