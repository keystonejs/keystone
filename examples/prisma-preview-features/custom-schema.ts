import { graphQLSchemaExtension } from '@keystone-next/keystone';

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: `
    type Query {
      exampleWithPrismaPreviewFeatures: [Task]
    }
  `,
  resolvers: {
    Query: {
      exampleWithPrismaPreviewFeatures: async (root, args, context) => {
        const data = await context.prisma.task.findMany({
          orderBy: {
            assignedTo: {
              name: 'desc',
            },
          },
        });
        return data;
      },
    },
  },
});
