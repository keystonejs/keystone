import { Integer, MongoIntegerInterface, KnexIntegerInterface } from './Implementation';
import path from 'path';

module.exports = {
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
