const { DateTime, MongoDateTimeInterface } = require('./Implementation');

module.exports = {
  type: 'DateTime',
  implementation: DateTime,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoDateTimeInterface,
  },
};
