## Base Project - Task Management Application

This base project implements a simple **Task Management** app, with `Tasks` and `People` who can be assigned to tasks.

Use it as a starting place for learning how to use Keystone.

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm install` at the root of the repository then navigate to this directory and run:

```shell
pnpm dev
```

This will start Keystone’s Admin UI at [localhost:3000](http://localhost:3000), where you will see Keystone with minimal sample data.

You can also access Keystone’s GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql) to explore the GraphQL API, and run [queries](https://keystonejs.com/docs/guides/filters) and [mutations](https://keystonejs.com/docs/graphql/overview#mutations) on your data.

Congratulations, you’re now up and running with Keystone! 🚀

### Sample data

This example includes sample data in `example.db` - deleting this file and restarting the dev server will leave you with an empty database.

To re-seed the sample data:
1. Stop the server
2. Run `pnpm seed-data`
3. Restart the server with `pnpm dev` 

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/usecase-todo>. You can also fork this sandbox to make your own changes.
