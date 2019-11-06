import { Text, MongoTextInterface, KnexTextInterface } from '../Text/Implementation';
import { importView } from '@keystonejs/build-field-types';

export default {
  type: 'Url',
  implementation: Text,
  views: {
    Controller: importView('../Text/views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('../Text/views/Filter'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
