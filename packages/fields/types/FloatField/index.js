const { Float, MongoFloatInterface, KnexFloatInterface } = require('./Implementation');

module.exports = {
  type: 'Float',
  implementation: Float,
  // Peer Dependency
  views: '@voussoir/admin-view-float',
  adapters: {
    mongoose: MongoFloatInterface,
    knex: KnexFloatInterface,
  },
};
