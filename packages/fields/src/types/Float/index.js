import { Float, MongoFloatInterface, KnexFloatInterface } from './Implementation';
import path from 'path';

module.exports = {
  type: 'Float',
  implementation: Float,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
  },
  adapters: {
    mongoose: MongoFloatInterface,
    knex: KnexFloatInterface,
  },
};
