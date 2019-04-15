import { File, MongoFileInterface, KnexFileInterface } from './Implementation';
import path from 'path';

module.exports = {
  type: 'File',
  implementation: File,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Cell: path.join(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoFileInterface,
    knex: KnexFileInterface,
  },
};
