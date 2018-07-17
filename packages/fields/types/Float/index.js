const path = require('path');
const { Float, MongoFloatInterface } = require('./Implementation');

module.exports = {
  type: 'Float',
  implementation: Float,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoFloatInterface,
  },
};
