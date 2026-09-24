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

For writes inside `context.transaction()`, [transaction hooks](#transaction-hooks) provide additional callbacks after commit or rollback, without changing the timing of the existing operation hooks.

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
        },
        transaction: {
          afterCommit: async args => { /* ... */ },
          afterRollback: async args => { /* ... */ },
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
            },
            transaction: {
              afterCommit: async args => { /* ... */ },
              afterRollback: async args => { /* ... */ },
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
| `fieldKey`          | The key of the field being operated on (field hooks only).                                                                                                                            |
| `operation`         | The operation being performed (`'create'` or `'update'`).                                                                                                                             |
| `inputData`         | The value of `data` passed into the mutation.                                                                                                                                         |
| `inputFieldData`    | The value of the field from the input data (field hooks only).                                                                                                                        |
| `item`              | The currently stored item (`undefined` for `create` operations). This object is an internal database item. [DB API](../context/db-items) for more details on internal database items. |
| `itemField`         | The value of the field from the current item (field hooks only, `undefined` for `create` operations).                                                                                 |
| `resolvedData`      | A [`resolved data`](#resolved-data-stages) object. The resolved data value after default values, relationship resolvers, field resolvers, and `resolveInput` hooks have been applied. |
| `resolvedFieldData` | The resolved value for this specific field (field hooks only).                                                                                                                        |
| `context`           | The [`KeystoneContext`](../context/overview) object of the originating GraphQL operation.                                                                                             |

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
                inputFieldData,
                item,
                itemField,
                resolvedData,
                resolvedFieldData,
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
                inputFieldData,
                item,
                itemField,
                resolvedData,
                resolvedFieldData,
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
| `inputFieldData`          | The value of the field from the input data (field hooks only, `undefined` for `delete` operations).                                                                                                     |
| `item`                    | The current value of the item being updated (`undefined` for `create` operations). This object is an internal database item. [DB API](../context/db-items) for more details on internal database items. |
| `itemField`               | The value of the field from the current item (field hooks only, `undefined` for `create` operations).                                                                                                   |
| `resolvedData`            | A [`resolved data`](#resolved-data-stages) object (`undefined` for `delete` operations). The resolved data value after all data resolver stages have been completed.                                    |
| `resolvedFieldData`       | The resolved value for this specific field (field hooks only, `undefined` for `delete` operations).                                                                                                     |
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
                inputFieldData,
                resolvedData,
                resolvedFieldData,
                context,
                addValidationError,
              }) => { /* ... */ },
              update: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                inputFieldData,
                item,
                itemField,
                resolvedData,
                resolvedFieldData,
                context,
                addValidationError,
              }) => { /* ... */ },
              delete: async ({
                listKey,
                fieldKey,
                operation,
                item,
                itemField,
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
| `listKey`           | The key of the list being operated on.                                                                                                                                                                 |
| `fieldKey`          | The key of the field being operated on (field hooks only).                                                                                                                                             |
| `operation`         | The operation being performed (`'create'`, `'update'`, or `'delete'`).                                                                                                                                 |
| `inputData`         | The value of `data` passed into the mutation. `undefined` for `delete` operations.                                                                                                                     |
| `inputFieldData`    | The value of the field from the input data (field hooks only, `undefined` for `delete` operations).                                                                                                    |
| `item`              | The current value of the item being updated, `undefined` for `create` operations. This object is an internal database item. [DB API](../context/db-items) for more details on internal database items. |
| `itemField`         | The value of the field from the current item (field hooks only, `undefined` for `create` operations).                                                                                                  |
| `resolvedData`      | A [`resolved data`](#resolved-data-stages) object. The resolved data value after all data resolver stages have been completed. `undefined` for `delete` operations.                                    |
| `resolvedFieldData` | The resolved value for this specific field (field hooks only, `undefined` for `delete` operations).                                                                                                    |
| `context`           | The [`KeystoneContext`](../context/overview) object of the originating GraphQL operation.                                                                                                              |

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
                inputFieldData,
                resolvedData,
                resolvedFieldData,
                context,
              }) => { /* ... */ },
              update: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                inputFieldData,
                item,
                itemField,
                resolvedData,
                resolvedFieldData,
                context,
              }) => { /* ... */ },
              delete: async ({
                listKey,
                fieldKey,
                operation,
                item,
                itemField,
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

When called through `context.transaction()`, this hook still runs **inside** the transaction.
Keep related database work here. For external side effects that must wait for a successful commit, use [`transaction.afterCommit`](#transaction-hooks).

| Argument       | Description                                                                                                                                                                                                        |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listKey`              | The key of the list being operated on.                                                                                                                                                                             |
| `fieldKey`             | The key of the field being operated on (field hooks only).                                                                                                                                                         |
| `operation`            | The operation being performed (`'create'`, `'update'`, or `'delete'`).                                                                                                                                             |
| `inputData`            | The value of `data` passed into the mutation. `undefined` for `delete` operations.                                                                                                                                 |
| `inputFieldData`       | The value of the field from the input data (field hooks only, `undefined` for `delete` operations).                                                                                                                |
| `originalItem`         | The original value of the item being updated or deleted, `undefined` for `create` operations. This object is an internal database item. [DB API](../context/db-items) for more details on internal database items. |
| `originalItemField`    | The value of the field from the original item (field hooks only, `undefined` for `create` operations).                                                                                                             |
| `item`                 | The new value of the item being updated or created, `undefined` for `delete` operations. This object is an internal database item. [DB API](../context/db-items) for more details on internal database items.      |
| `itemField`            | The value of the field from the new item (field hooks only, `undefined` for `delete` operations).                                                                                                                  |
| `resolvedData`         | A [`resolved data`](#resolved-data-stages) object. The resolved data value after all data resolver stages have been completed. `undefined` for `delete` operations.                                                |
| `resolvedFieldData`    | The resolved value for this specific field (field hooks only, `undefined` for `delete` operations).                                                                                                                |
| `context`              | The [`KeystoneContext`](../context/overview) object of the originating GraphQL operation.                                                                                                                          |

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
                inputFieldData,
                item,
                itemField,
                resolvedData,
                resolvedFieldData,
                context,
              }) => { /* ... */ },
              update: async ({
                listKey,
                fieldKey,
                operation,
                inputData,
                inputFieldData,
                originalItem,
                originalItemField,
                item,
                itemField,
                resolvedData,
                resolvedFieldData,
                context,
              }) => { /* ... */ },
              delete: async ({
                listKey,
                fieldKey,
                operation,
                originalItem,
                originalItemField,
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

### Transaction hooks

Lists and fields support `hooks.transaction.afterCommit` and `hooks.transaction.afterRollback` for writes made through an explicit [`context.transaction()`](../context/overview#transactions).
Each accepts either one callback for all operations or an object with `create`, `update`, and `delete` callbacks, just like `afterOperation`.

```typescript
hooks: {
  afterOperation: {
    create: async ({ context, item }) => {
      // Related database writes belong here, using this same context.
      await context.db.Audit.createOne({ data: { message: `Created ${item.id}` } });
    },
  },
  transaction: {
    afterCommit: {
      create: async ({ item }) => {
        await notifyExternalService(item.id);
      },
    },
    afterRollback: ({ operation, error }) => {
      console.error(`Transaction containing ${operation} failed`, error);
    },
  },
}
```

#### Timing and ordering

Keystone registers one event immediately after each successful create, update, or delete write, before `afterOperation` runs.
Failed validation and failed database writes do not register an event for that item.
Successful nested creates do register, even if a later parent operation or `afterOperation` fails.
Existing `beforeOperation` and `afterOperation` behavior is unchanged: they are awaited inside the transaction and may perform database consistency work there.

`afterCommit` callbacks run only after Prisma's transaction promise fulfills, not merely when an individual mutation or the transaction's user callback finishes.
`afterRollback` callbacks run after that promise rejects, with the original rejection value as `error` (`unknown` in TypeScript).
Both phases are awaited before `context.transaction()` settles with its caller.

Events run sequentially in registration order: the order in which successful writes finish.
Concurrent mutations do not have a guaranteed registration order.
For each event, eligible field hooks run in parallel before the list hook.
Create/update field hooks run only for fields present in the submitted input; delete runs all field hooks.
All registered callbacks are attempted, including the list hook when a field callback fails and later events when an earlier event fails.
This differs intentionally from the existing operation hooks' field-error short circuit.

Repeated updates to the same item produce separate events; there is no automatic deduplication or batching.
A create followed by a delete in the same transaction still produces both events.

#### Arguments and callback context

The argument shapes match `afterOperation`, including `fieldKey`, `itemField`, `originalItemField`, `inputFieldData`, and `resolvedFieldData` for field hooks.
Rollback callbacks additionally receive `error`.

| Operation | `item` | `originalItem` | `inputData` / `resolvedData` |
| :-- | :-- | :-- | :-- |
| Create | Snapshot returned by the write | `undefined` | Operation input / resolved input snapshots |
| Update | Snapshot returned by the write | Pre-update item snapshot | Operation input / resolved input snapshots |
| Delete | `undefined` | Deleted item snapshot | `undefined` |

Snapshots are captured at registration, before later hooks or operations can mutate the data.
They are not a fresh query of the final database state: an item may have been changed or deleted again before commit.
On rollback, they describe attempted writes, not items that necessarily exist after rollback.
Treat snapshots as read-only. Plain objects, arrays and database scalar values (including dates, bytes, big integers and decimals) are copied without converting them to JSON.
Opaque custom scalar instances, functions, and upload promises/streams retain their identity; they are not replayable snapshots and must not be mutated after registration.

Each operation's callbacks receive a new, non-transactional context backed by the root Prisma client, so database queries work after settlement.
It preserves the originating operation's request/response references, session data, and `internal()`/`sudo()` privileges—not those of whichever context opened the transaction.
Derived contexts made with `sudo()`, `internal()`, `withSession()`, and `withRequest()` share the transaction's registration queue.
Arbitrary properties added to a context are not copied to callback contexts.
Callback queries observe the database at callback time, and callback writes are new, independent writes.

#### Errors and limitations

- Commit callback failures are aggregated as `KS_EXTENSION_ERROR` tagged `transaction.afterCommit`. The transaction call rejects, but its data is **already committed**; rollback callbacks do not run. Do not blindly retry the entire transaction on this error.
- Rollback callback failures are aggregated as `transaction.afterRollback` extension errors and logged to the server console. The original transaction rejection is rethrown unchanged.
- Outside an explicit `context.transaction()`, neither transaction hook runs. Ordinary mutations retain their existing hooks and behavior; Keystone does not introduce implicit transactions or make bulk/nested operations atomic. Applications must explicitly wrap writes that need this lifecycle.
- Raw `context.prisma` writes do not generate Keystone item-hook events, even inside `context.transaction()`.
- `context.graphql.raw()` can return errors without throwing. If the transaction callback returns normally and Prisma commits, registered events run their commit callbacks. Use `context.graphql.run()` or explicitly throw on returned errors when rollback is required.
- Nested `context.transaction()` calls are unsupported; this API does not add savepoints. Await all operations before returning from the transaction callback.
- These are in-process callbacks, not durable delivery. A process crash after commit can prevent callbacks from completing. There are no automatic retries or delivery guarantees; use an application-managed transactional outbox when durable delivery is required.

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
