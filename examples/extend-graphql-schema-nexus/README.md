## Feature Example - Using Nexus to extend the GraphQL API

![KeystoneJS and Nexus logos](keystone-nexus.png)

This project demonstrates how to use [Nexus](https://nexusjs.org) to extend the GraphQL API provided by Keystone with custom queries and mutations. It builds on the [Blog](../blog) starter project.

## Instructions

To run this project, clone the Keystone repository locally, run `yarn` at the root of the repository then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

This project demonstrates how to integrate Nexus with Keystone and use it to extend the GraphQL API. For a simpler version without Nexus, see the [Extend GraphQL Schema](../extend-graphql-schema) example.

The Nexus schema is defined in [`/nexus`](./nexus/index.ts). It's loosely inspired by the [Nexus Tutorial](https://nexusjs.org/docs/getting-started/tutorial/chapter-setup-and-first-query)

The resulting schema is then merged into Keystone's schema using [`@graphql-tools/schema`](https://www.graphql-tools.com/docs/schema-merging#getting-started)

## Current Limitations

Ideally, we could tell Nexus about the GraphQL types Keystone generates so you could write Nexus fields that return Keystone types. Making this work requires more research, so the example currently creates a separate `NexusPost` type and uses Prisma to query posts from the database.

There's also a Prisma plugin for Nexus in development here: <https://github.com/prisma/nexus-prisma>

When it's ready, it would make a good addition to this example (showing how to integrate the Prisma plugin with the Keystone-generated Prisma schema to auto-generate Nexus schema)
