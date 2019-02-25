const { Decimal, MongoDecimalInterface, KnexDecimalInterface } = require('./Implementation');

module.exports = {
  type: 'Decimal',
  implementation: Decimal,
  // Peer Dependency
  views: '@voussoir/admin-view-decimal',
  adapters: {
    mongoose: MongoDecimalInterface,
    knex: KnexDecimalInterface,
  },
};
