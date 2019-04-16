import { Text, MongoTextInterface, KnexTextInterface } from './Implementation';
import path from 'path';

module.exports = {
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
  },
};
