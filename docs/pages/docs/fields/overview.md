---
title: "Fields"
description: "A reference of Keystone’s field types, and the configuration options they accept."
---

{% hint kind="warn" %}
We recently improved this API. If you were using it prior to October 5th 2021, [read this guide](/releases/2021-10-05) for details on how to upgrade.
{% /hint %}

The `fields` option of a [list configuration](../config/lists) defines the names, types, and configuration of the fields in the list.
This configuration option takes an object with field names as keys, and configured field types as values.

This document covers the different field types which are available and the configuration options they accept.
To see how to access fields in the GraphQL API please see the [GraphQL API](../graphql/overview) docs.

```typescript
import { config, list } from '@keystone-6/core';
import {
  // Scalar types
  checkbox,
  integer,
  bigInt,
  json,
  float,
  decimal,
  password,
  select,
  multiselect,
  text,
  timestamp,
  calendarDay,

  // Relationship type
  relationship,

  // Virtual type
  virtual,

  // File types
  file,
  image,
} from '@keystone-6/core/fields';

// Complex types
import { document } from '@keystone-6/fields-document';
import { cloudinaryImage } from '@keystone-6/cloudinary';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: text({ /* ... */ }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```

## Common configuration

All field types accept a common set of configuration options.
All options are optional.

Options:

- `isFilterable` (default: `true`): If `false`, the GraphQL API and admin UI will not support filtering by this field.
  If `true` (default), the GraphQL API and Admin UI will support filtering by this field.
  If a function is provided, it will be evaluated dynamically each time this field is used as a filter in a GraphQL operation.
  If the function returns `false`, the operation will return an error indicating that filtering on this field is not allowed.
- `isOrderable` (default: `true`): If `false`, the GraphQL API and admin UI will not support ordering by this field.
  If `true` (default), the GraphQL API and Admin UI will support ordering by this field.
  If a function is provided, it will be evaluated dynamically each time this field is used as an ordering field in a GraphQL operation.
  If the function returns `false`, the operation will return an error indicating this ordering by this field is not allowed.
- `access`: Defines the [Access Control](../guides/auth-and-access-control) rules for the field.
  See the [Access Control API](../config/access-control) for full details on the available access control options.
- `hooks`: The `hooks` option defines [hook](../guides/hooks) functions for the field.
  Hooks allow you to execute code at different stages of the mutation lifecycle.
  See the [Hooks API](../config/hooks) for full details on the available hook options.
- `label`: The label displayed for this field in the Admin UI. Defaults to a human readable version of the field name.
- `ui`: Controls how the field is displayed in the Admin UI.
  - `views`: A module path that is resolved from where `keystone start` is run, resolving to a module containing code to replace or extend the Admin UI components for this field. See the [Custom Field Views](../guides/custom-field-views) guide for details on how to use this option.
  - `createView.fieldMode` (default: `'edit'`): Controls the create view page of the Admin UI.
    Can be one of `['edit', 'hidden']`, or an async function with an argument `{ session, context }` that returns one of `['edit', 'hidden']`.
    Defaults to the list's `ui.createView.defaultFieldMode` config if defined.
    See the [Lists API](../config/lists#ui) for details.
  - `itemView.fieldMode` (default: `'edit'`): Controls the item view page of the Admin UI.
    Can be one of `['edit', 'read', 'hidden']`, or an async function with an argument `{ session, context, item }` that returns one of `['edit', 'read', 'hidden']`.
    Defaults to the list's `ui.itemView.defaultFieldMode` config if defined.
    See the [Lists API](../config/lists#ui) for details.
- `itemView.fieldPosition` (default: `form`): Controls which side of the page the field is placed in the Admin UI.
    Can be either `form` or `sidebar`. `form` or blank places the field on the left hand side of the item view. `sidebar` places the field on the right hand side under the ID field
  - `listView.fieldMode` (default: `'read'`): Controls the list view page of the Admin UI.
    Can be one of `['read', 'hidden']`, or an async function with an argument `{ session, context }` that returns one of `['read', 'hidden']`.
    Defaults to the list's `ui.listView.defaultFieldMode` config if defined.
    See the [Lists API](../config/lists#ui) for details.
- `graphql`: Configures certain aspects of the GraphQL API.
  - `cacheHint` (default: `undefined`): Allows you to specify the [dynamic cache control hints](https://www.apollographql.com/docs/apollo-server/performance/caching/#in-your-resolvers-dynamic) used for queries to this list.
- `isNonNull.read` (default: `false`): Changing this to `true` will change the GraphQL output type to be non-nullable.
    If you have 'read' field access control, this will be rejected with a runtime `Error` as `null` may be returned if the access control returns false.
    - `isNonNull.create` (default: `false`): Enforce that this field is non-nullable in the \*CreateInput for the respective list item.
    Fields that have a `defaultValue` only have that default value included in the GraphQL if this field is `true`.
    - `isNonNull.update` (default: `false`): Enforce that this field is non-nullable in the \*UpdateInput for the respective list item.
    This field additionally results in the AdminUI always sending this particular field in updates, including when it has not changed.
  - `omit` (default: 'undefined'): Controls whether this field appears in the autogenerated types of the GraphQL API
    This option accepts either `true`, or an array of the values `read`, `create`, or `update`.
    If you specify `true` then the field will be excluded from all input and output types in the GraphQL API.
    If you provide an array of `read`, `create`, or `update` the field will be omitted from the corresponding input and output types in the GraphQL API.

```typescript
export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: text({
          isFilterable: ({ context, session, fieldKey, listKey }) => true,
          isOrderable: ({ context, session, fieldKey, listKey }) => true,
          access: { /* ... */ },
          hooks: { /* ... */ },
          label: '...',
          ui: {
            views: './path/to/viewsModule',
            createView: {
              fieldMode: ({ session, context }) => 'edit',
            },
            itemView: {
              fieldMode: ({ session, context, item }) => 'read',
            },
            listView: {
              fieldMode: ({ session, context }) => 'read',
            },
          },
          graphql: {
            cacheHint: { maxAge: 60, scope: CacheScope.Private },
            omit: ['read', 'create', 'update'],
          }
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```

## Groups

Fields can be grouped together in the Admin UI using the `group` function, with a customisable `label` and `description`.

```typescript
import { config, list, group } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        ...group({
          label: 'Group label',
          description: 'Group description',
          fields: {
            someFieldName: text({ /* ... */ }),
            /* ... */
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

## Scalar types

- [BigInt](./bigint)
- [Calendar Day](./calendarday)
- [Checkbox](./checkbox)
- [Decimal](./decimal)
- [Float](./float)
- [Integer](./integer)
- [JSON](./json)
- [Multiselect](./multiselect)
- [Password](./password)
- [Select](./select)
- [Text](./text)
- [Timestamp](./timestamp)

## Relationship type

- [Relationship](./relationship)

## Virtual type

- [Virtual](./virtual)

## File types

- [File](./file)
- [Image](./image)

## Complex types

- [Document](./document)
- [Cloudinary Image](./cloudinaryimage)

## Related resources

{% related-content %}
{% well
heading="Lists API Reference"
href="/docs/config/lists" %}
The API to configure your options used with the `list()` function.
{% /well %}
{% well
heading="GraphQL API Reference"
href="/docs/graphql/overview" %}
A complete CRUD (create, read, update, delete) GraphQL API derived from the list and field names you configure in your system.
{% /well %}
{% /related-content %}
