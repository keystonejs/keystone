import { Integer, MongoIntegerInterface, KnexIntegerInterface } from './Implementation';
import { importView } from '@keystonejs/build-field-types';

export default {
  type: 'Integer',
  implementation: Integer,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
  },
  adapters: {
    mongoose: MongoIntegerInterface,
    knex: KnexIntegerInterface,
  },
};
