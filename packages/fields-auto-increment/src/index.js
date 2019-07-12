import { AutoIncrementImplementation, KnexAutoIncrementInterface } from './Implementation';
import { Integer } from '@keystone-alpha/fields';

export let AutoIncrement = {
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
};
