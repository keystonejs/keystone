<!--[meta]
section: api
subSection: field-types
title: CloudinaryImage
[meta]-->

# CloudinaryImage

The `CloudinaryImage` field extends the [`File`](/packages/fields/src/types/File/README.md) field and allows uploading images to Cloudinary. It also exposes additional GraphQL functionality for querying your uploaded images.

## Usage

This field must be used with the [`CoundinaryAdapter`](/packages/file-adapters/README.md#cloudinaryfileadapter) file adapter:

```js title=index.js
const { Keystone } = require('@keystonejs/keystone');
const { CloudinaryAdapter } = require('@keystonejs/file-adapters');
const { CloudinaryImage } = require('@keystonejs/fields-cloudinary-image');

const keystone = new Keystone({...});

const fileAdapter = new CloudinaryAdapter({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
  folder: 'my-keystone-app',
});

keystone.createList('Image', {
  fields: {
    image: { type: CloudinaryImage, adapter: fileAdapter },
  },
});
```

## Config

Since this field extends the `File` field, it accepts all the same config options.

## GraphQL

Will add the following to the GraphQL schema:

```graphql
"""
Mirrors the formatting options [Cloudinary provides](https://cloudinary.com/documentation/image_transformation_reference).
All options are strings as they ultimately end up in a URL.
"""
input CloudinaryImageFormat {
  """
  Rewrites the filename to be this pretty string. Do not include \`/\` or \`.\`
  """
  prettyName: String
  width: String
  height: String
  crop: String
  aspect_ratio: String
  gravity: String
  zoom: String
  x: String
  y: String
  format: String
  fetch_format: String
  quality: String
  radius: String
  angle: String
  effect: String
  opacity: String
  border: String
  background: String
  overlay: String
  underlay: String
  default_image: String
  delay: String
  color: String
  color_space: String
  dpr: String
  page: String
  density: String
  flags: String
  transformation: String
}

type CloudinaryImage_File {
  id: ID
  path: String
  filename: String
  originalFilename: String
  mimetype: String
  encoding: String
  publicUrl: String
  publicUrlTransformed(transformation: CloudinaryImageFormat): String
}
```

`CloudinaryImage` fields will have type `CloudinaryImage_File` in the schema. For example, to query an entry in our `Image` list, one could do:

```graphql
query getFirstCloudinaryImage {
  allImages(first: 1) {
    image {
      filename
      publicUrlTransformed(transformation: { width: "120", crop: "limit" })
    }
  }
}
```

## Cloudinary image block

The `CloudinaryImage` field also exposes a block that can be used in the [Content](/packages/fields-content/README.md) field.

### Usage

```js title=index.js
const { Content } = require('@keystonejs/fields-content');

keystone.createList('Post', {
  fields: {
    body: {
      type: Content,
      blocks: [Content.blocks.heading, [CloudinaryImage.blocks.image, { adapter }]],
    },
  },
});
```
