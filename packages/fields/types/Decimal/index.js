const { Decimal, MongoDecimalInterface, KnexDecimalInterface } = require('./Implementation');

module.exports = {
  type: 'Decimal',
  implementation: Decimal,
  views: {
    Controller: '@keystone-alpha/fields/types/Decimal/views/Controller',
    Field: '@keystone-alpha/fields/types/Decimal/views/Field',
    Filter: '@keystone-alpha/fields/types/Decimal/views/Filter',
  },
  adapters: {
    mongoose: MongoDecimalInterface,
    knex: KnexDecimalInterface,
  },
};
