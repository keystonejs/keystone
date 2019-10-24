import { Decimal, MongoDecimalInterface, KnexDecimalInterface } from './Implementation';
import { importView } from '@keystonejs/build-field-types';

export default {
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
