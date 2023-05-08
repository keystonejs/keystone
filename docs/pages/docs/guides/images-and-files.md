---
title: "Images and Files"
description: "Learn how to add Images and Files to your project using Keystone’s Storage configuration"
---

Keystone [fields](../fields/overview) include the `image` and `file` types. You can use them to reference and (if required) serve images and/or files from Keystone. This guide will show you how to configure images and files in your Keystone system so you can store assets either locally or using [Amazon S3 storage](https://aws.amazon.com/s3/) or compatible S3 providers such as DigitalOcean Spaces (https://www.digitalocean.com/products/spaces).

## How asset storage works in Keystone

Keystone manages file and image assets through a `storage` object you define in Keystone’s [configuration file](/docs/config/config). Any number of stores can be set up within the `storage` object, and you can mix and match between `local` and `s3` compatible providers.

The `storage` object defines how and where the assets are stored and accessed by both Keystone and the client frontend. This object defines:

- The `kind` of storage being used – `s3` or `local`
- The `type` of `field` the storage is being used for – `file` or `image`
- A function to generate the URL (`generateUrl`) Keystone returns in the GraphQL API – pointing to the location or the storage where the assets can be accessed
- The actual location where Keystone stores the assets – either a local `path` or the details of an `s3` bucket
- The location Keystone will serve the assets from – either a `serverRoute` for `local` or a `proxied` connection for `s3`. Both of these options add a route to the Keystone backend which the files can be accessed from

## Defining `storage` in Keystone config

First, we are going to use [dotenv](https://www.npmjs.com/package/dotenv) to retrieve the S3 bucket and URL details from a `.env` file or set environment variables.

Before your configuration file, you can map your environment variables to some easy to use names:

```typescript{24-54}
import { config } from '@keystone-6/core';
import dotenv from 'dotenv';
import { lists } from './schema';

dotenv.config();

const {
  S3_BUCKET_NAME: bucketName = 'keystone-test',
  S3_REGION: region = 'ap-southeast-2',
  S3_ACCESS_KEY_ID: accessKeyId = 'keystone',
  S3_SECRET_ACCESS_KEY: secretAccessKey = 'keystone',
  ASSET_BASE_URL: baseUrl = 'http://localhost:3000',
} = process.env;
/** ... */
```

### Storing assets in `s3`

We can then add an `s3` `storage` object, the object below is called `my_s3_files` and this is the name that we will use in our `field` config later.
The name is not important, and can be adjusted to any name that makes sense for you.

Within the [config](../config/config) object in your `keystone.ts` file, add the following configuration:
```typescript
storage: {
  my_s3_files: {
    kind: 's3', // this storage uses S3
    type: 'file', // only for files
    bucketName, // from your S3_BUCKET_NAME environment variable
    region, // from your S3_REGION environment variable
    accessKeyId, // from your S3_ACCESS_KEY_ID environment variable
    secretAccessKey, // from your S3_SECRET_ACCESS_KEY environment variable
    signed: { expiry: 3600 }, // (optional) links will be signed with an expiry of 3600 seconds (an hour) 
  },
  // ...
},
```


If you are using an S3 compatible provider, such as DigitalOcean Spaces, you need to additionally provide an `endpoint`:
```typescript
storage: {
  my_s3_files: {
    // ...
    endpoint: 'https://ap-southeast-2-region.digitaloceanspaces.com' // or et cetera,
  },
  // ...
},
```

### Storing assets in `local`

Assets can also be stored on the `local` disk. The object below is called `my_local_images` and is stored in `/public/images` and will be served by Keystone at `/images`.

```typescript
/** config */
storage: {
  my_local_images: {
    // Images that use this store will be stored on the local machine
    kind: 'local',
    // This store is used for the image field type
    type: 'image',
    // The URL that is returned in the Keystone GraphQL API
    generateUrl: path => `${baseUrl}/images${path}`,
    // The route that will be created in Keystone's backend to serve the images
    serverRoute: {
      path: '/images',
    },
    // Set serverRoute to null if you don't want a route to be created in Keystone
    // serverRoute: null
    storagePath: 'public/images',
  },
  /** more storage */
}
```

### Customise the URL returned in GraphQL

When using an `image` or `file` field type Keystone returns the following in your GraphQL API query:

```
image {
  id
  filesize
  width
  height
  extension
  ref
  url
}
```

The URL returned in this query is configurable by using the `generateUrl` function. This function takes the `path` which is the full filename and extension and will return the URL you want in the GraphQL API.

### Putting it all together

The example below defines two asset stores – one `s3` to store files, and one `local` to store images.

```typescript{28-59}
// keystone.ts

import { config } from '@keystone-6/core';
import dotenv from 'dotenv';
import { lists } from './schema';

// We are going to use dotenv to get our variables from a .env file or from set environment variables
dotenv.config();

 const {
   // The S3 Bucket Name used to store assets
   S3_BUCKET_NAME: bucketName = 'keystone-test',
   // The region of the S3 bucket
   S3_REGION: region = 'ap-southeast-2',
   // The Access Key ID and Secret that has read/write access to the S3 bucket
   S3_ACCESS_KEY_ID: accessKeyId = 'keystone',
   S3_SECRET_ACCESS_KEY: secretAccessKey = 'keystone',
   // The base URL to serve assets from
   ASSET_BASE_URL: baseUrl = 'http://localhost:3000',
 } = process.env;

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
  storage: {
    // The key here will be what is referenced in the image field
    my_local_images: {
      // Images that use this store will be stored on the local machine
      kind: 'local',
      // This store is used for the image field type
      type: 'image',
      // The URL that is returned in the Keystone GraphQL API
      generateUrl: path => `${baseUrl}/images${path}`,
      // The route that will be created in Keystone's backend to serve the images
      serverRoute: {
        path: '/images',
      },
      storagePath: 'public/images',
    },
    // The key here will be what is referenced in the file field
    my_s3_files: {
      // Files that use this store will be stored in an s3 bucket
      kind: 's3',
      // This store is used for the file field type
      type: 'file',
      // The S3 bucket name pulled from the S3_BUCKET_NAME environment variable above
      bucketName,
      // The S3 bucket region pulled from the S3_REGION environment variable above
      region,
      // The S3 Access Key ID pulled from the S3_ACCESS_KEY_ID environment variable above
      accessKeyId,
      // The S3 Secret pulled from the S3_SECRET_ACCESS_KEY environment variable above
      secretAccessKey,
      // The S3 links will be signed so they remain private
      signed: { expiry: 5000 },
    },
  },
});
```

{% hint kind="tip" %}
You can define as many stores as required for your use case
{% /hint %}

## Using Images and Files in Lists

Once you have your `storage` configuration in Keystone you can then use the `image` and `file` [field types](../fields/overview).

Within an existing [list](../config/lists) use the `image` of `file` field as follows:

```typescript
lists: {
  user: list({
    fields: {
      /** other fields */
      avatar: image({ storage: 'my_local_images' }),
      someFile: file({ storage: 'my_s3_files' }),
    }
  })
}
```

{% hint kind="tip" %}
The `storage` name here relates to the `storage` defined in your `keystone.ts`
{% /hint %}

## Relationships example

If you want your images (and files) to be reused and accessible across multiple difference lists or in a [Document Field](./document-fields). You can set up a Gallery list and use relationships to reference this.
You might also want to preserve an asset after 'deletion', with relationships you can instead remove the relationship and cleanup the assets separately.

For example you might have a schema that looks like this:

```typescript
// schema.ts
import { list } from '@keystone-6/core';
import { text, image } from '@keystone-6/core/fields';

export const lists = {
  Image: list({
    fields: {
      name: text({
        validation: {
          isRequired: true,
        },
      }),
      altText: text(),
      image: image({ storage: 'my_local_images' }),
    }
  }),
  Page: list({
    fields: {
      name: text(),
      context: text(),
      images: relationship({ ref: 'Image', many: true })
    }
  })
};
```

## How Content-Type differs between Images & Files

- When serving **files**, Keystone uses `application/octetstream` for the `Content-Type`.
- When serving **images** the `Content-Type` is set from the mime-type configured by the file extension.

This means that for images the extension can be trusted, but for files, it can not. This applies to both `local` and `S3` options.

## Related Resources

{% related-content %}
{% well  heading="Config API Reference" href="/docs/config/config" %}
The complete reference for the base keystone configuration
{% /well %}
{% well  heading="Fields API Reference" href="/docs/fields/overview" %}
The complete reference for Field configuration
{% /well %}
{% well  heading="Relationship Guide" href="/docs/fields/relationship" %}
Learn how to reason about and configure relationships in Keystone so you can bring value to your project through structured content.
{% /well %}
{% well  heading="Example Project: S3 Assets" href="https://github.com/keystonejs/keystone/tree/main/examples/assets-s3" %}
A full keystone project illustrating how to configure `storage` using `kind: 's3'` and then uses both an `image` and `file` field types within a list.
{% /well %}
{% well  heading="Example Project: Local Assets" href="https://github.com/keystonejs/keystone/tree/main/examples/assets-local" %}
A full keystone project illustrating how to configure `storage` using `kind: 'local'` and then uses both an `image` and `file` field types within a list.
{% /well %}
{% /related-content %}
