import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: `
    type Query {
      exampleWithPrismaPreviewFeatures: [Post]
    }
  `,
  resolvers: {
    Query: {
      exampleWithPrismaPreviewFeatures: async (root, args, context) => {
        const data = await context.prisma.post.findMany({
          orderBy: {
            author: {
              name: 'desc'
            }
          }
        });
        return data;
      },
    },
  },
});
