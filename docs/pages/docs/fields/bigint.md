---
title: "BigInt"
description: "A reference of Keystone's bigInt field type, configuration and options."
---

A `bigInt` field represents a 64 bit signed integer value.
When interacting with the field with GraphQL, values will be strings.
When interacting with the field in hooks, values will be [Javascript `BigInt`s](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#bigint_type).
Javascript `BigInt`s are used since [integers in Javascript are unsafe beyond 2{% sup %}53{% /sup %}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER).

Options:

- `defaultValue` (default: `undefined`): Can be either a bigint value or `{ kind: 'autoincrement' }`.
  This value will be used for the field when creating items if no explicit value is set.
  `{ kind: 'autoincrement' }` is only supported on PostgreSQL.
- `db.isNullable` (default: `validation.isRequired ? false : true`): If `false` then this field will be made non-nullable in the database and it will never be possible to set as `null`.
- `db.map`: Adds a [Prisma `@map`](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#map) attribute to this field which changes the column name in the database
- `validation.isRequired` (default: `false`): If `true` then this field can never be set to `null`.
  It validate this when creating and updating an item through the GraphQL API or the Admin UI.
  It will also default `db.isNullable` to false.
- `validation.min`(default: `(-2n) ** 63n`): This describes the minimum number allowed. If you attempt to submit a number under this, you will get a validation error.
- `validation.max`(default: `2n ** 63n - 1n`): This describes the maximum number allowed. If you attempt to submit a number over this, you will get a validation error.
  - If you want to specify a range within which the numbers must fall, specify both a minimum and a maximum value.
- `isIndexed` (default: `false`)
  - If `true` then this field will be indexed by the database.
  - If `'unique'` then all values of this field must be unique.
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
import { bigInt } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: bigInt({
          defaultValue: 0n,
          db: { map: 'my_bigint' },
          validation: {
            isRequired: true,
          },
          isIndexed: 'unique',
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```
