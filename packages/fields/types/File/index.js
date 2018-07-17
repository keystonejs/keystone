const path = require('path');
const { File, MongoFileInterface } = require('./Implementation');

module.exports = {
  type: 'File',
  implementation: File,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoFileInterface,
  },
};
