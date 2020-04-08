import { importView } from '@keystonejs/build-field-types';
import {
  Checkbox,
  MongoCheckboxInterface,
  KnexCheckboxInterface,
  JSONCheckboxInterface,
} from './Implementation';

export default {
  type: 'Checkbox',
  implementation: Checkbox,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoCheckboxInterface,
    knex: KnexCheckboxInterface,
    json: JSONCheckboxInterface,
  },
};
