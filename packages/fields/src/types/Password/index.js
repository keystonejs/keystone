import { Password, MongoPasswordInterface, KnexPasswordInterface } from './Implementation';
import path from 'path';

module.exports = {
  type: 'Password',
  implementation: Password,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
  },
  adapters: {
    mongoose: MongoPasswordInterface,
    knex: KnexPasswordInterface,
  },
};
