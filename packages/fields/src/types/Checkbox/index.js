import { importView } from '@keystone-alpha/build-field-types';
import { Checkbox, MongoCheckboxInterface, KnexCheckboxInterface } from './Implementation';

export const Checkbox = {
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
  },
};
