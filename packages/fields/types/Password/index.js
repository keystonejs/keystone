const { Password, MongoPasswordInterface, KnexPasswordInterface } = require('./Implementation');
const path = require('path');

module.exports = {
  type: 'Password',
  implementation: Password,
  views: {
    Controller: path.join(__dirname, './Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoPasswordInterface,
    knex: KnexPasswordInterface,
  },
};
