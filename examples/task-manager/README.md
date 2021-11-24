## Base Project - Task Manager

This base project implements a simple **Task Management** app, with `Tasks` and `People` who can be assigned to tasks.

Use it as a starting place for learning how to use Keystone.

## Instructions

To run this project, clone the Keystone repository locally, run `yarn` at the root of the repository then navigate to this directory and run:

```shell
yarn dev
```

This will start Keystone’s Admin UI at [localhost:3000](http://localhost:3000), where you can add items to an empty database.

You can also access Keystone’s GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql) to explore the GraphQL API, and run [queries](https://keystonejs.com/docs/guides/filters) and [mutations](https://keystonejs.com/docs/apis/graphql#mutations) on your data.

Congratulations, you’re now up and running with Keystone! 🚀

### Optional: add sample data

This example includes sample data. To add it to your database:

1. Ensure you’ve initialised your project with `yarn dev` at least once.
2. Run `yarn seed-data`. This will populate your database with sample content.
3. Run `yarn dev` again to startup Admin UI with sample data in place.

## Next steps

Experiment with the code in this example to see how Keystone works, familiarise yourself with the Admin UI, and learn about the GraphQL Playground.

When you’ve got the hang of this base project, try a [feature project](../) to learn Keystone’s advanced features and take your knowledge to the next level.
