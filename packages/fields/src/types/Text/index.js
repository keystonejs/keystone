import { Text, MongoTextInterface, KnexTextInterface, JSONTextInterface, MemoryTextInterface } from './Implementation';
import { importView } from '@keystone-alpha/build-field-types';

export default {
  type: 'Text',
  implementation: Text,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
    json: JSONTextInterface,
    memory: MemoryTextInterface,
  },
};
