const { MongoTextInterface } = require('../Text/Implementation');
const { Content } = require('./Implementation');

module.exports = {
  type: 'Content',
  implementation: Content,
  views: {
    Controller: require.resolve('../Text/Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
  },
};
