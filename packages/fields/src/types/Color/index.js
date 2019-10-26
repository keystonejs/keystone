import { Text, MongoTextInterface, KnexTextInterface } from '../Text/Implementation';
import { importView } from '@keystonejs/build-field-types';

export default {
  type: 'Color',
  implementation: Text,
  views: {
    Controller: importView('../Text/views/Controller'),
    Field: importView('./views/Field'),
    Cell: importView('./views/Cell'),
    Filter: importView('../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
