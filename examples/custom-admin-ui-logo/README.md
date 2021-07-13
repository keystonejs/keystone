## Feature Example - Custom Components for the Admin UI

This project demonstrates how to create a custom logo in the Admin UI.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).

You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

🚀 Congratulations, you're now up and running with Keystone!

## admin/pages

This project shows how to export custom components to be rendered in the Admin UI via the `/admin/config` file. As elaborated on in the [Custom Admin UI Logo](https://keystonejs.com/docs/guides/custom-admin-ui-logo) guide, the named `components` export of this file is used to replace specific components for use in the Admin UI.

If you have specific components you think should also be exposed from this config, please let us know on [Slack](https://community.keystonejs.com)
