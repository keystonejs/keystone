## Feature Example - Testing

This project demonstrates how to write tests against the GraphQL API to your Keystone system.
It builds on the [`withAuth()`](../with-auth) example project.

## Instructions

To run this project, clone the Keystone repository locally, run `yarn` at the root of the repository then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

Keystone provides a testing library in [`@keystone-6/core/testing`](https://keystonejs.com/guides/testing) which helps you write tests using [Jest](https://jestjs.io/).
This example project uses this library to add tests to the [`withAuth()`](../with-auth) example project. The tests can be found in [example.test.ts](./example.test.ts)

### Running tests

The project's `package.json` includes a script:

```
    "test": "jest"
```

We can run the tests by running the command

```shell
yarn test
```

which should give output ending with:

```
 PASS  ./example.test.ts
  ✓ Create a Person using the Query API (183 ms)
  ✓ Check that trying to create user with no name (required field) fails (116 ms)
  ✓ Check access control by running updateTask as a specific user via context.withSession() (198 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.316 s, estimated 5 s
Ran all test suites.
```

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/testing>. You can also fork this sandbox to make your own changes.
