const { DateTime, MongoDateTimeInterface, KnexDateTimeInterface } = require('./Implementation');
const path = require('path');

module.exports = {
  type: 'DateTime',
  implementation: DateTime,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
    Cell: path.join(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoDateTimeInterface,
    knex: KnexDateTimeInterface,
  },
};
