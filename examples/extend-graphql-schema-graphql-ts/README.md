## Feature Example - Extend GraphQL Schema GraphQL TS

This project demonstrates how to extend the GraphQL API provided by Keystone with custom queries and mutations using [graphql-ts](https://github.com/Thinkmill/graphql-ts).
It builds on the [Blog](../blog) starter project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a Apollo Sandbox at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

This project demonstrates how to extend the GraphQL API provided by Keystone with custom queries and mutations.
Schema extensions are set using the [`extendGraphqlSchema`](https://keystonejs.com/docs/apis/config#extend-graphql-schema) config option.

The function `graphql.extend` allows you to extend the existing query and mutation types and define new types or use existing type your extension.

See the [`@graphql-ts/schema`](https://docsmill.dev/npm/@graphql-ts/schema) and [`@graphql-ts/extend`](https://docsmill.dev/npm/@graphql-ts/extend) docs for more information.

### Custom mutation

We add a custom mutation to our schema using `type Mutation` in the `typeDefs`, and defining `resolvers.Mutation`.

```typescript
  extendGraphqlSchema: graphql.extend(base => {
  return {
    mutation: {
      publishPost: graphql.field({
        description: 'Publish a post',
        type: base.object('Post'),
        args: { id: graphql.arg({ type: graphql.ID }) },
        resolve(source, { id }, context) {
          // Note we use `context.db.Post` here as we have a return type
          // of Post, and this API provides results in the correct format.
          // If you accidentally use `context.query.Post` here you can expect problems
          // when accessing the fields in your GraphQL client.
          return context.db.Post.updateOne({
            where: { id },
            data: { status: 'published', publishDate: new Date().toISOString() },
          });
        },
      }),
    },
  };
}),
```

### Custom query

We add a custom query to our schema using `type Query` in the `typeDefs`, and defining `resolvers.Query`.

```typescript
  extendGraphqlSchema: graphQLSchemaExtension({
    typeDefs: `
      type Query {
        """ Return all posts for a user from the last <days> days """
        recentPosts(id: ID!, days: Int! = 7): [Post]
      }`,
    resolvers: {
      Query: {
        recentPosts: (root, { id, days }, context) => {
          const cutoff = new Date(
            new Date().setUTCDate(new Date().getUTCDate() - days)
          ).toUTCString();
          return context.db.Post.findMany({
            where: { author: { id }, publishDate_gt: cutoff },
          });
        },
      },
    },
  }),
```

### Custom type

We add a custom type to our schema using `type Statisics` in the `typeDefs`, and defining `resolvers.Statisics`.

```typescript
  extendGraphqlSchema: graphQLSchemaExtension({
    typeDefs: `
      type Query {
        """ Compute statistics for a user """
        stats(id: ID!): Statistics

      }

      """ A custom type to represent statistics for a user """
      type Statistics {
        draft: Int
        published: Int
        latest: Post
      }`,
    resolvers: {
      Query: {
        stats: async (root, { id }, context) => {
          const draft = await context.query.Post.count({
            where: { author: { id }, status: 'draft' },
          });
          const published = await context.query.Post.count({
            where: { author: { id }, status: 'published' },
          });
          const { posts } = await context.query.Author.findOne({
            where: { id },
            query: 'posts(take: 1, orderBy: { publishDate: desc }) { id }',
          });
          return { draft, published, latestPostId: posts ? posts[0].id : null };
        },
      },
      Statistics: {
        latest: (root, args, context) =>
          context.db.Post.findOne({ where: { id: root.latestPostId } }),
      },
    },
  }),
```
