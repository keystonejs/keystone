const { File, MongoFileInterface, KnexFileInterface } = require('./Implementation');
const path = require('path');

module.exports = {
  type: 'File',
  implementation: File,
  views: {
    Controller: path.join(__dirname, './Controller'),
    Field: path.join(__dirname, './views/Field'),
    Cell: path.join(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoFileInterface,
    knex: KnexFileInterface,
  },
};
