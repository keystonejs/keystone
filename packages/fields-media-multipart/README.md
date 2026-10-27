# @keystone-6/fields-media-multipart

Image and file fields for Keystone with GraphQL multipart uploads.

```ts
import { file, image } from '@keystone-6/fields-media-multipart'
// @ts-expect-error graphql-upload does not provide TypeScript declarations
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'

// In your Keystone config:
const server = {
  extendExpressApp(app) {
    app.use(graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 10 }))
  },
}
```

Both fields require a `storage` strategy with `put`, `delete`, and `url` functions.
Install `graphql-upload` and register its middleware before the GraphQL handler.

See the [images and files guide](https://keystonejs.com/docs/guides/images-and-files) for storage examples.
