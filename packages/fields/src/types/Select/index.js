import { Select, MongoSelectInterface, KnexSelectInterface } from './Implementation';
import path from 'path';

module.exports = {
  type: 'Select',
  implementation: Select,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoSelectInterface,
    knex: KnexSelectInterface,
  },
};
