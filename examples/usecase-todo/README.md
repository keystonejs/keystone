## Base Project - Task Management Application

This base project implements a simple **Task Management** app, with `Tasks` and `People` who can be assigned to tasks.

Use it as a starting place for learning how to use Keystone.

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm install` at the root of the repository then navigate to this directory and run:

```shell
pnpm dev
```

This will start Keystone’s Admin UI at [localhost:3000](http://localhost:3000), where you can add items to an empty database.

You can also access Keystone’s GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql) to explore the GraphQL API, and run [queries](https://keystonejs.com/docs/guides/filters) and [mutations](https://keystonejs.com/docs/graphql/overview#mutations) on your data.

Congratulations, you’re now up and running with Keystone! 🚀

### Optional: add sample data

This example includes sample data. To add it to your database:

1. Ensure you’ve initialised your project with `pnpm dev` at least once.
2. Run `pnpm seed-data`. This will populate your database with sample content.
3. Run `pnpm dev` again to startup Admin UI with sample data in place.
