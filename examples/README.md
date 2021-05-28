# Keystone Examples

Welcome to the Keystone Example Projects 👋.
Here you'll find a collection of projects which show off the various features in Keystone.

You can use these examples as a jumping off point for adding features to your own Keystone project.

## Base Projects

There are two base projects which all the other examples build off.
The [`task-manager`](./task-manager) project is a basic task management application, while the [`blog`](./blog) project is a basic blogging app.

These projects have very simple schemas and none of the bells or whistles you'd expect in a complete project.
You can use these as a starting point for general experimentation in a clean environment.

## Feature Examples

Each of the examples below demonstrates a particular feature of Keystone.
You can use these projects to learn about, and experiment with specific features.

- [`withAuth()`](./with-auth): Adding password based authentication to your Keystone application.
- [`JSON field`](./json): Using a JSON field in your Keystone application.
- [`defaultValue`](./default-values): Using `defaultValue` to set default values on fields in your data schema.
- [`extendGraphqlSchema](./extend-graphql-schema): Using `config.extendGraphqlSchema` to extend your GraphQL API.

## Running examples

To run an example you should clone this repo and then run the following commands:

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
