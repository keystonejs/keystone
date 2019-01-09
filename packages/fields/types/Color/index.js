const { Text, MongoTextInterface, KnexTextInterface } = require('../Text/Implementation');

module.exports = {
  type: 'Color',
  implementation: Text,
  views: {
    Controller: require.resolve('../Text/Controller'),
    Field: require.resolve('./views/Field'),
    Cell: require.resolve('./views/Cell'),
    Filter: require.resolve('../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
