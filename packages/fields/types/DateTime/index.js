const { DateTime, MongoDateTimeInterface, KnexDateTimeInterface } = require('./Implementation');

module.exports = {
  type: 'DateTime',
  implementation: DateTime,
  views: {
    Controller: '@keystone-alpha/fields/types/DateTime/views/Controller',
    Field: '@keystone-alpha/fields/types/DateTime/views/Field',
    Filter: '@keystone-alpha/fields/types/DateTime/views/Filter',
    Cell: '@keystone-alpha/fields/types/DateTime/views/Cell',
  },
  adapters: {
    mongoose: MongoDateTimeInterface,
    knex: KnexDateTimeInterface,
  },
};
