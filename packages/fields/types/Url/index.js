const { Text, MongoTextInterface, KnexTextInterface } = require('../Text/Implementation');

module.exports = {
  type: 'Url',
  implementation: Text,
  views: {
    Controller: require.resolve('../Text/Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('../Text/views/Filter'),
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
