---
title: "Images and Files"
description: "Learn how to add Images and Files to your project using Keystone’s Storage configuration"
---

Keystone [fields](../fields/overview) include the `image` and `file` types.
You can use them to manage images and/or files from within Keystone.
This guide will show you how to configure images and files in your Keystone schema backed with [Amazon S3 Storage](https://aws.amazon.com/s3/), and thereby guide you on how you could setup a similar setup with a different storage provider.

## Storage with Amazon S3

Image and file fields accept a `storage` object that can define the functions for how assets will be uploaded, deleted and linked when interacting with Keystone's GraphQL API.
This example shows an example of how you could store public images in a public S3 bucket, and private files in a private S3 bucket.

```typescript
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, image, file } from '@keystone-6/core/fields'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3, GetObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

const s3 = new S3({ /* configure the s3 client however you would like */ })

const publicBucketName = 'my-public-bucket'
const privateBucketName = 'my-private-bucket'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      banner: image({
        storage: {
          async put(key, stream, meta) {
            const upload = new Upload({
              client: s3,
              params: { Bucket: publicBucketName, Key: key, Body: stream, ContentType: meta.contentType },
            })
            await upload.done()
          },
          async delete(key) {
            await s3.deleteObject({ Bucket: publicBucketName, Key: key })
          },
          url(key) {
            return `https://${publicBucketName}.s3.amazonaws.com/${key}`
          },
        },
      }),
      attachment: file({
        storage: {
          async put(key, stream, meta) {
            const upload = new Upload({
              client: s3,
              params: {
                Bucket: privateBucketName,
                Key: key,
                Body: stream,
                ContentType: meta.contentType,
              },
            })
            await upload.done()
          },
          async delete(key) {
            await s3.deleteObject({ Bucket: privateBucketName, Key: key })
          },
          url(key) {
            return getSignedUrl(s3, new GetObjectCommand({ Bucket: privateBucketName, Key: key }))
          },
        },
      }),
    },
  }),
}
```

## How Content-Type differs between Images & Files

- For **files**, Keystone always provides `meta.contentType as `application/octet-stream`.
- For **images**, the `Content-Type` is set based on the image format that Keystone detects from the bytes of the image.

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
A full keystone project illustrating how to configure `storage` with S3.
{% /well %}
{% well  heading="Example Project: Local Assets" href="https://github.com/keystonejs/keystone/tree/main/examples/assets-local" %}
A full keystone project illustrating how to configure `storage` using the local file system.
{% /well %}
{% /related-content %}
