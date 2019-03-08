const { Select, MongoSelectInterface, KnexSelectInterface } = require('./Implementation');

module.exports = {
  type: 'Select',
  implementation: Select,
  views: {
    Controller: '@keystone-alpha/fields/types/Select/views/Controller',
    Field: '@keystone-alpha/fields/types/Select/views/Field',
    Filter: '@keystone-alpha/fields/types/Select/views/Filter',
    Cell: '@keystone-alpha/fields/types/Select/views/Cell',
  },
  adapters: {
    mongoose: MongoSelectInterface,
    knex: KnexSelectInterface,
  },
};
