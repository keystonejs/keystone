---
title: "Access Control"
description: "Complete reference docs for Keystone’s Access Control API. Configure who can read, create, update, and delete items in your Keystone system."
---

{% hint kind="warn" %}
We recently improved this API so it’s easier to program, and makes it harder to introduce security gaps in your system. If you were using it prior to September 1st 2022, you will need to now configure access control for your operations.
{% /hint %}

The `access` property of the [list configuration](./lists) object configures who can query, create, update, and delete items in your Keystone system.
The `access` property of the [field configuration](../fields/overview) object configures who can read, create, and update specific field values of an item.

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    ListKey: list({
      fields: {
        fieldName: text({ access: { /* ... */ }, }),
      },
      access: { /* ... */ },
    }),
  },
});
```

## List Access Control

Keystone provides support for access control and filtering on a per-list basis.

There are three types of access control that can be configured on the `access` object:

- [`operation`](#operation), functions that provide the `context` and `session` to help decide if a request should be granted access to the list; this happens prior to any GraphQL query being executed.
- [`filter`](#filter), functions which return a [filter](../graphql/filters) that is applied to database queries on this list.
- [`item`](#item-mutations-only), functions that provide the `context` and `session` to determine if a request can execute the respective mutative action.

Each of these types of access control are applied before [hooks](./hooks).

{% hint kind="warn" %}
Please note that Keystone does not automatically configure nor leverage database row security policies or row level security
{% /hint %}

If you are happy to allow all parts of a list to be accessible you can use:

```typescript
import { config, list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';

export default config({
  lists: {
    ListKey: list({
      access: allowAll,
    }),
  },
});
```

{% hint kind="tip" %}
**Access denied:** **Mutations** return `null` data with an access denied error. **Queries** never return access denied errors, and instead treat items as if they didn't exist.
{% /hint %}

If access is **denied** due to any of the access control methods, the following responses will be returned from the GraphQL API:

- **Mutations**
  - **Single** operations return `null` and an access denied error.
  - **Multi** operations return a data array with `null` values for the items which have access denied.
    Error responses are returned for each `null` item.
- **Queries**
  - **Single** item queries return `null` with no errors.
  - **Many** item queries filter out items which have access denied. No error responses are returned.
  - **Count** queries will only count those items for which access is **not** denied. No error responses are returned.

### Operation

Operation-level access control lets you control which operations can be accessed by a user based on the `session` and `context`.
Individual functions can be provided for each of the operations. All operations must be configured.

{% hint kind="tip" %}
These functions must return `true` if the operation is allowed, or `false` if it is not allowed.
{% /hint %}

```typescript
import { config, list } from '@keystone-6/core';

export default config({
  lists: {
    ListKey: list({
      access: {
        operation: {
          query: ({ session, context, listKey, operation }) => true,
          create: ({ session, context, listKey, operation }) => true,
          update: ({ session, context, listKey, operation }) => true,
          delete: ({ session, context, listKey, operation }) => true,
        }
      },
    }),
  },
});
```

If you are happy setting all of them to true, you can set it for all operations with:

```typescript
import { config, list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';

export default config({
  lists: {
    ListKey: list({
      access: {
        operation: allowAll
      },
    }),
  },
});
```

If you want to set all but one operation to true, you can do so using `allOperations` and `denyAll` from `@keystone-6/core/access` such as:

```typescript
import { config, list } from '@keystone-6/core';
import { denyAll, allOperations } from '@keystone-6/core/access';

export default config({
  lists: {
    ListKey: list({
      access: {
        operation: {
          ...allOperations(denyAll)
          // hint: unconditionally returning `true` is equivalent to using allowAll for this operation
          query: ({ session, context, listKey, operation }) => true,
        }
      },
    }),
  },
});
```

{% hint kind="warn" %}
The `query` access control is applied only when running GraphQL query operations.
A user can still **read** fields as part of a return query when using a mutation `operation` (`create`, `update` or `delete`).
If you want to limit access to fields, use [field access control](https://keystonejs.com/docs/config/access-control#field-access-control).
{% /hint %}

### Filter

Filter-level access control lets you restrict which items can be operated on by providing a function which returns a [GraphQL filter](../graphql/filters).

- For **mutations**, the access control filter will be combined with the unique identifier provided to the operation, and access will be denied if no item is found with this combined filter.
- For **queries**, the access control filter will be combined with the query filter and only items which match both filters will be returned.

In general, the filter access control functions will return GraphQL filters.
They can also return boolean values `true` or `false` to match or exclude all items.

{% hint kind="warn" %}
Each `filter` type _defaults to an empty filter_, unless configured.
{% /hint %}

```typescript
import { config, list } from '@keystone-6/core';
import { checkbox } from '@keystone-6/core/fields';

export default config({
  lists: {
    ListKey: list({
      fields: {
        isReadable: checkbox(),
        isUpdatable: checkbox(),
        isDeletable: checkbox(),
      }
      access: {
        filter: {
          query: ({ session, context, listKey, operation }) => {
            return { isReadable: { equals: true } };
          },
          update: ({ session, context, listKey, operation }) => {
            return { isUpdatable: { equals: true } };
          },
          delete: ({ session, context, listKey, operation }) => {
            return { isDeletable: { equals: true } };
          },
        }
      },
    }),
  },
});
```

{% hint kind="tip" %}
Filter based access control cannot be used for `create` operations.
If you want to limit `create` operations, use either `access.operation.create` or `access.item.create`.
{% /hint %}

### Item (mutations only)

Item-level access control lets you control which mutative operations can be applied to a list item.
Individual functions can be provided for each of the operations, with each function receiving:

- the **input data** of the mutation (for `create` and `update` operations), and/or
- the **existing item** in the database (for `update` and `delete` operations).

{% hint kind="warn" %}
Each `item` access type _defaults to public_ unless configured.
{% /hint %}

{% hint kind="tip" %}
These functions must return `true` if the operation is allowed, or `false` if it is not allowed.
{% /hint %}

```typescript
import { config, list } from '@keystone-6/core';
import { checkbox } from '@keystone-6/core/fields';

export default config({
  lists: {
    ListKey: list({
      access: {
        item: {
          create: ({ session, context, listKey, operation, inputData }) => true,
          update: ({ session, context, listKey, operation, inputData, item }) => true,
          delete: ({ session, context, listKey, operation, item }) => true,
        }
      },
    }),
  },
});
```

{% hint kind="warn" %}
Item-level access control is not available for `query` operations.
Keystone has opted to disable `read` access control for `query` operations as applying _after_ queries will reuslt in inconsistent pagination behaviour and mismatched `count` results.
{% /hint %}

### Function Arguments {% #list-level-function-arguments %}

List-level access control functions are passed a collection of arguments which can be used to determine whether the operation is allowed.

| Argument    | Description                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| `session`   | The current session object. See the [Sessions API](./session) for details.                                    |
| `context`   | The [`KeystoneContext`](../context/overview) object of the originating GraphQL operation.                     |
| `listKey`   | The key of the list being operated on.                                                                        |
| `operation` | The operation being performed (`'query'`, `'create'`, `'update'`, `'delete'`).                                |
| `inputData` | For `create` and `update` operations, this is the value of `data` passed into the mutation. (Item level only) |
| `item`      | The existing item being updated/deleted in `update` and `delete` operations. (Item level only)                |

## Field Access Control

Keystone also allows you to set up access control on a per-field basis.
Rules can be set for `read`, `create` and `update` operations.

{% hint kind="tip" %}
Each operation is defined by a function which returns `true` if access is allowed and `false` if access is not allowed.
{% /hint %}

### Mutations

Field-level access control rules are applied **after** the list level access rules have been applied.
Access control rules are only applied to the fields that have an input value provided to the mutation.

If any of the provided fields fail their access control check, the whole operation is aborted.
The GraphQL API then returns `null` along with an access denied error.

### Read

Field-level access control rules are applied when trying to resolve a field on the output type.
If access is denied then the query will still return an item object, but the specific field will return `null`.
No errors will be returned for `read` access denied.

{% hint kind="tip" %}
The `read` access control is applied to fields returned from both **queries** and **mutations**.
{% /hint %}

{% hint kind="tip" %}
`read` access control is applied as part of GraphQL resolving the output types.
If a mutation returns an item type that has field access control defined, field access control will apply.
{% /hint %}

{% hint kind="warn" %}
`read` field access control does not apply to `context.db.*` operations, as these operations do not resolve the underlying fields using GraphQL.
{% /hint %}

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    ListKey: list({
      fields: {
        fieldName: text({
          access: {
            read: ({ session, context, listKey, fieldKey, operation, item }) => true,
            create: ({ session, context, listKey, fieldKey, operation, inputData }) => true,
            update: ({ session, context, listKey, fieldKey, operation, inputData, item }) => true,
          },
        }),
      },
    }),
  },
});
```

{% hint kind="tip" %}
Field-level access control is not available for `delete` operations. Restrict `delete` operations at the List-level instead with `access.operation.delete`, `access.filter.delete` or `access.item.delete`.
{% /hint %}

### Function Arguments {% #field-level-function-arguments %}

Field-level access control functions are passed a collection of arguments which can be used to determine whether the operation is allowed.

| Argument    | Description                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| `session`   | The current session object. See the [Sessions API](./session) for details.                  |
| `context`   | The [`KeystoneContext`](../context/overview) object of the originating GraphQL operation.   |
| `listKey`   | The key of the list being operated on.                                                      |
| `fieldKey`  | The key of the field being operated on.                                                     |
| `operation` | The operation being performed (`'read'`, `'create'`, `'update'`).                           |
| `inputData` | For `create` and `update` operations, this is the value of `data` passed into the mutation. |
| `item`      | The existing item being read/updated in `read` and `update` operations.                     |
