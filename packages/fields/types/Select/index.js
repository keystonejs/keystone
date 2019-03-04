const { Select, MongoSelectInterface, KnexSelectInterface } = require('./Implementation');
const path = require('path');

module.exports = {
  type: 'Select',
  implementation: Select,
  views: {
    Controller: path.join(__dirname, './Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
    Cell: path.join(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoSelectInterface,
    knex: KnexSelectInterface,
  },
};
