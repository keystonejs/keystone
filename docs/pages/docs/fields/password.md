---
title: "Password"
description: "A reference of Keystone's password field type, configuration and options."
---

A `password` field represents an encrypted password value.

Options:

- `db.map`: Adds a [Prisma `@map`](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#map) attribute to this field which changes the column name in the database
- `db.isNullable` (default: `validation.isRequired ? false : true`): If `false` then this field will be made non-nullable in the database and it will never be possible to set as `null`.
- `validation.isRequired` (default: `false`): If `true` then this field can never be set to `null`.
  It validate this when creating and updating an item through the GraphQL API or the Admin UI.
  It will also default `db.isNullable` to false.
- `validation.length.min` (default: `8`): This describes the minimum length allowed. If you attempt to submit a string shorter than this, you will get a validation error.
- `validation.length.max` (default: `undefined`): This describes the maximum length allowed. If you attempt to submit a string longer than this, you will get a validation error.
- `validation.match` (default: `undefined`): This describes a pattern that values for this field must match
  - `validation.match.regex`: The regular expression
  - `validation.match.explanation` (default: `${fieldLabel} must match ${validation.match.regex}`): A message shown in the Admin when a value doesn't match the regex and returned as a validation error from the GraphQL API
- `validation.rejectCommon` (default: `false`): Rejects passwords from a list of commonly used passwords.
- `bcrypt` (default: `require('bcryptjs')`): A module which implements the same interface as the [`bcryptjs`](https://www.npmjs.com/package/bcryptjs) package, such as the native [`bcrypt`](https://www.npmjs.com/package/bcrypt) package.
  This module will be used for all encryption routines in the `password` field.

```typescript
import { config, list } from '@keystone-6/core';
import { password } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: password({
          db: { map: 'password_field' },
          validation: {
            length: { min: 10, max: 1000 },
            isRequired: true,
            rejectCommon: true,
          },
          bcrypt: require('bcrypt'),
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```
