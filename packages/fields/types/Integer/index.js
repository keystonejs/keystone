const { Integer, MongoIntegerInterface, KnexIntegerInterface } = require('./Implementation');
const path = require('path');

module.exports = {
  type: 'Integer',
  implementation: Integer,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoIntegerInterface,
    knex: KnexIntegerInterface,
  },
};
