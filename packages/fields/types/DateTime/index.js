const path = require('path');
const { DateTime, MongoDateTimeInterface } = require('./Implementation');

module.exports = {
  type: 'DateTime',
  implementation: DateTime,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, './views/Filter'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoDateTimeInterface,
  },
};
