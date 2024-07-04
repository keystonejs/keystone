---
title: "Testing"
description: "Learn how to write tests that check the behaviour of Keystone application."
---

When building a web application it's important to be able to test the behaviour of your system to ensure it does what you expect.
In this guide we'll show you how to use `@keystone-6/core/testing` and [Jest](https://jestjs.io/) to write tests to check the behaviour of your GraphQL API.

## What tests might look like

Typically you will use tests to verify the behaviour of your code.
You might typically test things like your access control, hooks, virtual fields et cetera.

```typescript
import { getContext } from '@keystone-6/core/context';
import { resetDatabase } from '@keystone-6/core/testing';
import * as PrismaModule from '.prisma/client';
import baseConfig from './keystone';

const dbUrl = `file:./test-${process.env.JEST_WORKER_ID}.db`;
const prismaSchemaPath = path.join(__dirname, 'schema.prisma');
const config = { ...baseConfig, db: { ...baseConfig.db, url: dbUrl } };

beforeEach(async () => {
  await resetDatabase(dbUrl, prismaSchemaPath);
});

const context = getContext(config, PrismaModule);

test('Your unit test', async () => {
  // ...
});
```

{% hint kind="tip" %}
We're setting the database url as `file:./test-${process.env.JEST_WORKER_ID}.db` so that our tests can use one database per Jest worker thread and run each test suite in parallel
{% /hint %}

### Context API

The [context API](../context/overview) lets you easily manipulate data in your system.
We can use the [Query API](../context/query) to ensure that we can do basic CRUD operations.

```typescript
const person = await context.query.Person.createOne({
  data: { name: 'Alice', email: 'alice@example.com', password: 'super-secret' },
  query: 'id name email password { isSet }',
});
expect(person.name).toEqual('Alice');
expect(person.email).toEqual('alice@example.com');
expect(person.password.isSet).toEqual(true);
```

This API works well when we expect an operation to succeed.
If we expect an operation to fail we can use the `context.graphql.raw` operation to check that both the `data` and `errors` returned by a query are what we expect.

```typescript
// Create user without the required `name` field
const { data, errors } = await context.graphql.raw({
  query: `mutation {
    createPerson(data: { email: "alice@example.com", password: "super-secret" }) {
      id name email password { isSet }
    }
  }`,
});
expect(data.createPerson).toBe(null);
expect(errors).toHaveLength(1);
expect(errors[0].path).toEqual(['createPerson']);
expect(errors[0].message).toEqual(
  'You provided invalid data for this operation.\n  - Person.name: Name must not be empty'
);
```

The `context.withSession()` function can be used to run queries as if you were logged in as a particular user.
This can be useful for testing the behaviour of your access control rules.
In the example below, the access control only allows users to update their own tasks.

```typescript
// Create some users
const [alice, bob] = await context.query.Person.createMany({
  data: [
    { name: 'Alice', email: 'alice@example.com', password: 'super-secret' },
    { name: 'Bob', email: 'bob@example.com', password: 'super-secret' },
  ],
});

// Create a task assigned to Alice
const task = await context.query.Task.createOne({
  data: {
    label: 'Experiment with Keystone',
    priority: 'high',
    isComplete: false,
    assignedTo: { connect: { id: alice.id } },
  },
});

// Check that we can't update the task when logged in as Bob
const { data, errors } = await context
  .withSession({ itemId: bob.id, data: {} })
  .graphql.raw({
    query: `mutation update($id: ID!) {
      updateTask(where: { id: $id }, data: { isComplete: true }) {
        id
      }
    }`,
    variables: { id: task.id },
  });
expect(data!.updateTask).toBe(null);
expect(errors).toHaveLength(1);
expect(errors![0].path).toEqual(['updateTask']);
expect(errors![0].message).toEqual(
  `Access denied: You cannot perform the 'update' operation on the item '{"id":"${task.id}"}'. It may not exist.`
);
```

## Related resources

{% related-content %}
{% well
heading="Example Project: Testing"
href="https://github.com/keystonejs/keystone/tree/main/examples/testing"
target="_blank" %}
Shows you how to write tests against the GraphQL API to your Keystone system. Builds on the Authentication example project.
{% /well %}
{% well
heading="Context API Reference"
href="/docs/context/overview" %}
The API for run-time functionality in your Keystone system. Use it to write business logic for access control, hooks, testing, GraphQL schema extensions, and more.
{% /well %}
{% well
heading="Query API Reference"
href="/docs/context/query" %}
A programmatic API for running CRUD operations against your GraphQL API. For each list in your system you get an API at `context.query.<listName>`.
{% /well %}
{% /related-content %}
