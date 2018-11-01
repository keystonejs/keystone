const path = require('path');
const { Text, MongoTextInterface } = require('../Text/Implementation');

module.exports = {
  type: 'Color',
  implementation: Text,
  views: {
    Controller: path.resolve(__dirname, '../Text/Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Cell: path.resolve(__dirname, './views/Cell'),
    Filter: path.resolve(__dirname, '../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
  },
};
