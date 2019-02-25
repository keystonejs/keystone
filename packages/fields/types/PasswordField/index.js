const { Password, MongoPasswordInterface, KnexPasswordInterface } = require('./Implementation');

module.exports = {
  type: 'Password',
  implementation: Password,
  // Peer Dependency
  views: '@voussoir/admin-view-password',
  adapters: {
    mongoose: MongoPasswordInterface,
    knex: KnexPasswordInterface,
  },
};
