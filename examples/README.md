# Keystone Examples

👋 Welcome to the Keystone Example Projects – a collection of projects that demonstrate Keystone features.

You can use these as jumping off point when adding features to your own Keystone project.

## Base Projects

There are two base projects which all other projects build on:

- [`task-manager`](./task-manager)
- [`blog`](./blog)

They have very simple schemas and none of the bells or whistles you'd expect in a complete project. You can use these as a starting point for general experimentation in a clean environment.

## Feature Projects

Each project below demonstrates a Keystone feature you can learn about and experiment with.

- [`withAuth()`](./with-auth): Adds password-based authentication to the Task Manager base.
- [JSON field](./json): Adds a JSON field to the Task Manager base.
- [`defaultValue`](./default-values): Adds default values to the Blog base.
- [`extendGraphqlSchema`](./extend-graphql-schema): Extends the GraphQL API of the Blog base.
- [`extendGraphqlSchema` with graphql-ts](./extend-graphql-schema-graphql-ts): Extends the GraphQL API of the Blog base with [graphql-ts](https://github.com/Thinkmill/graphql-ts).
- [`extendGraphqlSchema` with Nexus](./extend-graphql-schema-nexus): Extends the GraphQL API of the Blog base with [Nexus](https://nexusjs.org/).
- [Virtual field](./virtual-field): Adds virtual fields to the Blog base.
- [Document field](./document-field): Adds document fields to the Blog base.
- [Testing](./testing): Adds tests with `@keystone-next/keystone/testing` to the `withAuth()` example.
- [Custom field](./custom-field): Adds a custom `stars` field to the Blog base.
- [Custom field view](./custom-field-view): Adds a custom Admin UI view to a `json` field to the Task Manager base.
- [Custom Admin UI logo](./custom-admin-ui-logo): Adds a custom logo in the Admin UI to the Task Manager base.
- [Custom Admin UI pages](./custom-admin-ui-pages): Adds a custom page in the Admin UI to the Task Manager base.

## Running examples

To run an example, clone this repo and run the following commands:

```shell
yarn
cd examples/<feature>
yarn dev
```

If everything works 🤞 the GraphQL Server and Admin UI will start on [localhost:3000](http://localhost:3000).
See the README in each example for more specific details.

## Getting in touch

If you have trouble running these examples, or find a bug, please open an issue and tag it with the `examples` tag on GitHub.

Otherwise if you want to ask questions or have a chat with us, join us in [Slack](http://slack.keystonejs.com/)!

Follow [@KeystoneJS](https://twitter.com/keystonejs) on Twitter for updates.
