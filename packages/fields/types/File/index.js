const { File, MongoFileInterface, KnexFileInterface } = require('./Implementation');

module.exports = {
  type: 'File',
  implementation: File,
  views: {
    Controller: '@keystone-alpha/fields/types/File/views/Controller',
    Field: '@keystone-alpha/fields/types/File/views/Field',
    Cell: '@keystone-alpha/fields/types/File/views/Cell',
  },
  adapters: {
    mongoose: MongoFileInterface,
    knex: KnexFileInterface,
  },
};
