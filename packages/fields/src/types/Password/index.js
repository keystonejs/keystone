import { Password, MongoPasswordInterface, KnexPasswordInterface } from './Implementation';
import { importView } from '@keystone-alpha/build-field-types';

export default {
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
