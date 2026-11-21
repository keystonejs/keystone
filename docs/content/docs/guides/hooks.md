---
title: "Hooks"
description: "Learn how to use Keystone’s Hooks API to enhance your core operations with custome business logic."
---

Keystone provides a powerful CRUD GraphQL API which lets you perform basic operations on your data.
As your system evolves you'll find that you need to include business logic alongside these operations.

In this guide we'll show you how to use `hooks` to enhance the core operations in different ways.
For full details of the function signatures, please check out the [Hooks API](../config/hooks).

## What is a hook?

A hook is a function you define as part of your [schema configuration](../config/lists) which is executed when a GraphQL operation is performed.
Let's look at a basic example to log a message to the console whenever a new user is created.

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
        email: text(),
       },
      hooks: {
        afterOperation: ({ operation, item }) => {
          if (operation === 'create') {
            console.log(`New user created. Name: ${item.name}, Email: ${item.email}`);
          }
        }
      },
    }),
  },
});
```

This function will be triggered whenever we execute a `create`, `update`, or `delete` mutation in our GraphQL API.
It will be executed once for each item being operated on.
Because we only want to log when a user is created, we check the value of the `operation` argument.
We then use the `item` argument to get the value of the newly created user.

Now that we've got a sense of what a hook is, let's look at how we can use hooks to solve some common problems you'll hit when creating your system.

## Modifying incoming data

When a `create` or `update` operation is called, you might want to apply some pre-processing to the data before saving it to your database.
For example, if you have a blog post, you might want to ensure that the `title` field always starts with an upper-case letter.
The `resolveInput` hook lets us take the data which has been provided to the GraphQL mutation and modify it before it is saved.

Let's write a hook which takes the data for a blog post and converts the first letter to upper-case.

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    Post: list({
      fields: {
        title: text({ validation: { isRequired: true } }),
        content: text({ validation: { isRequired: true } }),
       },
      hooks: {
        resolveInput: ({ resolvedData }) => {
          const { title } = resolvedData;
          if (title) {
            return {
              ...resolvedData,
              // Ensure the first letter of the title is capitalised
              title: title[0].toUpperCase() + title.slice(1)
            }
          }
          // We always return resolvedData from the resolveInput hook
          return resolvedData;
        }
      },
    }),
  },
});
```

{% hint kind="tip" %}
We must always return the modified `resolvedData` value from our hook, even if we didn't end up changing it.
{% /hint %}

The `resolveInput` hook is called whenever we update or create an item.
The value of `resolvedData` will contain the input provided to the mutation itself, with any field type input resolvers applied.
For example, a `password` field will convert the provided text input into an encrypted hash value.
If you just want to see what the original input was, before the field type resolvers were applied, you can use the `inputData` argument.

If you're performing an update operation, you might also want to access the current value of the item stored in the database.
This is available as the `item` argument.

Finally, all hooks are provided with a `context` argument, which gives you access to the full [context API](../context/overview).

## Validating inputs

Before writing the resolved data to the database you will often want to check that it conforms to certain rules, depending on your application's needs.
For example, you might want to ensure that blog posts do not have a blank title.
An empty string, `""`, is a perfectly valid `String` value to pass into GraphQL.
In the following example, we use a validation hook to check that this value is rejected when creating or updating a Post.

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    Post: list({
      fields: {
        title: text({ validation: { isRequired: true } }),
        content: text({ validation: { isRequired: true } }),
       },
      hooks: {
        validate: ({ resolvedData, addValidationError }) => {
          const { title } = resolvedData;
          if (title === '') {
            addValidationError('The title of a blog post cannot be the empty string');
          }
        }
      },
    }),
  },
});
```

A `validate` hook is passed the `resolvedData` value after defaults and `resolveInput` hooks have been completed.

We can check the values on this object and use the function `addValidationError` to return error messages.
You use `addValidationError` multiple times to capture different problems.

Keystone will abort the operation and convert these error messages into GraphQL errors which will be returned to the caller.

The `validate` hook also receives the `operation`, `inputData`, `item` and `context` arguments if you want to perform more advanced checks.

{% hint kind="warn" %}
Don't confuse data **validation** with **access control**. If you want to check whether a user is **allowed** to do something, you should set up [access control rules](../config/access-control).
{% /hint %}

## Triggering side-effects

When data is changed in our system we might want to trigger some external side-effect.
For example, we might want to send a welcome email to a user when they first create their account.
If a write can be part of a transaction, send the email from `transaction.afterCommit`, not `afterOperation`.
Keep related database consistency work in `afterOperation`, where it can still participate in the transaction.
For example, create an audit record during signup and notify the user only after commit:

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
// Keystone leaves it up to you to decide how best to implement email in your system
import { sendWelcomeEmail } from './lib/welcomeEmail';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
        email: text(),
       },
      hooks: {
        afterOperation: {
          create: async ({ context, item }) => {
            await context.db.SignupAudit.createOne({ data: { userId: item.id } });
          },
        },
        transaction: {
          afterCommit: {
            create: async ({ item }) => {
              await sendWelcomeEmail(item.name, item.email);
            },
          },
          afterRollback: ({ error }) => {
            console.error('Signup transaction rolled back', error);
          },
        },
      },
    }),
    SignupAudit: list({
      fields: { userId: text() },
    }),
  },
});
```

Use an explicit transaction for the signup:

```typescript
await context.transaction(async tx => {
  await tx.db.User.createOne({ data: { name: 'Ada', email: 'ada@example.com' } });
  // Any error thrown here rolls back both User and SignupAudit. No welcome email is sent.
});
```

Transaction hooks do not run for ordinary mutations outside `context.transaction()`. There is no implicit transaction around bulk or nested operations.
Raw `context.prisma` writes also bypass these item hooks.

The `beforeOperation` and `afterOperation` hooks are very similar, but serve slightly different purposes.
The `beforeOperation` hook receives an `item` argument, which contains the currently stored in the database before the operation.
In the `afterOperation` hook, `item` represents the newly updated data in the database, and the original data from before the update is provided as `originalItem`.
In a `create` operation, there won't be a pre-existing item, and for `delete` operations, the value of `item` in the `afterOperation` hook will be `undefined`.

If the `beforeOperation` hook throws an exception then the operation will return an error, and the data will not be saved to the database.
Outside an explicit transaction, an `afterOperation` failure cannot undo an already completed write.
Inside a transaction, propagating that error rejects the transaction and rolls back its writes.
Do not move database consistency work out of `afterOperation` just to delay notifications.

Transaction callbacks receive operation snapshots, not necessarily the final state of an item that was changed again in the same transaction.
Rollback snapshots describe attempted writes, not proof that an item exists after rollback.
Their context preserves the originating operation's session and privileges but uses the root Prisma client, so it remains usable after settlement.

All registered callbacks are attempted. A commit callback failure rejects the transaction call even though the database has already committed; it cannot undo the write or trigger rollback callbacks.
Rollback callback failures are logged without replacing the original transaction error.
Callbacks are per operation, without automatic deduplication, batching, or retries.
They are in-process and can be lost if the process crashes after commit; use a transactional outbox for durable delivery.
See the [transaction hook reference](../config/hooks#transaction-hooks) for ordering, field selection, snapshot limitations, and error details.

## List hooks vs field hooks

All of the examples above have involved hooks associated with a particular list.
Keystone also supports setting of hooks associated with a particular field.
All the same hooks are available, and they receive all the same arguments, along with an extra `fieldKey` argument.

Field hooks can be useful if you want to have field specific rules.
For example, you might have an email validation function which want to use in your system.
You could always write this as a list hook, but it will make your code more clear if you write this as a field hook.

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
        email: text({
          validation: { isRequired: true },
          hooks: {
            validate: ({ addValidationError, resolvedData, fieldKey }) => {
              const email = resolvedData[fieldKey];
              if (email !== undefined && email !== null && !email.includes('@')) {
                addValidationError(`The email address ${email} provided for the field ${fieldKey} must contain an '@' character`);
              }
            },
          },
        }),
       },
    }),
  },
});
```

See the [Hooks API](../config/hooks) for the details of all the arguments available for all the different hook functions.

## Related resources

{% related-content %}
{% well heading="Hooks API Reference" href="/docs/config/hooks" %}
The complete reference for executing code at different stages of the mutation lifecycle
{% /well %}
{% /related-content %}
