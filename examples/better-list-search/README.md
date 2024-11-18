## Base Project - Blog

This project implements a basic **Blog**, with `Posts` and `Authors`.

Use it as a starting place for learning how to use Keystone.

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm install` at the root of this repository, then navigate to this directory and run:

```shell
pnpm dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

Congratulations, you're now up and running with Keystone! 🚀

### Optional: add sample data

This example includes sample data. To add it to your database:

1. Ensure you’ve initialised your project with `pnpm dev` at least once.
2. Run `pnpm seed-data`. This will populate your database with sample content.
3. Run `pnpm dev` again to startup Admin UI with sample data in place.

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/usecase-blog>. You can also fork this sandbox to make your own changes.
