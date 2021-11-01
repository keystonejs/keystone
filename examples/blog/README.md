## Base Project - Blog

This project implements a basic **Blog**, with `Posts` and `Authors`.

Use it as a starting place for learning how to use Keystone.

## Instructions

To run this project:

1. Clone the Keystone repository locally
2. Navigate to this directory `cd examples/blog`
3. Run `yarn install` and then `yarn dev`

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

Congratulations, you're now up and running with Keystone! 🚀

### Optional: add sample data

This example includes sample data. To add it to your database:

1. Ensure you’ve initialised your project with `yarn dev` at least once.
2. Run `yarn seed-data`. This will populate your database with sample content.
3. Run `yarn dev` again to startup Admin UI with sample data in place.

## Next steps

Experiment with the code in this example to see how Keystone works, familiarise yourself with the Admin UI, and learn about the GraphQL Playground.

When you’ve got the hang of this base project, try a [feature project](../) to learn Keystone’s advanced features and take your knowledge to the next level.
