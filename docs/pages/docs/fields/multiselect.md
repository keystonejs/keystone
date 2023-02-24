---
title: "Multiselect"
description: "A reference of Keystone's multiselect field type, configuration and options."
---

A `multiselect` field represents the selection of a set of values from the defined `options`.
Values can be either strings, integers, or enum values, as determined by the `type` option.
This will determine their GraphQL data type.
Unlike the `select` field, the `type` will not change the database type, `multiselect` fields are always stored as a json array in the database.

Options:

- `type` (default: `'string'`): Sets the type of the values of this field.
  Must be one of `['string', 'enum', 'integer']`.
- `options`: An array of `{ label, value }`.
  `label` is a string to be displayed in the Admin UI.
  `value` is either a `string` (for `{ type: 'string' }` or `{ type: 'enum' }`), or a `number` (for `{ type: 'integer' }`).
  The `value` will be used in the GraphQL API and stored in the database.
- `defaultValue` (default: `[]`): This value will be used for the field when creating items if no explicit value is set.
- `db.map`: Adds a [Prisma `@map`](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#map) attribute to this field which changes the column name in the database
{% else /%}
- `graphql.read.isNonNull` (default: `false`): If you have no read access control and you don't intend to add any in the future,
  you can set this to true and the output field will be non-nullable. This is only allowed when you have no read access control because otherwise,
  when access is denied, `null` will be returned which will cause an error since the field is non-nullable and the error
  will propagate up until a nullable field is found which means the entire item will be unreadable and when doing an `items` query, all the items will be unreadable.
- `graphql.create.isNonNull` (default: `false`): If you have no create access control and you want to explicitly show that this is field is non-nullable in the create input
  you can set this to true and the create field will be non-nullable and have a default value at the GraphQL level.
  This is only allowed when you have no create access control because otherwise, the item will always fail access control
  if a user doesn't have access to create the particular field regardless of whether or not they specify the field in the create.

```typescript
import { config, list } from '@keystone-6/core';
import { multiselect } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: multiselect({
          type: 'enum',
          options: [
            { label: '...', value: '...' },
            /* ... */
          ],
          defaultValue: ['...'],
          db: { map: 'my_multiselect' },
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```
