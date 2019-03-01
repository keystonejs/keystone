const { Text, MongoTextInterface, KnexTextInterface } = require('../Text/Implementation');
const path = require('path');

module.exports = {
  type: 'Color',
  implementation: Text,
  views: {
    Controller: path.join(__dirname, '../Text/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Cell: path.join(__dirname, './views/Cell'),
    Filter: path.join(__dirname, '../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
