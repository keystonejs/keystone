const path = require('path');
const { Integer, MongoIntegerInterface } = require('./Implementation');

module.exports = {
  type: 'Integer',
  implementation: Integer,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoIntegerInterface,
  },
};
