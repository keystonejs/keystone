const { Password, MongoPasswordInterface, KnexPasswordInterface } = require('./Implementation');

module.exports = {
  type: 'Password',
  implementation: Password,
  views: {
    Controller: '@keystone-alpha/fields/types/Password/views/Controller',
    Field: '@keystone-alpha/fields/types/Password/views/Field',
    Filter: '@keystone-alpha/fields/types/Password/views/Filter',
  },
  adapters: {
    mongoose: MongoPasswordInterface,
    knex: KnexPasswordInterface,
  },
};
