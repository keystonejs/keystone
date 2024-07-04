---
title: "File"
description: "A reference of Keystone's file field type, configuration and options."
---

A `file` field represents a file of any type.

See [`config.storage`](../config/config#storage-images-and-files) for details on how to configure your Keystone system with support for the `file` field type.

```typescript
import { config, list } from '@keystone-6/core';
import { file } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        repo: file({ storage: 'my_file_storage' }),
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
