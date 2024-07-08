---
title: "Cloudinary Image"
description: "A reference of Keystone's cloudinaryImage field type, configuration and options."
---

Upload images to your Cloudinary account via Keystone's Admin UI.

- `cloudinary`: Configuration for the connected Cloudinary account.
  - `cloudName` - TODO
  - `apiKey` - TODO
  - `apiSecret` - TODO
  - `folder` - TODO

```typescript
import { config, list } from '@keystone-6/core';
import { cloudinaryImage } from '@keystone-6/cloudinary';

export default config({
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
