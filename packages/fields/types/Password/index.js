const { Password, MongoPasswordInterface } = require('./Implementation');

module.exports = {
  type: 'Password',
  implementation: Password,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
  },
  adapters: {
    mongoose: MongoPasswordInterface,
  },
};
