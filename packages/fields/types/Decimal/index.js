const { Decimal, MongoDecimalInterface, KnexDecimalInterface } = require('./Implementation');

module.exports = {
  type: 'Decimal',
  implementation: Decimal,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
  },
  adapters: {
    mongoose: MongoDecimalInterface,
    knex: KnexDecimalInterface,
  },
};
