import { File, MongoFileInterface, KnexFileInterface } from './Implementation';
import { importView } from '@keystonejs/build-field-types';

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
