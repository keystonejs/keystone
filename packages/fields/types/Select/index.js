const { Select, MongoSelectInterface, KnexSelectInterface } = require('./Implementation');

module.exports = {
  type: 'Select',
  implementation: Select,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoSelectInterface,
    knex: KnexSelectInterface,
  },
};
