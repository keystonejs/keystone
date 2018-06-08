const path = require('path');
const { Select, MongoSelectInterface } = require('./Implementation');

module.exports = {
  type: 'Select',
  implementation: Select,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
  },
  adapters: {
    mongoose: MongoSelectInterface,
  },
};
