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

## Exporting custom components

This project shows how to export a custom logo to be rendered in the Admin UI via the [`/admin/config.tsx`](./admin/config.tsx) file. As elaborated on in the [Custom Logo](https://keystonejs.com/docs/guides/custom-admin-ui-logo) guide, the named `components` export of this file is used to replace specific components for use in the Admin UI.

If you have specific components you think should also be exposed from this config, please let us know on [Slack](https://community.keystonejs.com)

**NOTE** The Keystone monorepo leverages a babel config that means we use the old jsx transform (this doesn't have an impact on the code we ship to npm).
This is why there are `import React from 'react'` statements in our examples. This is NOT necessary outside of the Keystone repo (unless you have a babel config with the old jsx transform which is currently the default with @babel/preset-react) as you'll be using Next.js' babel config which uses the new jsx transform.
