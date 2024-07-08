---
title: "JSON"
description: "A reference of Keystone's json field type, configuration and options."
---

A `json` field represents a JSON blob.
Currently the `json` field is non-orderable and non-filterable.

- `defaultValue` (default: `null`): Can be set to any JSON value.
  This value will be used for the field when creating items if no explicit value is set.
- `db.map`: Adds a [Prisma `@map`](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#map) attribute to this field which changes the column name in the database

```typescript
import { config, list } from '@keystone-6/core';
import { json } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: json({
          defaultValue: { something: true },
          db: { map: 'my_json' },
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```
