---
title: "Bytes"
description: "A reference of Keystone's bytes field type, configuration and options."
---

A `bytes` field represents binary data as a `Uint8Array` in JavaScript.

Options:

- `defaultValue` (default: `null`): This `Uint8Array` value will be used for the field when creating items if no explicit value is set.
- `db.map`: Adds a [Prisma `@map`](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#map) attribute to this field which changes the column name in the database.
- `db.isNullable` (default: `true`): If `false`, this field will be non-nullable in the database.
- `db.nativeType`: Changes the [Prisma native database type attribute](https://www.prisma.io/docs/orm/reference/prisma-schema-reference#bytes) from the default Prisma type for your database. The native type is not customisable on SQLite.
- `validation.isRequired` (default: `false`): If `true`, this field can never be set to `null`.
- `validation.length.min` (default: `undefined`): The minimum length in bytes.
- `validation.length.max` (default: `undefined`): The maximum length in bytes.
- `isIndexed` (default: `false`)
  - If `true` then this field will be indexed by the database.
  - If `'unique'` then all values of this field must be unique.
- `graphql.scalar` (default: Keystone's `Bytes` scalar): Allows you to provide a custom GraphQL scalar for serialising and parsing values.

```typescript
import { config, list } from '@keystone-6/core';
import { bytes } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: bytes({
          validation: { length: { max: 1024 } },
          db: { map: 'my_bytes' },
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```
