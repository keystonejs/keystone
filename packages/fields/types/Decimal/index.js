const { Decimal, MongoDecimalInterface } = require('./Implementation');

module.exports = {
  type: 'Decimal',
  implementation: Decimal,
  views: {
    Controller: require.resolve(__dirname, './Controller'),
    Field: require.resolve(__dirname, './views/Field'),
    Filter: require.resolve(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoDecimalInterface,
  },
};
