import { graphQLSchemaExtension } from '@keystone-6/core';

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: `
    type Mutation {
      """ Publish a post """
      publishPost(id: ID!): Post
    }

    type Query {
      """ Return all posts for a user from the last <days> days """
      recentPosts(id: ID!, days: Int! = 7): [Post]

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
    Mutation: {
      publishPost: (root, { id }, context) => {
        // Note we use `context.db.Post` here as we have a return type
        // of Post, and this API provides results in the correct format.
        // If you accidentally use `context.query.Post` here you can expect problems
        // when accessing the fields in your GraphQL client.
        return context.db.Post.updateOne({
          where: { id },
          data: { status: 'published', publishDate: new Date().toUTCString() },
        });
      },
    },
    Query: {
      recentPosts: (root, { id, days }, context) => {
        // Create a date string <days> in the past from now()
        const cutoff = new Date(
          new Date().setUTCDate(new Date().getUTCDate() - days)
        ).toUTCString();

        // Note we use `context.db.Post` here as we have a return type
        // of [Post], and this API provides results in the correct format.
        // If you accidentally use `context.query.Post` here you can expect problems
        // when accessing the fields in your GraphQL client.
        return context.db.Post.findMany({
          where: { author: { id: { equals: id } }, publishDate: { gt: cutoff } },
        });
      },
      stats: async (root, { id }, context) => {
        const draft = await context.query.Post.count({
          where: { author: { id: { equals: id } }, status: { equals: 'draft' } },
        });
        const published = await context.query.Post.count({
          where: { author: { id: { equals: id } }, status: { equals: 'published' } },
        });
        const { posts } = await context.query.Author.findOne({
          where: { id },
          query: 'posts(take: 1, orderBy: { publishDate: desc }) { id }',
        });
        return { draft, published, latestPostId: posts ? posts[0].id : null };
      },
    },
    Statistics: {
      // The stats resolver returns an object which is passed to this resolver as
      // the root value. We use that object to further resolve ths specific fields.
      // In this case we want to take root.latestPostId and resolve it as a Post object
      //
      // As above we use the context.db.Post API to achieve this.
      latest: (root, args, context) =>
        context.db.Post.findOne({ where: { id: root.latestPostId } }),
      // We don't need to define resolvers for draft and published, as apollo will
      // return root.draft and root.published respectively.
    },
  },
});
