import { Uuid, KnexUuidInterface } from './Implementation';
import { importView } from '@keystone-alpha/build-field-types';

export default {
  type: 'Uuid',
  implementation: Uuid,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
  },
  adapters: {
    knex: KnexUuidInterface,
  },
};
