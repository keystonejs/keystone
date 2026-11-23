---
title: "Cloudinary Image"
description: "A reference of Keystone's cloudinaryImage field type, configuration and options."
---

Upload images to your Cloudinary account via Keystone's Admin UI.
Install `graphql-upload@17.1` and register its middleware on your GraphQL endpoint as shown below. If you set `graphql.path`, use that same path for the middleware.

- `cloudinary`: Configuration for the connected Cloudinary account.
  - `cloudName` - TODO
  - `apiKey` - TODO
  - `apiSecret` - TODO
  - `folder` - TODO

```typescript
import { config, list } from '@keystone-6/core';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { cloudinaryImage } from '@keystone-6/cloudinary';

export default config({
  server: {
    extendExpressApp(app) {
      app.use('/api/graphql', graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 10 }));
    },
  },
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: cloudinaryImage({
          cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET,
            folder: process.env.CLOUDINARY_API_FOLDER,
          },
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```
