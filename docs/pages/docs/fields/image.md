---
title: "Image"
description: "A reference of Keystone's image field type, configuration and options."
---

An `image` field represents an image file, i.e. `.jpg`, `.png`, `.webp`, or `.gif`.

See [`config.storage`](../config/config#storage-images-and-files) for details on how to configure your Keystone system with support for the `image` field type.

```typescript
import { config, list } from '@keystone-6/core';
import { image } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        avatar: image({ storage: 'my_image_storage' }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```

Options:

- `storage`(required): A string that is the key for one of the entries in the storage object. This
  is used to determine what storage config will be used.
