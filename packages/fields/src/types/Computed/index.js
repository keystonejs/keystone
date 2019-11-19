import { Computed, MongoComputedInterface, KnexComputedInterface } from './Implementation';
import { importView } from '@keystonejs/build-field-types';

export default {
  type: 'Computed',
  implementation: Computed,
  views: {
    Controller: importView('./views/Controller'),
    Cell: importView('./views/Cell'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
  },
  adapters: {
    mongoose: MongoComputedInterface,
    knex: KnexComputedInterface,
  },
};
