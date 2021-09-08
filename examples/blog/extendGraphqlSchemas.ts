import { graphQLSchemaExtension } from "@keystone-next/keystone/schema";

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: `
  input QueryInput {
    field: String,
    relation: String,
    direction: String
  },
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
