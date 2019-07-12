import { AutoIncrementImplementation, KnexAutoIncrementInterface } from './Implementation';
import { Integer } from '@keystone-alpha/fields';

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
  },

  primaryKeyDefaults: {
    knex: {
      getConfig: () => ({
        type: AutoIncrement,
        gqlType: 'ID',
        isUnique: true,
        knexOptions: { isNotNullable: true },
      }),
    },
  },
};
