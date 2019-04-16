import { File, MongoFileInterface, KnexFileInterface } from './Implementation';
import { importView } from '@keystone-alpha/build-field-types';

export default {
  type: 'File',
  implementation: File,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoFileInterface,
    knex: KnexFileInterface,
  },
};
