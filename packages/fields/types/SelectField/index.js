const { Select, MongoSelectInterface, KnexSelectInterface } = require('./Implementation');

module.exports = {
  type: 'Select',
  implementation: Select,
  // Peer Dependency
  views: '@voussoir/admin-view-select',
  adapters: {
    mongoose: MongoSelectInterface,
    knex: KnexSelectInterface,
  },
};
