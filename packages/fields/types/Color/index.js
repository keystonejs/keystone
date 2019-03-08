const { Text, MongoTextInterface, KnexTextInterface } = require('../Text/Implementation');

module.exports = {
  type: 'Color',
  implementation: Text,
  views: {
    Controller: '@keystone-alpha/fields/types/Text/views/Controller',
    Field: '@keystone-alpha/fields/types/Color/views/Field',
    Cell: '@keystone-alpha/fields/types/Color/views/Cell',
    Filter: '@keystone-alpha/fields/types/Text/views/Filter',
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
