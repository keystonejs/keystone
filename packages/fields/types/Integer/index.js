const { Integer, MongoIntegerInterface, KnexIntegerInterface } = require('./Implementation');

module.exports = {
  type: 'Integer',
  implementation: Integer,
  views: {
    Controller: '@keystone-alpha/fields/types/Integer/views/Controller',
    Field: '@keystone-alpha/fields/types/Integer/views/Field',
    Filter: '@keystone-alpha/fields/types/Integer/views/Filter',
  },
  adapters: {
    mongoose: MongoIntegerInterface,
    knex: KnexIntegerInterface,
  },
};
