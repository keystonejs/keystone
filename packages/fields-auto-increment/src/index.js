import { AutoIncrementImplementation, PrismaAutoIncrementInterface } from './Implementation';

export const AutoIncrement = {
  type: 'AutoIncrement',
  implementation: AutoIncrementImplementation,
  adapters: {
    prisma: PrismaAutoIncrementInterface,
  },

  primaryKeyDefaults: {
    prisma: {
      // Uniqueness, non-nullability and GraphQL type are implied
      getConfig: () => ({ type: AutoIncrement }),
    },
  },
};
