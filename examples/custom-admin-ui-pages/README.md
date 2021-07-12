## Feature Example - Custom Components for the Admin UI

This project demonstrates how to create a custom page in the Admin UI.
It builds on the [Task Manager](../task-manager) starter project.

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

This project leverages the `/admin/pages` directory. As elaborated on in the [Custom Pages](https://keystonejs.com/docs/guides/custom-admin-ui-pages) guide, this directory is used to generate additional routes in the Admin UI, a behaviour inherited from `Next.js`. The default export of files in this directory are expected to be **React Components**.
**All other exports are ignored**
