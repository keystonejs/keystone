import { Decimal, MongoDecimalInterface, KnexDecimalInterface } from './Implementation';
import { importView } from '@keystone-alpha/build-field-types';

export let Decimal = {
  type: 'Decimal',
  implementation: Decimal,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
  },
  adapters: {
    mongoose: MongoDecimalInterface,
    knex: KnexDecimalInterface,
  },
};
