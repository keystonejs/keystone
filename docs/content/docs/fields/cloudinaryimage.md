---
title: "Cloudinary Image"
description: "A reference of Keystone's cloudinaryImage field type, configuration and options."
---

Upload images to your Cloudinary account via Keystone's Admin UI.
Install `graphql-upload` and register its middleware as shown below.

- `cloudinary`: Configuration for the connected Cloudinary account.
  - `cloudName` - TODO
  - `apiKey` - TODO
  - `apiSecret` - TODO
  - `folder` - TODO

```typescript
import { config, list } from '@keystone-6/core';
// @ts-expect-error graphql-upload does not provide TypeScript declarations
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { cloudinaryImage } from '@keystone-6/cloudinary';

export default config({
  server: {
    extendExpressApp(app) {
      app.use(graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 10 }));
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
