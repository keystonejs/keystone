## Example Project - Extend Prisma Schema

This project implements an example of mutating the Prisma Schema to:

- Set the Prisma Binary Target;
- Add a multi-column column unique constraint to a list; and
- Add a NOT NULL relationship field

These show three separate ways of mutating the Prisma Schema see `keystone.ts` and `schema.ts`.

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

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/extend-prisma-schema>. You can also fork this sandbox to make your own changes.
