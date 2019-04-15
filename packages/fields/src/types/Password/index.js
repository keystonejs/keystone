import { Password, MongoPasswordInterface, KnexPasswordInterface } from './Implementation';
import path from 'path';

module.exports = {
  type: 'Password',
  implementation: Password,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoPasswordInterface,
    knex: KnexPasswordInterface,
  },
};
