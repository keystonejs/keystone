## Base Project - Script

This project demonstrates how to write code to interact with Keystone without using the standard `@keystone-6/core/scripts/cli` tools.

The `getContext` function does not adhere to the typical Keystone entry-point and requires that your Prisma schema has been previously built by Keystone.

This example requires Node.js 22.18 or newer because it uses Node.js's built-in TypeScript support.

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm install` at the root of this repository, then navigate to this directory and run:

```shell
pnpm dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

Once the generated Prisma client and Keystone types exist, run the standalone script in another terminal:

```shell
pnpm go
```

You can generate those artifacts without starting the development server by running `pnpm keystone postinstall` first.

Congratulations, you're now up and running with Keystone! 🚀
