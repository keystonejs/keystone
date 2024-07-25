---
title: "Hooks"
description: "Hooks let you to execute code at different stages of the mutation lifecycle when performing create, update, and delete operations."
---

Hooks allow you to execute code at different stages of the mutation lifecycle when performing create, update, and delete operations.
Lists and fields both support the same set of hook functions, with some slight differences in the arguments they accept.
The differences will be explicitly called out below.

For each hook, the fields hooks are applied to **all fields first** in parallel, followed by the list hooks.

Hook functions support `async` and, with the exception of `resolveInput`, do not need a return value.

When operating on multiple values the hooks are called individually for each item being updated, created or deleted.

For examples of how to use hooks in your system please see the [hooks guide](../guides/hooks).

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      hooks: {
        resolveInput: {
          create: async args => { /* ... */ },
          update: async args => { /* ... */ },
        },
        validate: {
          create: async args => { /* ... */ },
          update: async args => { /* ... */ },
          delete: async args => { /* ... */ },
        },
        beforeOperation: {
          create: async args => { /* ... */ },
          update: async args => { /* ... */ },
          delete: async args => { /* ... */ },
        },
        afterOperation: {
          create: async args => { /* ... */ },
          update: async args => { /* ... */ },
          delete: async args => { /* ... */ },
        }
      },
      fields: {
        someFieldName: text({
          hooks: {
            resolveInput: {
              create: async args => { /* ... */ },
              update: async args => { /* ... */ },
            },
            validate: {
              create: async args => { /* ... */ },
              update: async args => { /* ... */ },
              delete: async args => { /* ... */ },
            },
            beforeOperation: {
              create: async args => { /* ... */ },
              update: async args => { /* ... */ },
              delete: async args => { /* ... */ },
            },
            afterOperation: {
              create: async args => { /* ... */ },
              update: async args => { /* ... */ },
              delete: async args => { /* ... */ },
            }
          },
        }),
      },
    }),
  },
});
```

### resolveInput

The `resolveInput` hook is a transform for mutating the input `data` value prior to calling any other successive hooks, as part of the operation.

This hook is the final stage in the [data resolving process](#resolved-data-stages), and is invoked after access control has been applied.

For field hooks, the return value should be an updated value for that specific field.
For list hooks, the return value should be a [`resolved data`](#resolved-data-stages) object.
The result of `resolveInput` hooks is accessible as the argument `resolvedData` in the hooks that follow, for the remainder of the operation.

| Argument       | Description                                                                                                                                                                           |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `listKey`      | The key of the list being operated on.                                                                                                                                                |
| `fieldKey`     | The key of the field being operated on (field hooks only).                                                                                                                            |
| `operation`    | The operation being performed (`'create'` or `'update'`).                                                                                                                             |
| `inputData`    | The value of `data` passed into the mutation.                                                                                                                                         |
| `item`         | The currently stored item (`undefined` for `create` operations). This object is an internal database item. [DB API](../context/db-items) for more details on internal database items. |
| `resolvedData` | A [`resolved data`](#resolved-data-stages) object. The resolved data value after default values, relationship resolvers, field resolvers, and `resolveInput` hooks have been applied. |
| `context`      | The [`KeystoneContext`](../context/overview) object of the originating GraphQL operation.                                                                                             |

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      hooks: {
        resolveInput: {
          create: async ({
            listKey,
            operation, // always 'create'
            inputData,
            item,
            resolvedData,
            context,
          }) => {
            /* ... */
            return resolvedData;
          },
          update: async ({
            listKey,
            operation, // always 'update'
            inputData,
            item,
            resolvedData,
            context,
          }) => {
            /* ... */
            return resolvedData;
          },
        },
      },
      fields: {
        someFieldName: text({
          hooks: {
            resolveInput: {
              create: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                item,
                resolvedData,
                context,
              }) => {
                /* ... */
                return resolvedData[fieldKey];
              },
              update: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                item,
                resolvedData,
                context,
              }) => {
                /* ... */
                return resolvedData[fieldKey];
              },
            },
          },
        }),
      },
    }),
  },
});
```

### validate

The `validate` hooks can be used to validate your [`resolvedData`](#resolved-data-stages) before a `create` or `update` operation completes, ensuring your expectations are met.
This hook can additionally be used to check your expectations as part of a `delete` operation.

For `create` and `update` operations, this hook is invoked after the respective `resolveInput` hooks has been run.

This hook should report any validation errors using the `addValidationError(message)` function, which is provided as a parameter.
This is preferred to throwing to easily support more than one error message, if required.

These error messages will be returned as a `ValidationFailureError` from the GraphQL API, and the operation will not be completed.

| Argument                  | Description                                                                                                                                                                                             |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `listKey`                 | The key of the list being operated on.                                                                                                                                                                  |
| `fieldKey`                | The key of the field being operated on (field hooks only).                                                                                                                                              |
| `operation`               | The operation being performed (`'create'`, `'update'` or `'delete'`).                                                                                                                                   |
| `inputData`               | The value of `data` passed into the mutation (`undefined` for `delete` operations).                                                                                                                     |
| `item`                    | The current value of the item being updated (`undefined` for `create` operations). This object is an internal database item. [DB API](../context/db-items) for more details on internal database items. |
| `resolvedData`            | A [`resolved data`](#resolved-data-stages) object (`undefined` for `delete` operations). The resolved data value after all data resolver stages have been completed.                                    |
| `context`                 | The [`KeystoneContext`](../context/overview) object of the originating GraphQL operation.                                                                                                               |
| `addValidationError(msg)` | Used to set a validation error.                                                                                                                                                                         |

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      hooks: {
        validate: {
          create: async ({
            listKey,
            operation,
            inputData,
            resolvedData,
            context,
            addValidationError,
          }) => { /* ... */ },
          update: async ({
            listKey,
            operation,
            inputData,
            item,
            resolvedData,
            context,
            addValidationError,
          }) => { /* ... */ },
          delete: async ({
            listKey,
            operation,
            item,
            context,
            addValidationError,
          }) => { /* ... */ },
        },
      },
      fields: {
        someFieldName: text({
          hooks: {
            validate: {
              create: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                resolvedData,
                context,
                addValidationError,
              }) => { /* ... */ },
              update: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                item,
                resolvedData,
                context,
                addValidationError,
              }) => { /* ... */ },
              delete: async ({
                listKey,
                fieldKey,
                operation,
                item,
                context,
                addValidationError,
              }) => { /* ... */ },
            },
          },
        }),
      },
    }),
  },
});
```

### beforeOperation

The `beforeOperation` hook is used to perform side effects just before the data is saved to the database (for a `create` or `update` operation), or deleted from the database (for `delete` operations).

It is invoked after the `resolveInput` and `validate` hooks, but before the database is updated by Prisma.

| Argument       | Description                                                                                                                                                                                            |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listKey`      | The key of the list being operated on.                                                                                                                                                                 |
| `fieldKey`     | The key of the field being operated on (field hooks only).                                                                                                                                             |
| `operation`    | The operation being performed (`'create'`, `'update'`, or `'delete'`).                                                                                                                                 |
| `inputData`    | The value of `data` passed into the mutation. `undefined` for `delete` operations.                                                                                                                     |
| `item`         | The current value of the item being updated, `undefined` for `create` operations. This object is an internal database item. [DB API](../context/db-items) for more details on internal database items. |
| `resolvedData` | A [`resolved data`](#resolved-data-stages) object. The resolved data value after all data resolver stages have been completed. `undefined` for `delete` operations.                                    |
| `context`      | The [`KeystoneContext`](../context/overview) object of the originating GraphQL operation.                                                                                                              |

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      hooks: {
        beforeOperation: {
          create: async ({
            listKey,
            operation,
            inputData,
            resolvedData,
            context,
          }) => { /* ... */ },
          update: async ({
            listKey,
            operation,
            inputData,
            item,
            resolvedData,
            context,
          }) => { /* ... */ },
          delete: async ({
            listKey,
            operation,
            item,
            context,
          }) => { /* ... */ },
        },
      },
      fields: {
        someFieldName: text({
          hooks: {
            beforeOperation: {
              create: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                resolvedData,
                context,
              }) => { /* ... */ },
              update: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                item,
                resolvedData,
                context,
              }) => { /* ... */ },
              delete: async ({
                listKey,
                fieldKey,
                operation,
                item,
                context,
              }) => { /* ... */ },
            },
          },
        }),
      },
    }),
  },
});
```

### afterOperation

The `afterOperation` hook is used to perform side effects after the data has been saved to the database (for a `create` or `update` operation), or deleted from the database (for `delete` operations).

| Argument       | Description                                                                                                                                                                                                        |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listKey`      | The key of the list being operated on.                                                                                                                                                                             |
| `fieldKey`     | The key of the field being operated on (field hooks only).                                                                                                                                                         |
| `operation`    | The operation being performed (`'create'`, `'update'`, or `'delete'`).                                                                                                                                             |
| `inputData`    | The value of `data` passed into the mutation. `undefined` for `delete` operations.                                                                                                                                 |
| `originalItem` | The original value of the item being updated or deleted, `undefined` for `create` operations. This object is an internal database item. [DB API](../context/db-items) for more details on internal database items. |
| `item`         | The new value of the item being updated or created, `undefined` for `delete` operations. This object is an internal database item. [DB API](../context/db-items) for more details on internal database items.      |
| `resolvedData` | A [`resolved data`](#resolved-data-stages) object. The resolved data value after all data resolver stages have been completed. `undefined` for `delete` operations.                                                |
| `context`      | The [`KeystoneContext`](../context/overview) object of the originating GraphQL operation.                                                                                                                          |

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      hooks: {
        afterOperation: {
          create: async ({
            listKey,
            operation,
            inputData,
            item,
            resolvedData,
            context,
          }) => { /* ... */ },
          update: async ({
            listKey,
            operation,
            inputData,
            originalItem,
            item,
            resolvedData,
            context,
          }) => { /* ... */ },
          delete: async ({
            listKey,
            operation,
            originalItem,
            context,
          }) => { /* ... */ },
        },
      },
      fields: {
        someFieldName: text({
          hooks: {
            afterOperation: {
              create: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                item,
                resolvedData,
                context,
              }) => { /* ... */ },
              update: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                originalItem,
                item,
                resolvedData,
                context,
              }) => { /* ... */ },
              delete: async ({
                listKey,
                fieldKey,
                operation,
                originalItem,
                context,
              }) => { /* ... */ },
            },
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
