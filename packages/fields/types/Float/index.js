const { Float, MongoFloatInterface, KnexFloatInterface } = require('./Implementation');

module.exports = {
  type: 'Float',
  implementation: Float,
  views: {
    Controller: '@keystone-alpha/fields/types/Float/views/Controller',
    Field: '@keystone-alpha/fields/types/Float/views/Field',
    Filter: '@keystone-alpha/fields/types/Float/views/Filter',
  },
  adapters: {
    mongoose: MongoFloatInterface,
    knex: KnexFloatInterface,
  },
};
