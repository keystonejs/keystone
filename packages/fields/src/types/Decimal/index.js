import {
  Decimal,
  MongoDecimalInterface,
  KnexDecimalInterface,
  JSONDecimalInterface,
  MemoryDecimalInterface,
} from './Implementation';
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
    memory: MemoryDecimalInterface,
    json: JSONDecimalInterface,
  },
};
