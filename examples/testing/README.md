## Feature Example - Testing

This project demonstrates how to write tests against the GraphQL API to your Keystone system.
It builds on the [`withAuth()`](../with-auth) example project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

Keystone provides a testing library in [`@keystone-next/keystone/testing`](https://keystonejs.com/guides/testing) which helps you write tests using [Jest](https://jestjs.io/).
This example project uses this library to add tests to the [`withAuth()`](../with-auth) example project. The tests can be found in [example.test.ts](./example.test.ts)

### Running tests

The project's `package.json` includes a script:

```
    "test": "jest --runInBand --testTimeout=60000"
```

We set `--runInBand` to ensure that tests are not run in parallel. All the tests share a single database which they need to reset, so running the tests in parallel will result in undefined behaviour.

We can run the tests by running the command

```shell
yarn test
```

which should give output ending with:

```
 PASS  ./example.test.ts (14.245 s)
  Example tests using test runner
    ✓ Create a Person using the Query API (3820 ms)
    ✓ Create a Person using a hand-crafted GraphQL query sent over HTTP (780 ms)
    ✓ Check that trying to create user with no name (required field) fails (722 ms)
    ✓ Check access control by running updateTask as a specific user via context.withSession() (759 ms)
  Example tests using test environment
    ✓ Check that the persons password is set (4 ms)
    ✓ Update the persons email address (10 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        14.332 s
Ran all test suites.
✨  Done in 17.14s.
```

### Test runner

The function `setupTestRunner` takes the project's `KeystoneConfig` object and creates a `runner` function. This test runner is then used to wrap a test function.

```typescript
import { setupTestRunner } from '@keystone-next/keystone/testing';
import config from './keystone';

const runner = setupTestRunner({ config });

describe('Example tests using test runner', () => {
  test(
    'Create a Person using the Query API',
    runner(async ({ context }) => {
      ...
    })
  );
});
```

For each test, the runner will connect to the database and drop all the data so that the test can run in a known state, and also handle disconnecting from the database after the test.

#### `context`

The test runner provides the test function with a [`KeystoneContext`](https://keystonejs.com/docs/apis/context) argument called `context`. This is the main API for interacting with the Keystone system. It can be used to read and write data to the system and verify that the system is behaving as expected.

```typescript
test(
  'Create a Person using the Query API',
  runner(async ({ context }) => {
    const person = await context.query.Person.createOne({
      data: { name: 'Alice', email: 'alice@example.com', password: 'super-secret' },
      query: 'id name email password { isSet }',
    });
    expect(person.name).toEqual('Alice');
    expect(person.email).toEqual('alice@example.com');
    expect(person.password.isSet).toEqual(true);
  })
);
```

#### `graphQLRequest`

The test runner also provides the function with an argument `graphQLRequest`, which is a [`supertest`](https://github.com/visionmedia/supertest) request configured to accept arguments `{ query, variable, operation }` and send them to your GraphQL API. You can use the `supertest` API to set additional request headers and to check that the response returned is what you expected.

```typescript
test(
  'Create a Person using a hand-crafted GraphQL query sent over HTTP',
  runner(async ({ graphQLRequest }) => {
    const { body } = await graphQLRequest({
      query: `mutation {
        createPerson(data: { name: "Alice", email: "alice@example.com", password: "super-secret" }) {
          id name email password { isSet }
        }
      }`,
    }).expect(200);
    const person = body.data.createPerson;
    expect(person.name).toEqual('Alice');
    expect(person.email).toEqual('alice@example.com');
    expect(person.password.isSet).toEqual(true);
  })
);
```

### Test environment

The function `setupTestEnv` is used to set up a test environment which can be used across multiple tests.

```typescript
import { KeystoneContext } from '@keystone-next/keystone/types';
import { setupTestEnv, TestEnv } from '@keystone-next/keystone/testing';
import config from './keystone';

describe('Example tests using test environment', () => {
  let testEnv: TestEnv, context: KeystoneContext;
  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;

    await testEnv.connect();

    // Perform any setup such as data seeding here.
  });
  afterAll(async () => {
    await testEnv.disconnect();
  });

  test('Check that the persons password is set', async () => {
    ...
  });
});
```

`setupTestEnv` will connect to the database and drop all the data so that the test can run in a known state, returning a value `testEnv` which contains `{ connect, disconnect, testArgs }`.
The value `testArgs` contains the same values that are passed into test functions by the test runner.
The `connect` and `disconnect` functions are used to connect to the database before the tests run, then disconnect once all tests have completed.
