---
title: "Text"
description: "A reference of Keystone's text field type, configuration and options."
---

A `text` field represents a string value.

Options:

- `defaultValue` (default: `db.isNullable === true ? undefined : ''`): This value will be used for the field when creating items if no explicit value is set.
- `db.map`: Adds a [Prisma `@map`](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#map) attribute to this field which changes the column name in the database
- `db.isNullable` (default: `false`\*): If `true` then this field will be made nullable in the database and it will be possible to set as `null`.
- `db.nativeType`: Changes the [Prisma Native database type attibute](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#string) from the default Prisma type for your database.
  For more information see the [Choosing a Database Guide](../guides/choosing-a-database).
- `validation.isRequired` (default: `false`\*\*): If `true` then this field can never be set to `null` or an empty string.
  Unlike `db.isNullable`, this will require that a value with at least 1 character is provided in the Admin UI.
  It will also validate this when creating and updating an item through the GraphQL API but it will not enforce it at the database level.
- `validation.length.min` (default: `0`): This describes the minimum number allowed. If you attempt to submit a string shorter than this, you will get a validation error.
- `validation.length.max` (default: `undefined`): This describes the maximum length allowed. If you attempt to submit a string longer than this, you will get a validation error.
- `validation.match` (default: `undefined`): This describes a pattern that values for this field must match
  - `validation.match.regex`: The regular expression
  - `validation.match.explanation` (default: `${fieldLabel} must match ${validation.match.regex}`): A message shown in the Admin when a value doesn't match the regex and returned as a validation error from the GraphQL API
- `isIndexed` (default: `false`)
  - If `true` then this field will be indexed by the database.
  - If `'unique'` then all values of this field must be unique.
- `ui` (default: `{ displayMode: 'input' }`): Configures the display mode of the field in the Admin UI.
  Can be one of `['input', 'textarea']`.
{% else /%}
- `graphql.read.isNonNull` (default: `false`): If you have no read access control and you don't intend to add any in the future,
  you can set this to true and the output field will be non-nullable. This is only allowed when you have no read access control because otherwise,
  when access is denied, `null` will be returned which will cause an error since the field is non-nullable and the error
  will propagate up until a nullable field is found which means the entire item will be unreadable and when doing an `items` query, all the items will be unreadable.
- `graphql.create.isNonNull` (default: `false`): If you have no create access control and you want to explicitly show that this is field is non-nullable in the create input
  you can set this to true and the create field will be non-nullable and have a default value at the GraphQL level.
  This is only allowed when you have no create access control because otherwise, the item will always fail access control
  if a user doesn't have access to create the particular field regardless of whether or not they specify the field in the create.

{% hint kind="tip" %}
**\*Warning** Unlike with other `keystone` fields, `db.isNullable` is defaulted to `false` for the text field.
This is primarily in the interest of not having to make assumptions about how a `null` value can be represented in a text field in the Admin-UI in the default case.
These differences, and the rationale for them, are examined in detail [on GitHub](https://github.com/keystonejs/keystone/discussions/7158).
You can opt into this behaviour by explicitly setting `isNullable: true`.
{% /hint %}

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: text({
          defaultValue: '...',
          db: { map: 'my_text', nativeType: 'VarChar(40)' },
          validation: { isRequired: true },
          isIndexed: 'unique',
          ui: { displayMode: 'textarea' },
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```
