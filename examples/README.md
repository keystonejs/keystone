# Keystone Examples

👋 Welcome to the Keystone Example Projects – a collection of projects that demonstrate how to use Keystone.

You'll find two types of examples —

1. Feature examples

These are standalone keystone examples that demonstrate specific use cases and can usually be deployed to [codesandbox](https://codesandbox.io) with a single click to take a quick peek at the demo.

2. E2E examples

These examples showcase how Keystone works with other tools and frameworks and usually have a separate frontend and keystone setup that need to run simultaneously for the example to work.

## Feature Examples

- [Task Manager](./task-manager): A simple task manager with Keystone
- [Blog](./blog): A simple blog with Keystone
- [Authentication](./with-auth): Add password-based authentication.
- [Redis session store](./redis-session-store): Add password-based authentication with a Redis session store.
- [Role based access control](./roles): Control list access based on user roles.
- [JSON field](./json): JSON field in schema.
- [`defaultValue`](./default-values): Default values in schema.
- [`extendGraphqlSchema`](./extend-graphql-schema): Extending the GraphQL API.
- [`extendGraphqlSchema` with graphql-ts](./extend-graphql-schema-graphql-ts): Extend the GraphQL API with [graphql-ts](https://github.com/Thinkmill/graphql-ts).
- [`extendGraphqlSchema` with Nexus](./extend-graphql-schema-nexus): Extend the GraphQL API with [Nexus](https://nexusjs.org/).
- [`virtual` field](./virtual-field): Virtual field in schema.
- [`document` field](./document-field): Document field in schema.
- [Testing](./testing): Add tests with `@keystone-6/core/testing`.
- [Custom field](./custom-field): Custom field in schema.
- [Custom field view](./custom-field-view): Add a custom Admin UI view to a `json` field.
- [Custom Admin UI logo](./custom-admin-ui-logo): Add a custom logo in the Admin UI.
- [Custom Admin UI navigation](./custom-admin-ui-navigation): Add a custom navigation in the Admin UI.
- [Custom Admin UI pages](./custom-admin-ui-pages): Add a custom page in the Admin UI.
- [REST API](./rest-api): Add custom REST API endpoints
- [Storage config "local"](./assets-local): Store assets locally
- [Storage config "S3"](./assets-s3): Store assets in S3
- [Custom session validation](./assets-s3): Customise session validation
- [GraphQL subscription](./extend-graphql-subscriptions): Extend GraphQL schema to add subscriptions

## E2E Examples

- none yet

_Note: Some current feature examples are E2E examples with keystone and next in the same dir. We're gonna update them soon._

## Running examples

### In your CLI

To run an example, clone this repo and run the following commands:

```shell
yarn
cd examples/<name>
yarn dev
```

If everything works 🤞 the GraphQL Server and Admin UI will start on [localhost:3000](http://localhost:3000).
See the README in each example for more specific details.

### In CodeSandbox

You can also run our examples from your web browser using the free CodeSandbox service. Just look for the "Try it out in CodeSandbox 🧪" heading in each example project’s README ([example](https://github.com/keystonejs/keystone/tree/main/examples/task-manager#try-it-out-in-codesandbox-)).

## Getting in touch

If you have trouble running these examples, or find a bug, please open an issue and tag it with the `examples` tag on GitHub.

Otherwise if you want to ask questions or have a chat with us, join us in [Slack](http://slack.keystonejs.com/)!

Follow [@KeystoneJS](https://twitter.com/keystonejs) on Twitter for updates.
