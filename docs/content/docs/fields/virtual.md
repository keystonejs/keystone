---
title: "Virtual"
description: "A reference of Keystone's virtual field type, configuration and options."
---

A `virtual` field represents a value which is computed at read time, rather than stored in the database.
See the [virtual fields guide](../guides/virtual-fields) for details on how to use virtual fields.

Options:

- `field` (required): The GraphQL field that defines the type, resolver and arguments.
- `ui.query` (default: `''` ):
  Defines what the Admin UI should fetch from this field, it's interpolated into a query like this:
  ```graphql
  query {
    item(where: { id: "..." }) {
      field${ui.query}
    }
  }
  ```
  This is only needed when you your field returns a GraphQL type other than a scalar(String and etc.)
  or an enum or you need to provide arguments to the field.

```typescript
import { config, createSchema, graphql, list } from '@keystone-6/core';
import { virtual } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: virtual({
          field: graphql.field({
            type: graphql.String,
            args: { something: graphql.arg({ type: graphql.Int }) },
            resolve(item, args, context, info) {

            }
          })
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```
