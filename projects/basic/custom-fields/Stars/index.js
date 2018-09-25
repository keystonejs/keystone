const path = require('path');
const { Stars, MongoIntegerInterface } = require('./Implementation');

module.exports = {
  type: 'Stars',
  implementation: Stars,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, './views/Filter'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoIntegerInterface,
  },
};
