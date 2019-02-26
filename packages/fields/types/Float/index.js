const { Float, MongoFloatInterface, KnexFloatInterface } = require('./Implementation');

module.exports = {
  type: 'Float',
  implementation: Float,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
  },
  adapters: {
    mongoose: MongoFloatInterface,
    knex: KnexFloatInterface,
  },
};
