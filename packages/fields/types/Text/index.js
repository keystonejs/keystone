const { Text, MongoTextInterface, KnexTextInterface } = require('./Implementation');
const path = require('path');

module.exports = {
  type: 'Text',
  implementation: Text,
  views: {
    Controller: path.join(__dirname, './Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
