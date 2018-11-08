const { Integer, MongoIntegerInterface } = require('./Implementation');

module.exports = {
  type: 'Integer',
  implementation: Integer,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
  },
  adapters: {
    mongoose: MongoIntegerInterface,
  },
};
