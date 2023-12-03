## Feature Example - Graphql types with ts-gql

This project demonstrates how to generate GraphQL types using ts-gql for `context.graphql` in a Keystone project
It builds on the [Virtual Field](../virtual-field) starter project.

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm install` at the root of the repository then navigate to this directory and run:

```shell
pnpm dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

This project demonstrates how to use `context.graphql` with [ts-gql](https://github.com/Thinkmill/ts-gql).
It uses the `graphql` export from `@keystone-6/core` to define the GraphQL schema used by the virtual fields.

### `authorName`

The `authorName` field shows how to use the `virtual` field to return some derived data from `context.graphql.run` with the correct type returned.

```ts
authorName: virtual({
  field: graphql.field({
    type: graphql.String,
    async resolve(item, args, _context) {
      const context = _context as Context;
      const POST_AUTHOR_QUERY = gql`
        query POST_AUTHOR_QUERY($id: ID!) {
          post(where: { id: $id }) {
            id
            author {
              id
              name
            }
          }
        }
      ` as import('./__generated__/ts-gql/POST_AUTHOR_QUERY').type;
      // data here is strongly typed
      const data = await context.graphql.run({
        query: POST_AUTHOR_QUERY,
        variables: { id: item.id },
      });
      const author = data?.post?.author;
      return author && author.name;
    },
  }),
}),
```

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/graphql-ts-gql>. You can also fork this sandbox to make your own changes.
