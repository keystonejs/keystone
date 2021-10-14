## Feature Example - Using Nexus to extend the GraphQL API

This project demonstrates how to use [Nexus](https://nexusjs.org) to extend the GraphQL API provided by Keystone with custom queries and mutations. It builds on the [Blog](../blog) starter project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a Apollo Sandbox at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

### Watching for Nexus schema changes

Nexus is designed to be hot-reloaded in development, because it generates types as you code. Keystone doesn't support hot reloading so there's a separate command that starts a dev process specifically for Nexus:

```shell
yarn dev-nexus
```

We recommend running this in a separate terminal window at the same time as the Keystone `dev` script.

## Features

This project demonstrates how to integrate Nexus with Keystone and use it to extend the GraphQL API. For a simpler version without Nexus, see the [Extend GraphQL Schema](../extend-graphql-schema) example.

## Current Limitations

Ideally, we could tell Nexus about the GraphQL types Keystone generates so you could write Nexus fields that return Keystone types. Making this work requires more research, so the example currently creates a separate `NexusPost` type and uses Prisma to query posts from the database.
