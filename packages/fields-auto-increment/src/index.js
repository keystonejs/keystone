import {
  AutoIncrementImplementation,
  KnexAutoIncrementInterface,
  PrismaAutoIncrementInterface,
} from './Implementation';

export const AutoIncrement = {
  type: 'AutoIncrement',
  implementation: AutoIncrementImplementation,
  adapters: {
    knex: KnexAutoIncrementInterface,
    prisma: PrismaAutoIncrementInterface,
  },

  primaryKeyDefaults: {
    knex: {
      // Uniqueness, non-nullability and GraphQL type are implied
      getConfig: () => ({ type: AutoIncrement }),
    },
    prisma: {
      // Uniqueness, non-nullability and GraphQL type are implied
      getConfig: () => ({ type: AutoIncrement }),
    },
  },
};
