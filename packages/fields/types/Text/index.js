const { Text, MongoTextInterface } = require('./Implementation');

module.exports = {
  type: 'Text',
  implementation: Text,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
  },
};
