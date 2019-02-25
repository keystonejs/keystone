const { File, MongoFileInterface, KnexFileInterface } = require('./Implementation');

module.exports = {
  type: 'File',
  implementation: File,
  // Peer Dependency
  views: '@voussoir/admin-view-file',
  adapters: {
    mongoose: MongoFileInterface,
    knex: KnexFileInterface,
  },
};
