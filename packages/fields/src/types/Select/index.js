import {
  Select,
  MongoSelectInterface,
  KnexSelectInterface,
  JSONSelectInterface,
} from './Implementation';
import { importView } from '@keystonejs/build-field-types';

export default {
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
    json: JSONSelectInterface,
  },
};
