const { Text, MongoTextInterface } = require('../Text/Implementation');

module.exports = {
  type: 'Content',
  implementation: Text,
  views: {
    Controller: require.resolve('../Text/Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
  },
};
