const path = require('path');
const { Text, MongoTextInterface } = require('../Text/Implementation');

module.exports = {
  type: 'Url',
  implementation: Text,
  views: {
    Controller: path.resolve(__dirname, '../Text/Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, '../Text/views/Filter'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoTextInterface,
  },
};
