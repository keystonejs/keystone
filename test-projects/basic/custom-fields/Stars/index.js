const { Stars, MongoIntegerInterface, KnexIntegerInterface } = require('./Implementation');

module.exports = {
  type: 'Stars',
  implementation: Stars,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoIntegerInterface,
    knex: KnexIntegerInterface,
  },
};
