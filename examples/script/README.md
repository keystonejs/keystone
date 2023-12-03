## Base Project - Script

This project demonstrates how to write code to interact with Keystone without using the standard `@keystone-6/core/scripts/cli` tools.

The `getContext` function does not adhere to the typical Keystone entry-point and requires that your Prisma schema has been previously built by Keystone.

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm install` at the root of this repository, then navigate to this directory and run:

```shell
pnpm dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

Congratulations, you're now up and running with Keystone! 🚀

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/script>. You can also fork this sandbox to make your own changes.
