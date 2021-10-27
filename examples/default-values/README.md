## Feature Example - Default Values

This project demonstrates how to use default values for fields.
It builds on the [Task Manager](../task-manager) starter project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

This project demonstrates how to use default values for fields.
Default values are set using the [`defaultValue`](https://keystonejs.com/docs/apis/fields#scalar-types) argument on fields.
They are applied by Keystone when an object is created and no value is supplied for the field.
There are two types of default values in Keystone; `static`, and `dynamic`.

### Static

`Static` default values are set using a fixed value as the `defaultValue` argument.
We use a static default to set the `isComplete` state to `false` when a new task is created.

```typescript
      isComplete: checkbox({ defaultValue: false }),
```

### Dynamic

`Dynamic` default values are set using a function as `defaultValue` argument.
This function is evaluated when the item is created.
The function recieves two arguments, `originalInput` and `context`.

We use `originalInput`, which contains the input passed to the GraphQL create mutation, to set the priority of the task.

```typescript
      priority: select({
        dataType: 'enum',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
        // Dynamic default: Use the label field to determine the priority
        defaultValue: ({ originalInput }) => {
          if (originalInput.label && originalInput.label.toLowerCase().includes('urgent')) {
            return 'high';
          } else {
            return 'low';
          }
        },
      }),
```

We use [`context`](https://keystonejs.com/docs/apis/context) along with the [Query API](https://keystonejs.com/docs/apis/query) to set the default assignee of a task to be a user named `"Anonymous"`.

```typescript
      assignedTo: relationship({
        ref: 'Person.tasks',
        many: false,
        // Dynamic default: Find an anonymous user and assign the task to them
        defaultValue: async ({ context }) => {
          const anonymous = await context.query.Person.findMany({
            where: { name: 'Anonymous' },
          });
          if (anonymous.length > 0) {
            return { connect: { id: anonymous[0].id } };
          }
          // If we don't have an anonymous user return undefined so as not to apply any default
        },
      }),
```
