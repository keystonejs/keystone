## Feature Example - Extend GraphQL Schema

This project demonstrates how to extend the GraphQL API provided by Keystone with custom queries and mutations.
It builds on the [Blog](../blog) starter project.

## Instructions

To run this project, clone the Keystone repository locally, run `yarn` at the root of the repository then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

This project demonstrates how to extend the GraphQL API provided by Keystone with custom queries and mutations.
Schema extensions are set using the [`extendGraphqlSchema`](https://keystonejs.com/docs/apis/config#extend-graphql-schema) config option.

The function `graphQLSchemaExtension` accepts a `typeDefs` string, which lets you define your GraphQL types, and a `resolvers` object, which lets your define resolvers for your types.

The Apollo docs contain more information on GraphQL [types](https://www.apollographql.com/docs/apollo-server/schema/schema/) and [resolvers](https://www.apollographql.com/docs/apollo-server/data/resolvers/).

### Custom mutation

We add a custom mutation to our schema using `type Mutation` in the `typeDefs`, and defining `resolvers.Mutation`.

```typescript
  extendGraphqlSchema: graphQLSchemaExtension({
    typeDefs: `
      type Mutation {
        """ Publish a post """
        publishPost(id: ID!): Post
      }`,
    resolvers: {
      Mutation: {
        publishPost: (root, { id }, context) => {
          return context.db.Post.updateOne({
            id,
            data: { status: 'published', publishDate: new Date().toUTCString() },
          });
        },
      },
    },
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

Note that we're not doing any actual fetching inside `Query.stats`, we're doing all the fetching inside the fields of `Statistics` because inside of `Query.stats` we don't know what fields the user has requested. By fetching the data inside the individual field resolvers, we'll only fetch the data when the user has actually requested it.

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
        stats: async (root, { id }) => {
          return { authorId: id };
        },
      },
      Statistics: {
        // The stats resolver returns an object which is passed to this resolver as
        // the root value. We use that object to further resolve ths specific fields.
        // In this case we want to take root.authorId and get the latest post for that author
        //
        // As above we use the context.db.Post API to achieve this.
        latest: async (val, args, context) => {
          const [post] = await context.db.Post.findMany({
            take: 1,
            orderBy: { publishDate: 'desc' },
            where: { author: { id: { equals: val.authorId } } },
          });
          return post;
        },
        draft: (val, args, context) => {
          return context.query.Post.count({
            where: { author: { id: { equals: val.authorId } }, status: { equals: 'draft' } },
          });
        },
        published: (val, args, context) => {
          return context.query.Post.count({
            where: { author: { id: { equals: val.authorId } }, status: { equals: 'published' } },
          });
        },
      },
    },
  }),
```
