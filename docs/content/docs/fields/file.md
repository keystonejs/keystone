---
title: "File"
description: "A reference of Keystone's file field type, configuration and options."
---

A `file` field represents a file of any type.

See [the Images and Files guide](../guides/images-and-files) for details on how to configure `storage` for the `file` field type.


```typescript
import { config, list } from '@keystone-6/core';
import { file } from '@keystone-6/core/fields';
import fs from 'node:fs/promises';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        repo: file({
          storage: {
            async put(key, stream) {
              await fs.writeFile(`public/files/${key}`, stream)
            },
            async delete(key) {
              await fs.unlink(`public/files/${key}`)
            },
            url(key) {
              return `http://localhost:3000/files/${key}`
            },
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

Options:

- `storage`(required): An object that defines how to upload (`put`), delete (`delete`) and get a URL to the file (`url`).
