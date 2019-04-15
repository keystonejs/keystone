const { Text, MongoTextInterface, KnexTextInterface } = require('../Text/Implementation');
const path = require('path');

module.exports = {
  type: 'Url',
  implementation: Text,
  views: {
    Controller: path.join(__dirname, '../Text/views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, '../Text/views/Filter'),
    Cell: path.join(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
