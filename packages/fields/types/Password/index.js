const path = require('path');
const { Password, MongoPasswordInterface } = require('./Implementation');

module.exports = {
  type: 'Password',
  implementation: Password,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoPasswordInterface,
  },
};
