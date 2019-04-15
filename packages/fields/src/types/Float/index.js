import { Float, MongoFloatInterface, KnexFloatInterface } from './Implementation';
import path from 'path';

module.exports = {
  type: 'Float',
  implementation: Float,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoFloatInterface,
    knex: KnexFloatInterface,
  },
};
