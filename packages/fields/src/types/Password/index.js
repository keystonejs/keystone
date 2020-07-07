import { Password, MongoPasswordInterface, KnexPasswordInterface } from './Implementation';
import { importView } from '@keystonejs/build-field-types';

export default {
  type: 'Password',
  implementation: Password,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoPasswordInterface,
    knex: KnexPasswordInterface,
  },
};
