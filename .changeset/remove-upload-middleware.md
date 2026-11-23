---
"@keystone-6/core": major
---

Removes automatic multipart upload middleware and the `server.maxFileSize` option.

Applications using image, file, or Cloudinary fields must install `graphql-upload@17.1` and register its middleware on the GraphQL endpoint in `server.extendExpressApp`. If you set `graphql.path`, use that same path for the middleware.

```ts
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs'

// In your Keystone config:
server: {
  extendExpressApp(app) {
    app.use('/api/graphql', graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 10 }))
  },
}
```
