## Feature Example - Testing

This project demonstrates how to write tests against the GraphQL API to your Keystone system.
It builds on the [`withAuth()`](../with-auth) example project.

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm` at the root of the repository then navigate to this directory and run:

```shell
pnpm dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

This example project uses this library to add tests to the [`withAuth()`](../with-auth) example project. The tests can be found in [example-test.ts](./example-test.ts)

### Running tests

The project's `package.json` includes a script:

```
    "test": "node --loader tsx example-test.ts"
```

We can run the tests by running the command

```shell
pnpm test
```

which should give output ending with:

```
✔ Create a User using the Query API (139.404167ms)
✔ Check that trying to create user with no name (required field) fails (96.580875ms)
✔ Check access control by running updateTask as a specific user via context.withSession() (193.86275ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 0.072292
```

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/testing>. You can also fork this sandbox to make your own changes.
