# @keystone-6/fields-media-multipart

Image and file fields for Keystone with GraphQL multipart uploads.

```ts
import { file, image } from '@keystone-6/fields-media-multipart'
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs'

// In your Keystone config:
const server = {
  extendExpressApp(app) {
    app.use('/api/graphql', graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 10 }))
  },
}
```

Both fields require a `storage` strategy with `put`, `delete`, and `url` functions.
Install `graphql-upload@17.1` and register its middleware on the GraphQL endpoint before the GraphQL handler.
If you set `graphql.path`, use that same path for the middleware.

See the [images and files guide](https://keystonejs.com/docs/guides/images-and-files) for storage examples.
