import { graphql } from '@keystone-6/core';

export const extendGraphqlSchema = graphql.extend(base => {
  const Statistics = graphql.object<{ authorId: string }>()({
    name: 'Statistics',
    fields: {
      draft: graphql.field({
        type: graphql.Int,
        resolve({ authorId }, args, context) {
          return context.query.Post.count({
            where: { author: { id: { equals: authorId } }, status: { equals: 'draft' } },
          });
        },
      }),
      published: graphql.field({
        type: graphql.Int,
        resolve({ authorId }, args, context) {
          return context.query.Post.count({
            where: { author: { id: { equals: authorId } }, status: { equals: 'published' } },
          });
        },
      }),
      latest: graphql.field({
        type: base.object('Post'),
        async resolve({ authorId }, args, context) {
          const [post] = await context.db.Post.findMany({
            take: 1,
            orderBy: { publishDate: 'desc' },
            where: { author: { id: { equals: authorId } } },
          });
          return post;
        },
      }),
    },
  });
  return {
    mutation: {
      publishPost: graphql.field({
        // base.object will return an object type from the existing schema
        // with the name provided or throw if it doesn't exist
        type: base.object('Post'),
        args: { id: graphql.arg({ type: graphql.nonNull(graphql.ID) }) },
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
    query: {
      recentPosts: graphql.field({
        type: graphql.list(graphql.nonNull(base.object('Post'))),
        args: {
          id: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
          days: graphql.arg({ type: graphql.nonNull(graphql.Int), defaultValue: 7 }),
        },
        resolve(source, { id, days }, context) {
          // Create a date string <days> in the past from now()
          const cutoff = new Date(
            new Date().setUTCDate(new Date().getUTCDate() - days)
          ).toISOString();

          // Note we use `context.db.Post` here as we have a return type
          // of [Post], and this API provides results in the correct format.
          // If you accidentally use `context.query.Post` here you can expect problems
          // when accessing the fields in your GraphQL client.
          return context.db.Post.findMany({
            where: { author: { id: { equals: id } }, publishDate: { gt: cutoff } },
          });
        },
      }),
      stats: graphql.field({
        type: Statistics,
        args: { id: graphql.arg({ type: graphql.nonNull(graphql.ID) }) },
        resolve(source, { id }) {
          return { authorId: id };
        },
      }),
    },
  };
});
