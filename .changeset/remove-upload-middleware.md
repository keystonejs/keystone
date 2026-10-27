---
"@keystone-6/core": major
---

Removes automatic multipart upload middleware and the `server.maxFileSize` option.

Applications using image, file, or Cloudinary fields must install `graphql-upload` and register its middleware in `server.extendExpressApp`:

```ts
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'

// In your Keystone config:
server: {
  extendExpressApp(app) {
    app.use(graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 10 }))
  },
}
```