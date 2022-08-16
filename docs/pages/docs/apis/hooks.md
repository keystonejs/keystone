---
title: "Hooks API"
description: "Hooks let you to execute code at different stages of the mutation lifecycle when performing create, update, and delete operations."
---

Hooks allow you to execute code at different stages of the mutation lifecycle when performing create, update, and delete operations.
Lists and fields both support the same set of hook functions, with some slight differences in the arguments they accept.
The differences will be explicitly called out below.

For each hook, the fields hooks are applied to **all fields first** in parallel, followed by the list hooks.

All hook functions are async and, with the exception of `resolveInput`, do not return a value.

When operating on multiple values the hooks are called individually for each item being updated, created or deleted.

For examples of how to use hooks in your system please see the [hooks guide](../guides/hooks).

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    ListName: list({
      hooks: {
        resolveInput: async args => { /* ... */ },
        validateInput: async args => { /* ... */ },
        validateDelete: async args => { /* ... */ },
        beforeOperation: async args => { /* ... */ },
        afterOperation: async args => { /* ... */ },
      },
      fields: {
        fieldName: text({
          hooks: {
            resolveInput: async args => { /* ... */ },
            validateInput: async args => { /* ... */ },
            validateDelete: async args => { /* ... */ },
            beforeOperation: async args => { /* ... */ },
            afterOperation: async args => { /* ... */ },
          },
        }),
      },
    }),
  },
});
```

### resolveInput

The `resolveInput` function is used to modify or augment the `data` values passed in to a `create` or `update` operation.

This hook is the final stage in the [data resolving process](#resolved-data-stages), and is invoked after access control has been applied.

For field hooks, the return value should be an updated value for that specific field.
For list hooks, the return value should be a [`resolved data`](#resolved-data-stages) object.
The result of `resolveInput` will be passed as `resolvedData` into the next stages of the operation.

| Argument       | Description                                                                                                                                                                  |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listKey`      | The key of the list being operated on.                                                                                                                                       |
| `fieldKey`     | The key of the field being operated on (field hooks only).                                                                                                                   |
| `operation`    | The operation being performed (`'create'` or `'update'`).                                                                                                                    |
| `inputData`    | The value of `data` passed into the mutation.                                                                                                                                |
| `item`         | The currently stored item (`undefined` for `create` operations). This object is an internal database item. [DB API](./db-items) for more details on internal database items. |
| `resolvedData` | A [`resolved data`](#resolved-data-stages) object. The resolved data value after default values, relationship resolvers, and field resolvers have been applied.              |
| `context`      | The [`KeystoneContext`](./context) object of the originating GraphQL operation.                                                                                              |

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    ListName: list({
      hooks: {
        resolveInput: async ({
          listKey,
          operation,
          inputData,
          item,
          resolvedData,
          context,
        }) => {
          /* ... */
          return resolvedData;
        },
      },
      fields: {
        fieldName: text({
          hooks: {
            resolveInput: async ({
              listKey,
              fieldKey,
              operation,
              inputData,
              item,
              resolvedData,
              context,
            }) => {
              /* ... */
              return resolvedData[fieldName];
            },
          },
        }),
      },
    }),
  },
});
```

### validateInput

The `validateInput` function is used to validate the [`resolvedData`](#resolved-data-stages) that will be saved during a `create` or `update` operation.

It is invoked after the `resolveInput` hooks have been run.

If the `resolvedData` is invalid then the function should report validation errors with `addValidationError(msg)`.
These error messages will be returned as a `ValidationFailureError` from the GraphQL API, and the operation will not be completed.

| Argument                  | Description                                                                                                                                                                                    |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listKey`                 | The key of the list being operated on.                                                                                                                                                         |
| `fieldKey`                | The key of the field being operated on (field hooks only).                                                                                                                                     |
| `operation`               | The operation being performed (`'create'` or `'update'`).                                                                                                                                      |
| `inputData`               | The value of `data` passed into the mutation.                                                                                                                                                  |
| `item`                    | The current value of the item being updated (`undefined` for `create` operations). This object is an internal database item. [DB API](./db-items) for more details on internal database items. |
| `resolvedData`            | A [`resolved data`](#resolved-data-stages) object. The resolved data value after all data resolver stages have been completed.                                                                 |
| `context`                 | The [`KeystoneContext`](./context) object of the originating GraphQL operation.                                                                                                                |
| `addValidationError(msg)` | Used to set a validation error.                                                                                                                                                                |

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    ListName: list({
      hooks: {
        validateInput: async ({
          listKey,
          operation,
          inputData,
          item,
          resolvedData,
          context,
          addValidationError,
        }) => { /* ... */ },
      },
      fields: {
        fieldName: text({
          hooks: {
            validateInput: async ({
              listKey,
              fieldKey,
              operation,
              inputData,
              item,
              resolvedData,
              context,
              addValidationError,
            }) => { /* ... */ },
          },
        }),
      },
    }),
  },
});
```

### validateDelete

The `validateDelete` function is used during a `delete` operation to validate that deleting the selected item will not cause an issue in your system.

It is invoked after access control has been applied.

If the delete operation is invalid then the function should report validation errors with `addValidationError(msg)`.
These error messages will be returned as a `ValidationFailureError` from the GraphQL API.

| Argument                  | Description                                                                                                                                      |
| :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `listKey`                 | The key of the list being operated on.                                                                                                           |
| `fieldKey`                | The key of the field being operated on (field hooks only).                                                                                       |
| `operation`               | The operation being performed (`'delete'`).                                                                                                      |
| `item`                    | The value of the item to be deleted. This object is an internal database item. [DB API](./db-items) for more details on internal database items. |
| `context`                 | The [`KeystoneContext`](./context) object of the originating GraphQL operation.                                                                  |
| `addValidationError(msg)` | Used to set a validation error.                                                                                                                  |

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    ListName: list({
      hooks: {
        validateDelete: async ({
          listKey,
          operation,
          item,
          context,
          addValidationError,
        }) => { /* ... */ },
      },
      fields: {
        fieldName: text({
          hooks: {
            validateDelete: async ({
              listKey,
              fieldKey,
              operation,
              item,
              context,
              addValidationError,
            }) => { /* ... */ },
          },
        }),
      },
    }),
  },
});
```

### beforeOperation

The `beforeOperation` function is used to perform side effects just before the data is saved to the database (for a `create` or `update` operation), or deleted from the database (for `delete` operations).

It is invoked after all `validateInput`/`validateDelete` hooks have been run, but before the database is updated.

| Argument       | Description                                                                                                                                                                                   |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listKey`      | The key of the list being operated on.                                                                                                                                                        |
| `fieldKey`     | The key of the field being operated on (field hooks only).                                                                                                                                    |
| `operation`    | The operation being performed (`'create'`, `'update'`, or `'delete'`).                                                                                                                        |
| `inputData`    | The value of `data` passed into the mutation. `undefined` for `delete` operations.                                                                                                            |
| `item`         | The current value of the item being updated, `undefined` for `create` operations. This object is an internal database item. [DB API](./db-items) for more details on internal database items. |
| `resolvedData` | A [`resolved data`](#resolved-data-stages) object. The resolved data value after all data resolver stages have been completed. `undefined` for `delete` operations.                           |
| `context`      | The [`KeystoneContext`](./context) object of the originating GraphQL operation.                                                                                                               |

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    ListName: list({
      hooks: {
        beforeOperation: async ({
          listKey,
          operation,
          inputData,
          item,
          resolvedData,
          context,
        }) => { /* ... */ },
      },
      fields: {
        fieldName: text({
          hooks: {
            beforeOperation: async ({
              listKey,
              fieldKey,
              operation,
              inputData,
              item,
              resolvedData,
              context,
            }) => { /* ... */ },
          },
        }),
      },
    }),
  },
});
```

### afterOperation

The `afterOperation` function is used to perform side effects after the data has been saved to the database (for a `create` or `update` operation), or deleted from the database (for `delete` operations).

| Argument       | Description                                                                                                                                                                                               |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listKey`      | The key of the list being operated on.                                                                                                                                                                    |
| `fieldKey`     | The key of the field being operated on (field hooks only).                                                                                                                                                |
| `operation`    | The operation being performed (`'create'`, `'update'`, or `'delete'`).                                                                                                                                    |
| `inputData`    | The value of `data` passed into the mutation. `undefined` for `delete` operations.                                                                                                                        |
| `originalItem` | The original value of the item being updated or deleted, `undefined` for `create` operations. This object is an internal database item. [DB API](./db-items) for more details on internal database items. |
| `item`         | The new value of the item being updated or created, `undefined` for `delete` operations. This object is an internal database item. [DB API](./db-items) for more details on internal database items.      |
| `resolvedData` | A [`resolved data`](#resolved-data-stages) object. The resolved data value after all data resolver stages have been completed. `undefined` for `delete` operations.                                       |
| `context`      | The [`KeystoneContext`](./context) object of the originating GraphQL operation.                                                                                                                           |

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    ListName: list({
      hooks: {
        afterOperation: async ({
          listKey,
          operation,
          inputData,
          originalItem,
          item,
          resolvedData,
          context,
        }) => { /* ... */ },
      },
      fields: {
        fieldName: text({
          hooks: {
            afterOperation: async ({
              listKey,
              fieldKey,
              operation,
              inputData,
              originalItem,
              item,
              resolvedData,
              context,
            }) => { /* ... */ },
          },
        }),
      },
    }),
  },
});
```

## Resolved data stages

Create and update operations take a `data` value for a single item from the GraphQL input and then perform a number of _data resolving_ steps before writing the final value to the database.

At each stage of the data resolving process, the value of `resolvedData` can be modified or augmented.
The final value of `resolvedData` is the value that will be validated and saved to the database.

The data resolving steps are applied in the following order:

1. Initialisation: Set the value of `resolvedData` to the `data` input value from the GraphQL mutation.
2. Defaults (built in, `create` only): Any fields which have a default value and are `undefined` in `resolvedData` will be set to their default value.
3. Relationships (built in): The values for relationship fields on `resolvedData` are [Prisma nested write objects](https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries/#connect-an-existing-record).
   This is the format expected when saving relationship fields to the database.
   Any nested create operations are performed during this phase. Their IDs are returned, and combined with any `connect` inputs.
   All items provided for `connect`, `set`, and `disconnect` are checked to ensure they exist.
   For to-many relationships, an object with the shape `{ connect: [...], set: [...], disconnect: [...] }` is returned.
   For to-one relationships, an object with the shape `{ connect }` or `{ disconnect: true }` is returned.
4. Field values (built in): Some fields types take the value given in the GraphQL operation and convert it into a different type or format to be saved to the database.
5. Field hooks (user defined): A `resolveInput` field hook can return a new value for its field, which will the current field value on `resolvedData`.
6. List hooks (user defined): A `resolveInput` list hook can return a new value for the entire `resolvedData` object.

## Related resources

{% related-content %}
{% well 
heading="Hooks Guide"
href="/docs/guides/hooks" %}
Learn how to use Hooks within your schema to extend Keystone’s powerful CRUD GraphQL APIs with your own business logic.
{% /well %}
{% /related-content %}
