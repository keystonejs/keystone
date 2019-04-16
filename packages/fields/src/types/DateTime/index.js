import { DateTime, MongoDateTimeInterface, KnexDateTimeInterface } from './Implementation';
import { importView } from '@keystone-alpha/build-field-types';

export default {
  type: 'DateTime',
  implementation: DateTime,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoDateTimeInterface,
    knex: KnexDateTimeInterface,
  },
};
