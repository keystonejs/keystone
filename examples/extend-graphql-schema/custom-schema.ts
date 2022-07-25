import { graphQLSchemaExtension } from '@keystone-6/core';
import { Context } from '.keystone';

export const extendGraphqlSchema = graphQLSchemaExtension<Context>({
  typeDefs: `
    type Mutation {
      """ Publish a post """
      publishPost(id: ID!): Post

      """ Create or update an author based on email """
      upsertAuthor(where: AuthorWhereUniqueInput!, create: AuthorCreateInput!, update: AuthorUpdateInput!): Author
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
      upsertAuthor: async (root, { where, update, create }, context) => {
        try {
          // we need to await the update here so that if an error is thrown, it's caught
          // by the try catch here and not returned through the graphql api
          return await context.db.Author.updateOne({ where, data: update });
        } catch (updateError: any) {
          // updateOne will fail with the code KS_ACCESS_DENIED if the item isn't found,
          // so we try to create it. If the item does exist, the unique constraint on
          // email will prevent a duplicate being created, and we catch the error
          if (updateError.extensions?.code === 'KS_ACCESS_DENIED') {
            return await context.db.Author.createOne({ data: create });
          }
          throw updateError;
        }
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
});
