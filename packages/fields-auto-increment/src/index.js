import {
  AutoIncrementImplementation,
  KnexAutoIncrementInterface,
  PrismaAutoIncrementInterface,
} from './Implementation';
import { Integer } from '@keystonejs/fields';

export const AutoIncrement = {
  type: 'AutoIncrement',
  implementation: AutoIncrementImplementation,
  views: {
    Controller: Integer.views.Controller,
    Field: Integer.views.Field,
    Filter: Integer.views.Filter,
  },
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
