const path = require('path');
const { Select, MongoSelectInterface } = require('./Implementation');

module.exports = {
  type: 'Select',
  implementation: Select,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, './views/Filter'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoSelectInterface,
  },
};
