const path = require('path');
const { Select, MongoSelectInterface } = require('./Implementation');

module.exports = {
  type: 'Relationship',
  implementation: Select,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoSelectInterface,
  },
};
